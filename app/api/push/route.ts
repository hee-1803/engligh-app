import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPush, type Sub } from "@/lib/push";

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
    const results = await Promise.all(data.map((s) => sendPush({ endpoint: s.endpoint, keys: s.keys } as Sub,
      { title: "Thông báo thử", body: "Thông báo nhắc học đã hoạt động trên thiết bị này.", url: "/" })));
    return NextResponse.json({ sent: results.filter((r) => r === "ok").length });
  }

  const sub = body.subscription as Sub | undefined;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return NextResponse.json({ error: "Thiếu thông tin đăng ký" }, { status: 400 });
  const { error } = await supabase.from("push_subscriptions").upsert(
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
