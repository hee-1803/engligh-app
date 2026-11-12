import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST { kind, rating, message, level, ua } → lưu phản hồi của người dùng
export async function POST(req: Request) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Máy chủ chưa cấu hình" }, { status: 500 });
  const b = await req.json().catch(() => ({}));
  const message = String(b.message || "").trim().slice(0, 2000);
  const rating = Number(b.rating) >= 1 && Number(b.rating) <= 5 ? Math.round(Number(b.rating)) : null;
  if (!message && !rating) return NextResponse.json({ error: "Phản hồi trống" }, { status: 400 });
  const db = createAdminClient();
  // Chống spam: tối đa 5 phản hồi / giờ
  const { count } = await db.from("feedback").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", new Date(Date.now() - 3600e3).toISOString());
  if ((count || 0) >= 5) return NextResponse.json({ error: "Bạn đã gửi nhiều phản hồi, thử lại sau ít phút nhé" }, { status: 429 });
  const { error } = await db.from("feedback").insert({
    user_id: user.id, kind: ["idea", "bug", "love", "other"].includes(b.kind) ? b.kind : "other", rating, message,
    level: String(b.level || "").slice(0, 4), user_agent: String(b.ua || "").slice(0, 200),
  });
  if (error) return NextResponse.json({ error: error.message.includes("feedback") ? "Chưa tạo bảng feedback (chạy supabase/feedback.sql)" : error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
