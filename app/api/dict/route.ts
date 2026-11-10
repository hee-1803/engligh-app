import { NextResponse } from "next/server";

// Tra từ điển tiếng Anh mở (dictionaryapi.dev) qua server, tránh bị trình duyệt/tiện ích chặn
export async function GET(req: Request) {
  const w = new URL(req.url).searchParams.get("w")?.trim().toLowerCase();
  if (!w || w.length > 60) return NextResponse.json({ error: "Thiếu từ cần tra" }, { status: 400 });
  try {
    const r = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(w));
    if (!r.ok) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ error: "Không kết nối được từ điển" }, { status: 502 });
  }
}
