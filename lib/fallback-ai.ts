// AI dự phòng (API kiểu OpenAI): chỉ dùng khi Gemini hết lượt, quá tải hoặc quá chậm
type Provider = { name: string; url: string; key?: string; model: string; headers?: Record<string, string> };

export const PROVIDERS: Provider[] = [
  { name: "Groq", url: "https://api.groq.com/openai/v1/chat/completions", key: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b" },
  { name: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", key: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    headers: { "X-Title": "SEED English" } },
].filter((p) => p.key);

// Model miễn phí hay bị đổi tên/ngừng: khi model đang dùng báo 404, tự tìm model khác còn dùng được
const PREFER = [/gpt-oss-120b/, /llama-4-maverick/, /llama.*70b/, /qwen.*(235|72|32)b|qwen3/, /deepseek/, /llama-4/, /gemma.*27b/, /mistral|mixtral/, /llama/];
const tried = new Map<string, Set<string>>();
async function nextModel(p: Provider): Promise<string | null> {
  const url = p.url.replace(/chat\/completions$/, "models");
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${p.key}` } });
    const d = await r.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ids: string[] = (d?.data || []).filter((m: any) => {
      if (p.name !== "OpenRouter") return m.active !== false && !/whisper|tts|guard|embed|vision-only|playai|orpheus/i.test(m.id);
      return /:free$/.test(m.id) && Number(m?.pricing?.prompt) === 0 && Number(m?.pricing?.completion) === 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).map((m: any) => m.id);
    const bad = tried.get(p.name) || new Set();
    ids = ids.filter((id) => !bad.has(id));
    for (const re of PREFER) { const hit = ids.find((id) => re.test(id.toLowerCase())); if (hit) return hit; }
    return ids[0] || null;
  } catch { return null; }
}
async function callModel(p: Provider, body: Record<string, unknown>, signal: AbortSignal) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(p.url, { method: "POST", signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}`, ...(p.headers || {}) },
      body: JSON.stringify({ ...body, model: p.model }) });
    const d = await r.json().catch(() => ({}));
    const msg = String(d?.error?.message || "");
    if ((r.status === 404 || r.status === 400) && /model|exist|unavailable|decommission|not found/i.test(msg)) {
      if (!tried.has(p.name)) tried.set(p.name, new Set());
      tried.get(p.name)!.add(p.model);
      const m = await nextModel(p);
      if (m) { console.warn(`${p.name}: model ${p.model} không dùng được → chuyển sang ${m}`); p.model = m; continue; }
    }
    return { r, d };
  }
  throw new Error(`${p.name}: không tìm được model miễn phí còn dùng được`);
}

type Part = { text?: string };
type Content = string | { role?: string; parts?: Part[] }[];

// Đổi định dạng tin nhắn của Gemini sang dạng OpenAI
function toMessages(system: string | undefined, contents: Content, json: boolean) {
  const msgs: { role: string; content: string }[] = [];
  const sys = (system || "") + (json ? "\n\nReturn only one valid JSON object, no other text. Keep every language instruction above exactly (English text stays English)." : "");
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
      const base = { messages: toMessages(system, contents, json), temperature: json ? 0.3 : 0.7 };
      let { r, d } = await callModel(p, json ? { ...base, response_format: { type: "json_object" } } : base, ctl.signal);
      // Model không hỗ trợ chế độ JSON → gọi lại thường, rồi tự lọc phần JSON
      if (!r.ok && json && r.status === 400) ({ r, d } = await callModel(p, base, ctl.signal));
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
      const { r, d } = await callModel(p, { messages: [{ role: "user", content: "Say OK" }], max_tokens: 5 }, ctl.signal);
      if (!r.ok) return { name: p.name, model: p.model, ok: false, error: `${r.status}: ${String(d?.error?.message || "lỗi").slice(0, 120)}` };
      return { name: p.name, model: p.model, ok: true, ms: Date.now() - t0 };
    } catch (e) { return { name: p.name, model: p.model, ok: false, error: (e as Error).name === "AbortError" ? "quá chậm" : String((e as Error).message).slice(0, 120) }; }
    finally { clearTimeout(t); }
  }));
}
