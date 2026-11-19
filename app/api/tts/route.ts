import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* GIỌNG ĐỌC AI (Google Cloud Text-to-Speech, giọng WaveNet) + LƯU FILE VÀO SUPABASE STORAGE
   GET /api/tts?t=<câu>&l=en|vi&g=f|m  → { url } file MP3 (có sẵn thì trả ngay, chưa có thì nhờ Google đọc 1 lần rồi lưu)
   GET /api/tts?check=1                → { ok } máy chủ đã cài giọng AI chưa
   Mỗi câu chỉ tạo 1 lần cho mọi người dùng → gần như luôn nằm trong hạn mức miễn phí 4 triệu ký tự/tháng của WaveNet. */
const BUCKET = "tts";
const VOICES: Record<string, Record<string, string>> = {
  en: { f: process.env.GOOGLE_TTS_VOICE_EN_F || "en-US-Wavenet-F", m: process.env.GOOGLE_TTS_VOICE_EN_M || "en-US-Wavenet-D" },
  vi: { f: process.env.GOOGLE_TTS_VOICE_VI_F || "vi-VN-Wavenet-A", m: process.env.GOOGLE_TTS_VOICE_VI_M || "vi-VN-Wavenet-B" },
};
const DAY_CAP = Number(process.env.TTS_DAILY_CHAR_LIMIT || 120000); // ~3,6 triệu ký tự/tháng: dưới hạn mức miễn phí
const key = () => process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY || "";
const bad = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });

export async function GET(req: Request) {
  const u = new URL(req.url);
  if (u.searchParams.get("check")) return NextResponse.json({ ok: !!key() && !!process.env.SUPABASE_SERVICE_ROLE_KEY });
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return bad("Chưa đăng nhập", 401);
  if (!key()) return bad("Chưa cài GOOGLE_TTS_API_KEY", 503);

  const text = (u.searchParams.get("t") || "").replace(/\s+/g, " ").trim().slice(0, 400);
  const lang = u.searchParams.get("l") === "vi" ? "vi" : "en", g = u.searchParams.get("g") === "m" ? "m" : "f", slow = u.searchParams.get("s") === "1";
  const speakingRate = slow ? 0.7 : 1;
  if (!text || !/[\p{L}\d]/u.test(text)) return bad("Câu trống");
  const voice = VOICES[lang][g];
  const hash = createHash("sha256").update(voice + "|" + (slow ? "slow|" : "") + text).digest("hex").slice(0, 40);
  const path = `${lang}/${voice}${slow ? "-slow" : ""}/${hash}.mp3`;
  const db = createAdminClient();
  const pub = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  // 1) Đã có file → trả ngay
  try { const h = await fetch(pub, { method: "HEAD" }); if (h.ok) return NextResponse.json({ url: pub, cached: true }); } catch {}

  // 2) Giới hạn số ký tự mỗi ngày (bảo vệ hạn mức miễn phí)
  const day = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  const { data: use } = await db.from("tts_usage").select("chars").eq("day", day).maybeSingle();
  if ((use?.chars || 0) + text.length > DAY_CAP) return bad("Hôm nay đã dùng hết lượt giọng AI, tạm dùng giọng của máy", 429);

  // 3) Nhờ Google đọc
  let audio: string | undefined;
  try {
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key())}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: { text }, voice: { languageCode: lang === "vi" ? "vi-VN" : "en-US", name: voice }, audioConfig: { audioEncoding: "MP3", speakingRate } }),
    });
    const j = await r.json();
    if (!r.ok) return bad("Google: " + (j?.error?.message || r.status), r.status === 429 ? 429 : 502);
    audio = j.audioContent;
  } catch (e) { return bad("Không gọi được Google: " + (e as Error).message, 502); }
  if (!audio) return bad("Google không trả âm thanh", 502);

  // 4) Lưu vào Supabase Storage để lần sau dùng lại
  const { error } = await db.storage.from(BUCKET).upload(path, Buffer.from(audio, "base64"), { contentType: "audio/mpeg", upsert: true, cacheControl: "31536000" });
  await db.from("tts_usage").upsert({ day, chars: (use?.chars || 0) + text.length });
  if (error) return NextResponse.json({ url: "data:audio/mpeg;base64," + audio, cached: false, warn: error.message }); // chưa tạo bucket: vẫn đọc được
  return NextResponse.json({ url: pub, cached: false });
}
