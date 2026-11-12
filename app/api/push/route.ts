import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPush, reminderFor, type Sub } from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/admin";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// GET: khóa công khai để trình duyệt đăng ký nhận thông báo
export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return NextResponse.json({ error: "Chưa cấu hình NEXT_PUBLIC_VAPID_PUBLIC_KEY" }, { status: 500 });
  return NextResponse.json({ publicKey: key });
}

// POST { subscription } : lưu thiết bị · POST { test: true } : gửi thử ngay
export async function POST(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json();

  if (body.test) {
    const { data } = await supabase.from("push_subscriptions").select("endpoint, keys").eq("user_id", user.id);
    if (!data?.length) return NextResponse.json({ error: "Thiết bị này chưa bật thông báo" }, { status: 400 });
    // Gửi thử đúng một lời nhắc thật (theo giọng nhắc đang chọn)
    const { data: st } = await supabase.from("app_state").select("data").eq("user_id", user.id).maybeSingle();
    const msg = reminderFor(st?.data);
    const results = await Promise.all(data.map((s) => sendPush({ endpoint: s.endpoint, keys: s.keys } as Sub, msg)));
    return NextResponse.json({ sent: results.filter((r) => r === "ok").length });
  }

  const sub = body.subscription as Sub | undefined;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return NextResponse.json({ error: "Thiếu thông tin đăng ký" }, { status: 400 });
  // Một thiết bị chỉ thuộc về tài khoản đang đăng nhập: nếu trước đó thiết bị này gắn với tài khoản khác thì chuyển sang tài khoản này
  // (tránh: học bằng tài khoản B nhưng vẫn bị nhắc vì thiết bị còn gắn với tài khoản A chưa học)
  const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint).neq("user_id", user.id);
  const { error } = await db.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint: sub.endpoint, keys: sub.keys, user_agent: req.headers.get("user-agent")?.slice(0, 200) ?? null },
    { onConflict: "endpoint" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE { endpoint } : tắt thông báo trên thiết bị
export async function DELETE(req: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const { endpoint } = await req.json();
  await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}
