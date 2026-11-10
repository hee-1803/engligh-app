import { NextResponse } from "next/server";

// Dịch ngay trong app. Ưu tiên Google Cloud Translation (cần GOOGLE_TRANSLATE_API_KEY),
// nếu chưa có key hoặc lỗi thì dùng MyMemory (miễn phí, không cần key, giới hạn số ký tự mỗi ngày).
const LANGS = new Set(["en", "vi"]);

export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = (u.searchParams.get("q") || "").trim();
  const sl = u.searchParams.get("sl") || "en", tl = u.searchParams.get("tl") || "vi";
  if (!q || q.length > 1000 || !LANGS.has(sl) || !LANGS.has(tl)) {
    return NextResponse.json({ error: "Nội dung cần dịch không hợp lệ" }, { status: 400 });
  }

  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (key) {
    try {
      const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, source: sl, target: tl, format: "text" }),
      });
      const j = await r.json();
      const text = j?.data?.translations?.[0]?.translatedText;
      if (r.ok && text) return NextResponse.json({ text, engine: "Google Dịch" });
      console.error("Google Translate lỗi:", r.status, j?.error?.message);
    } catch (e) {
      console.error("Google Translate lỗi:", (e as Error).message);
    }
  }

  try {
    const email = process.env.VAPID_SUBJECT?.replace(/^mailto:/, "");
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${sl}|${tl}${email ? `&de=${encodeURIComponent(email)}` : ""}`);
    const j = await r.json();
    const text = j?.responseData?.translatedText;
    if (r.ok && text && Number(j.responseStatus) === 200) return NextResponse.json({ text, engine: "MyMemory" });
    return NextResponse.json({ error: j?.responseDetails || "Dịch vụ dịch tạm thời không dùng được" }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Không kết nối được dịch vụ dịch" }, { status: 502 });
  }
}
