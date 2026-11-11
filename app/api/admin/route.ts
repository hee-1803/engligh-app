import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush, todayVN, type Sub } from "@/lib/push";

// Trang quản trị: chỉ email trong ADMIN_EMAILS mới gọi được
async function guard() {
  const a = await requireAdmin();
  if (!a.configured) return NextResponse.json({ error: "Chưa đặt ADMIN_EMAILS trên Vercel" }, { status: 403 });
  if (!a.ok) return NextResponse.json({ error: "Bạn không có quyền quản trị" }, { status: 403 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "Thiếu SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  return null;
}
const dayVN = (offset: number) => new Date(Date.now() + 7 * 3600e3 - offset * 864e5).toISOString().slice(0, 10);

// GET: tổng quan + danh sách người dùng
export async function GET() {
  const deny = await guard(); if (deny) return deny;
  const db = createAdminClient();
  const users: { id: string; email?: string; created_at: string; last_sign_in_at?: string; app_metadata?: { provider?: string }; user_metadata?: { full_name?: string; name?: string } }[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    users.push(...(data.users as typeof users));
    if (data.users.length < 200) break;
  }
  const [{ data: states }, { data: subs }] = await Promise.all([
    db.from("app_state").select("user_id, data, updated_at"),
    db.from("push_subscriptions").select("user_id"),
  ]);
  const st = new Map((states || []).map((s) => [s.user_id, s]));
  const pushN = new Map<string, number>();
  (subs || []).forEach((s) => pushN.set(s.user_id, (pushN.get(s.user_id) || 0) + 1));
  const today = todayVN(), week = new Set(Array.from({ length: 7 }, (_, i) => dayVN(i)));

  const list = users.map((u) => {
    const d = st.get(u.id)?.data || {};
    const sessions: { date: string }[] = d.sessions || [];
    const last = sessions.map((s) => s.date).sort().pop() || "";
    return {
      id: u.id, email: u.email || "", name: d.profile?.name || u.user_metadata?.full_name || u.user_metadata?.name || "",
      provider: u.app_metadata?.provider || "", joined: u.created_at, lastSignIn: u.last_sign_in_at || "",
      level: d.level || "", goal: d.profile?.goal || "", sessions: sessions.length, lastStudy: last,
      today: sessions.some((s) => s.date === today), week: sessions.some((s) => week.has(s.date)),
      cards: Object.keys(d.cards || {}).length, push: pushN.get(u.id) || 0, updated: st.get(u.id)?.updated_at || "",
    };
  }).sort((a, b) => (b.lastStudy || b.joined).localeCompare(a.lastStudy || a.joined));

  return NextResponse.json({
    stats: {
      users: list.length, today: list.filter((u) => u.today).length, week: list.filter((u) => u.week).length,
      sessions: list.reduce((n, u) => n + u.sessions, 0), push: list.filter((u) => u.push).length,
      newWeek: list.filter((u) => week.has(new Date(new Date(u.joined).getTime() + 7 * 3600e3).toISOString().slice(0, 10))).length,
    },
    users: list,
  });
}

// POST { title, body, userId? | all: true } → gửi thông báo
export async function POST(req: Request) {
  const deny = await guard(); if (deny) return deny;
  if (!process.env.VAPID_PRIVATE_KEY) return NextResponse.json({ error: "Thiếu VAPID_PRIVATE_KEY" }, { status: 500 });
  const { title, body, userId, all } = await req.json();
  const t = String(title || "").trim().slice(0, 80), b = String(body || "").trim().slice(0, 240);
  if (!t || !b) return NextResponse.json({ error: "Cần nhập tiêu đề và nội dung" }, { status: 400 });
  if (!all && !userId) return NextResponse.json({ error: "Chưa chọn người nhận" }, { status: 400 });
  const db = createAdminClient();
  let q = db.from("push_subscriptions").select("user_id, endpoint, keys");
  if (!all) q = q.eq("user_id", userId);
  const { data: subs, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs?.length) return NextResponse.json({ error: all ? "Chưa có ai bật thông báo" : "Người này chưa bật thông báo trên thiết bị nào" }, { status: 400 });
  let sent = 0; const gone: string[] = [];
  for (const s of subs) {
    const r = await sendPush({ endpoint: s.endpoint, keys: s.keys } as Sub, { title: t, body: b, url: "/" });
    if (r === "ok") sent++; else if (r === "gone") gone.push(s.endpoint);
  }
  if (gone.length) await db.from("push_subscriptions").delete().in("endpoint", gone);
  return NextResponse.json({ sent, devices: subs.length, people: new Set(subs.map((s) => s.user_id)).size, removed: gone.length });
}
