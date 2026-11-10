import { NextResponse } from "next/server";
import { ai, MODEL } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

// Model chính + model dự phòng (không bắt buộc), ví dụ trong .env.local:
// GEMINI_FALLBACK_MODELS=ten-model-1,ten-model-2
const MODELS = [MODEL, ...(process.env.GEMINI_FALLBACK_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean)];
const noThinking = new Set<string>();
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
  for (const model of quick ? list.slice(0, 1) : list) {
    for (const wait of quick ? [0] : [0, 1000, 3000]) {
      if (wait) await sleep(wait);
      try {
        // Giảm "suy nghĩ" để trả lời nhanh hơn; model không hỗ trợ thì gọi lại không kèm tùy chọn này
        const thinking = process.env.GEMINI_THINKING ?? "low";
        if (thinking && !noThinking.has(model)) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await ai.models.generateContent({ model, ...params, config: { ...(params.config || {}), thinkingConfig: { thinkingLevel: thinking } } } as any);
          } catch (e) {
            if (statusOf(e) !== 400 && !/thinking/i.test(String((e as Error)?.message))) throw e;
            noThinking.add(model);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await ai.models.generateContent({ model, ...params } as any);
      } catch (e) {
        last = e;
        if (isQuota(e)) break; // hết lượt ở model này: chuyển sang model dự phòng nếu có
        if (!isBusy(e)) throw e; // lỗi key, model sai... thì không thử lại
      }
    }
  }
  throw last;
}

// GET: kiểm tra key và tên model (không tốn lượt gọi sinh nội dung)
export async function GET() {
  if (!(await requireUser())) return NextResponse.json({ ok: false, error: "Chưa đăng nhập" }, { status: 401 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ ok: false, error: "Chưa có GEMINI_API_KEY trong .env.local" });
  try {
    await Promise.race([ai.models.get({ model: MODEL }), new Promise((_, rej) => setTimeout(() => rej(new Error("503 timeout UNAVAILABLE")), 8000))]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isBusy(e)) return NextResponse.json({ ok: true, busy: true, error: errMsg(e) });
    return NextResponse.json({ ok: false, error: errMsg(e) });
  }
}

// POST: { system, contents, json } -> { text }
export async function POST(req: Request) {
  if (!(await requireUser())) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const { system, contents, json, heavy } = await req.json();
  try {
    const res = await generate({
      contents,
      config: { systemInstruction: system, temperature: json ? 0.3 : 0.7, ...(json ? { responseMimeType: "application/json" } : {}) },
    }, false, !!heavy);
    return NextResponse.json({ text: res.text ?? "" });
  } catch (e) {
    return NextResponse.json({ error: errMsg(e), busy: isBusy(e), quota: isQuota(e) }, { status: isQuota(e) ? 429 : 502 });
  }
}
