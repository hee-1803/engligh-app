import { NextResponse } from "next/server";
import { ai, MODEL } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { askFallback, probeFallbacks, PROVIDERS } from "@/lib/fallback-ai";

// Model chính + model dự phòng (không bắt buộc), ví dụ trong .env.local:
// GEMINI_FALLBACK_MODELS=ten-model-1,ten-model-2
const MODELS = [MODEL, ...(process.env.GEMINI_FALLBACK_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean)];
const noThinking = new Set<string>();
// Model đã hết lượt → tạm bỏ qua 30 phút
const exhausted = new Map<string, number>();
const isOut = (m: string) => (exhausted.get(m) || 0) > Date.now();
// Tự tìm các model Gemini khác mà key được dùng (mỗi model có hạn mức miễn phí riêng)
let lastModel = MODEL;
let found: { at: number; list: string[] } | null = null;
async function discoverModels(): Promise<string[]> {
  if (found && Date.now() - found.at < 6 * 3600e3) return found.list;
  const ids: string[] = [];
  try {
    const pager = await ai.models.list({ config: { pageSize: 100 } });
    for await (const m of pager) {
      const id = String(m.name || "").replace(/^models\//, "");
      const acts = (m as { supportedActions?: string[] }).supportedActions || [];
      if (!/^gemini/.test(id) || (acts.length && !acts.includes("generateContent"))) continue;
      if (/embed|tts|image|audio|live|vision|robotics|computer|native|aqa|exp-\d|learnlm/i.test(id)) continue;
      ids.push(id);
    }
  } catch { /* không lấy được danh sách: chỉ dùng model đã khai báo */ }
  // Ưu tiên: flash → flash-lite → pro; bản mới (số lớn) trước; bản "latest"/ổn định trước bản preview
  const ver = (id: string) => Number((id.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  const tier = (id: string) => (/flash-lite/.test(id) ? 1 : /flash/.test(id) ? 0 : /pro/.test(id) ? 2 : 3);
  ids.sort((a, b) => tier(a) - tier(b) || ver(b) - ver(a) || Number(/preview/.test(a)) - Number(/preview/.test(b)) || a.length - b.length);
  found = { at: Date.now(), list: ids.slice(0, 8) };
  return found.list;
}
// Không chờ Gemini quá lâu: việc nhỏ 20 giây, soạn bài 110 giây
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("504 timeout UNAVAILABLE: Gemini phản hồi quá chậm")), ms))]);
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

const statusOf = (e: unknown) => {
  const s = String((e as Error)?.message ?? e);
  const m = s.match(/"code":\s*(\d{3})/) || s.match(/\b(429|500|503|504)\b/);
  return m ? Number(m[1]) : 0;
};
const isQuota = (e: unknown) => statusOf(e) === 429 || /RESOURCE_EXHAUSTED|quota/i.test(String((e as Error)?.message ?? e));
const isBusy = (e: unknown) => !isQuota(e) && ([500, 503, 504].includes(statusOf(e)) || /UNAVAILABLE|overloaded|high demand/i.test(String((e as Error)?.message ?? e)));

function errMsg(e: unknown) {
  const s = String((e as Error)?.message ?? e);
  if (s.includes("free tier is not available")) return "Project Gemini này không có free tier. Hãy tạo key bằng Gmail khác trên aistudio.google.com/apikey";
  if (s.includes("API key not valid") || s.includes("API_KEY_INVALID")) return "GEMINI_API_KEY không hợp lệ";
  if (s.includes("no longer available") || statusOf(e) === 404) return "Tên model trong GEMINI_MODEL không còn dùng được, hãy đổi model";
  if (isQuota(e)) return "Đã hết lượt gọi Gemini miễn phí (giới hạn theo phút hoặc theo ngày)";
  if (isBusy(e)) return "Máy chủ Gemini đang quá tải, thử lại sau ít phút";
  return s.slice(0, 200);
}

