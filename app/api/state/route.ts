import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: đọc tiến độ học của người đang đăng nhập
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const { data, error } = await supabase.from("app_state").select("data").eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.data ?? null);
}

// PUT: lưu toàn bộ tiến độ
export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json();
  // Chống ghi đè: thiết bị đang giữ bản cũ (rev nhỏ hơn bản trên máy chủ) thì không được ghi, trả bản mới về
  const base = Number(new URL(req.url).searchParams.get("base") ?? -1);
  if (base >= 0) {
    const { data: cur } = await supabase.from("app_state").select("data").eq("user_id", user.id).maybeSingle();
    const curRev = Number(cur?.data?.rev || 0);
    if (curRev > base) return NextResponse.json({ conflict: true, data: cur?.data }, { status: 409 });
  }
  const { error } = await supabase.from("app_state")
    .upsert({ user_id: user.id, data: body, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, rev: body?.rev ?? 0 });
}
