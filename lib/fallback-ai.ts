// AI dự phòng (API kiểu OpenAI): chỉ dùng khi Gemini hết lượt, quá tải hoặc quá chậm
type Provider = { name: string; url: string; key?: string; model: string; headers?: Record<string, string> };

export const PROVIDERS: Provider[] = [
  { name: "Groq", url: "https://api.groq.com/openai/v1/chat/completions", key: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile" },
  { name: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", key: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    headers: { "X-Title": "Lo Trinh Tieng Anh" } },
].filter((p) => p.key);

type Part = { text?: string };
type Content = string | { role?: string; parts?: Part[] }[];

// Đổi định dạng tin nhắn của Gemini sang dạng OpenAI
function toMessages(system: string | undefined, contents: Content, json: boolean) {
  const msgs: { role: string; content: string }[] = [];
  const sys = (system || "") + (json ? "\n\nChỉ trả về một đối tượng JSON hợp lệ, không kèm chữ nào khác." : "");
  if (sys.trim()) msgs.push({ role: "system", content: sys });
  if (typeof contents === "string") msgs.push({ role: "user", content: contents });
  else for (const c of contents || []) msgs.push({ role: c.role === "model" ? "assistant" : "user", content: (c.parts || []).map((p) => p.text || "").join("\n") });
  return msgs;
}

export async function askFallback(system: string | undefined, contents: Content, json: boolean, ms: number) {
  let last: unknown = new Error("Chưa có AI dự phòng");
  for (const p of PROVIDERS) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(p.url, {
        method: "POST", signal: ctl.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}`, ...(p.headers || {}) },
        body: JSON.stringify({ model: p.model, messages: toMessages(system, contents, json), temperature: json ? 0.3 : 0.7,
          ...(json ? { response_format: { type: "json_object" } } : {}) }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(`${p.name} ${r.status}: ${d?.error?.message || "lỗi"}`);
      let text: string = d?.choices?.[0]?.message?.content || "";
      if (json) { const m = text.match(/\{[\s\S]*\}/); if (m) text = m[0]; }
      if (!text) throw new Error(`${p.name}: không có nội dung`);
      return { text, engine: p.name };
    } catch (e) { last = e; } finally { clearTimeout(t); }
  }
  throw last;
}

// Kiểm tra nhanh từng AI dự phòng (tốn 1 lượt gọi rất nhỏ)
export async function probeFallbacks() {
  return Promise.all(PROVIDERS.map(async (p) => {
    const t0 = Date.now(), ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(p.url, { method: "POST", signal: ctl.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}`, ...(p.headers || {}) },
        body: JSON.stringify({ model: p.model, messages: [{ role: "user", content: "Say OK" }], max_tokens: 5 }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return { name: p.name, model: p.model, ok: false, error: `${r.status}: ${String(d?.error?.message || "lỗi").slice(0, 120)}` };
      return { name: p.name, model: p.model, ok: true, ms: Date.now() - t0 };
    } catch (e) { return { name: p.name, model: p.model, ok: false, error: (e as Error).name === "AbortError" ? "quá chậm" : String((e as Error).message).slice(0, 120) }; }
    finally { clearTimeout(t); }
  }));
}