// Gọi Gemini: thử lại khi quá tải (1s, 3s), rồi chuyển sang model dự phòng
// Model nhanh cho việc nhỏ (chấm câu, role-play, tra từ), ví dụ GEMINI_FAST_MODEL=ten-model-flash-lite
const FAST = process.env.GEMINI_FAST_MODEL?.trim();
async function generate(params: { contents: unknown; config?: Record<string, unknown> }, quick = false, heavy = true) {
  let last: unknown;
  const list = !heavy && FAST ? [FAST, ...MODELS.filter((m) => m !== FAST)] : MODELS;
  const ms = heavy ? 110000 : 20000;
  const tryList = list.filter((m) => !isOut(m));
  let i = 0, discovered = false;
  while (true) {
    if (i >= tryList.length) {
      // Hết model đã khai báo (đều hết lượt) → tìm thêm model Gemini khác còn lượt
      if (discovered || !(last === undefined || isQuota(last))) break;
      discovered = true;
      for (const m of await discoverModels()) if (!tryList.includes(m) && !isOut(m)) tryList.push(m);
      if (i >= tryList.length) break;
    }
    const model = tryList[i++]; lastModel = model;
    for (const wait of quick ? [0] : heavy ? [0, 1000, 3000] : [0, 800]) {
      if (wait) await sleep(wait);
      try {
        // Giảm "suy nghĩ" để trả lời nhanh hơn; model không hỗ trợ thì gọi lại không kèm tùy chọn này
        const thinking = process.env.GEMINI_THINKING ?? "low";
        if (thinking && !noThinking.has(model)) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await withTimeout(ai.models.generateContent({ model, ...params, config: { ...(params.config || {}), thinkingConfig: { thinkingLevel: thinking } } } as any), ms);
          } catch (e) {
            if (statusOf(e) !== 400 && !/thinking/i.test(String((e as Error)?.message))) throw e;
            noThinking.add(model);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await withTimeout(ai.models.generateContent({ model, ...params } as any), ms);
      } catch (e) {
        last = e;
        if (isQuota(e)) { exhausted.set(model, Date.now() + 30 * 60e3); break; } // hết lượt ở model này: thử model khác
        if ([400, 403, 404].includes(statusOf(e)) && discovered) break; // model tự tìm không dùng được: bỏ qua
        if (!isBusy(e)) throw e; // lỗi key, model sai... thì không thử lại
      }
    }
  }
  throw last ?? new Error("429 RESOURCE_EXHAUSTED: mọi model Gemini đều đã hết lượt");
}

// GET: kiểm tra key và tên model (không tốn lượt gọi sinh nội dung)
export async function GET(req: Request) {
  if (!(await requireUser())) return NextResponse.json({ ok: false, error: "Chưa đăng nhập" }, { status: 401 });
  // ?probe=1: kiểm tra từng AI (Cài đặt → Trạng thái AI)
  if (new URL(req.url).searchParams.get("probe")) {
    let gem: { name: string; model: string; ok: boolean; error?: string; ms?: number } = { name: "Gemini", model: MODEL, ok: false, error: "Chưa có GEMINI_API_KEY" };
    if (process.env.GEMINI_API_KEY) {
      const t0 = Date.now();
      try {
        await generate({ contents: "Say OK", config: { maxOutputTokens: 5 } }, true, false);
        gem = { name: "Gemini", model: lastModel, ok: true, ms: Date.now() - t0 };
      } catch (e) { gem = { name: "Gemini", model: lastModel, ok: false, error: errMsg(e) }; }
    }
    return NextResponse.json({ list: [gem, ...(await probeFallbacks())] });
  }
  if (!process.env.GEMINI_API_KEY) return NextResponse.json(PROVIDERS.length ? { ok: true, busy: true } : { ok: false, error: "Chưa có GEMINI_API_KEY trong .env.local" });
  try {
    await Promise.race([ai.models.get({ model: MODEL }), new Promise((_, rej) => setTimeout(() => rej(new Error("503 timeout UNAVAILABLE")), 8000))]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isBusy(e) || (PROVIDERS.length && isQuota(e))) return NextResponse.json({ ok: true, busy: true, error: errMsg(e) });
    return NextResponse.json({ ok: false, error: errMsg(e) });
  }
}

// POST: { system, contents, json } -> { text }
export async function POST(req: Request) {
  if (!(await requireUser())) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const { system, contents, json, heavy } = await req.json();
  // Việc nhỏ (chấm câu, role-play, tra từ...) → Groq/OpenRouter trước để giữ lượt Gemini
  // Soạn bài (heavy) → Gemini trước vì soạn bài tốt hơn; Gemini hết lượt thì AI dự phòng soạn thay
  if (!heavy && PROVIDERS.length) {
    try { return NextResponse.json(await askFallback(system, contents, !!json, 25000)); }
    catch (e) { console.warn("AI dự phòng lỗi, thử Gemini:", String((e as Error)?.message ?? e)); }
  }
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("503 UNAVAILABLE no gemini key");
    const res = await generate({
      contents,
      config: { systemInstruction: system, temperature: json ? 0.3 : 0.7, ...(json ? { responseMimeType: "application/json" } : {}) },
    }, PROVIDERS.length > 0 && !heavy, !!heavy);
    return NextResponse.json({ text: res.text ?? "", engine: "Gemini", model: lastModel });
  } catch (e) {
    if (heavy && PROVIDERS.length && (isQuota(e) || isBusy(e))) {
      try { return NextResponse.json(await askFallback(system, contents, !!json, 90000)); }
      catch (e2) { console.warn("AI dự phòng lỗi:", String((e2 as Error)?.message ?? e2)); }
    }
    return NextResponse.json({ error: errMsg(e), busy: isBusy(e), quota: isQuota(e) }, { status: isQuota(e) ? 429 : 502 });
  }
}
