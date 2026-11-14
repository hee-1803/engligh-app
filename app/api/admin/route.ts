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

// GET: tổng quan + danh sách người dùng · ?reports=1: báo cáo vi phạm trong trò chuyện
export async function GET(req: Request) {
  const deny = await guard(); if (deny) return deny;
  const db = createAdminClient();
  if (new URL(req.url).searchParams.get("feedback")) {
    const { data } = await db.from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
    const ids = [...new Set((data || []).map((f) => f.user_id))], emails = new Map<string, string>();
    await Promise.all(ids.map(async (id) => { const { data: u } = await db.auth.admin.getUserById(id); emails.set(id, u.user?.email || id.slice(0, 8)); }));
    return NextResponse.json({ feedback: (data || []).map((f) => ({ ...f, email: emails.get(f.user_id) })) });
  }
  if (new URL(req.url).searchParams.get("reports")) {
    const { data: reps } = await db.from("chat_reports").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(100);
    const ids = [...new Set((reps || []).map((r) => r.message_id).filter(Boolean))];
    const { data: msgs } = ids.length ? await db.from("chat_messages").select("id, text, audio_path, hidden, room_id").in("id", ids) : { data: [] };
    const mm = new Map((msgs || []).map((m) => [m.id, m]));
    const uids = [...new Set((reps || []).flatMap((r) => [r.reporter, r.reported]))];
    const emails = new Map<string, string>();
    await Promise.all(uids.map(async (id) => { const { data } = await db.auth.admin.getUserById(id); emails.set(id, data.user?.email || id.slice(0, 8)); }));
    const { data: bans } = await db.from("chat_bans").select("*").gt("until", new Date().toISOString());
    return NextResponse.json({
      reports: (reps || []).map((r) => ({ ...r, message: mm.get(r.message_id) || null, reporterEmail: emails.get(r.reporter), reportedEmail: emails.get(r.reported) })),
      bans: bans || [],
    });
  }
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
  const peek = await req.clone().json().catch(() => ({}));
  // Xử lý báo cáo: { mod: "dismiss"|"hide"|"ban"|"unban", reportId?, messageId?, userId?, days? }
  if (peek.mod) {
    const db = createAdminClient();
    if (peek.mod === "fbDone" && peek.feedbackId) await db.from("feedback").update({ status: "done" }).eq("id", peek.feedbackId);
    if (peek.mod === "hide" && peek.messageId) await db.from("chat_messages").update({ hidden: true }).eq("id", peek.messageId);
    if (peek.mod === "ban" && peek.userId) await db.from("chat_bans").upsert({ user_id: peek.userId, until: new Date(Date.now() + (Number(peek.days) || 1) * 864e5).toISOString(), reason: "Quản trị viên khoá" });
    if (peek.mod === "ban" && peek.messageId) await db.from("chat_messages").update({ hidden: true }).eq("id", peek.messageId);
    if (peek.mod === "unban" && peek.userId) await db.from("chat_bans").delete().eq("user_id", peek.userId);
    if (peek.mod === "deleteUser" && peek.userId) return deleteUser(db, String(peek.userId), String(peek.confirmEmail || ""));
    if (peek.reportId) await db.from("chat_reports").update({ status: "done" }).eq("id", peek.reportId);
    return NextResponse.json({ ok: true });
  }
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

// XOÁ HẲN 1 TÀI KHOẢN và mọi dữ liệu liên quan (tiến độ, thông báo, xếp hạng, tin nhắn, tin nhắn thoại, báo cáo, phản hồi)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteUser(db: any, uid: string, confirmEmail: string) {
  const { data: got, error: e0 } = await db.auth.admin.getUserById(uid);
  const email = (got?.user?.email || "").toLowerCase();
  if (e0 || !got?.user) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
  if (!email || email !== confirmEmail.trim().toLowerCase()) return NextResponse.json({ error: "Email xác nhận không khớp, chưa xoá gì cả" }, { status: 400 });
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase());
  if (admins.includes(email)) return NextResponse.json({ error: "Không xoá tài khoản quản trị từ đây (gỡ email khỏi ADMIN_EMAILS trước)" }, { status: 400 });
  const done: string[] = [];
  const step = async (name: string, f: () => Promise<{ error?: { message: string } | null }>) => { try { const r = await f(); if (!r?.error) done.push(name); } catch {} };
  // tin nhắn thoại trong kho lưu trữ
  try {
    const { data: au } = await db.from("chat_messages").select("audio_path").eq("user_id", uid).not("audio_path", "is", null);
    const paths = (au || []).map((x: { audio_path: string }) => x.audio_path).filter(Boolean);
    for (let i = 0; i < paths.length; i += 100) await db.storage.from("chat-voice").remove(paths.slice(i, i + 100));
    if (paths.length) done.push(`${paths.length} tin nhắn thoại`);
  } catch {}
  await step("tin nhắn", () => db.from("chat_messages").delete().eq("user_id", uid));
  await step("phòng ghép đôi", () => db.from("chat_rooms").update({ closed_at: new Date().toISOString() }).or(`a.eq.${uid},b.eq.${uid}`).is("closed_at", null));
  for (const t of ["chat_queue", "chat_members", "chat_reads", "chat_bans"]) await step(t, () => db.from(t).delete().eq("user_id", uid));
  await step("chặn", () => db.from("chat_blocks").delete().or(`user_id.eq.${uid},blocked.eq.${uid}`));
  await step("báo cáo", () => db.from("chat_reports").delete().or(`reporter.eq.${uid},reported.eq.${uid}`));
  await step("phản hồi", () => db.from("feedback").delete().eq("user_id", uid));
  for (const t of ["lb_scores", "lb_profile", "push_subscriptions", "app_state"]) await step(t, () => db.from(t).delete().eq("user_id", uid));
  const { error } = await db.auth.admin.deleteUser(uid);
  if (error) return NextResponse.json({ error: "Đã xoá dữ liệu nhưng chưa xoá được tài khoản đăng nhập: " + error.message, done }, { status: 500 });
  return NextResponse.json({ ok: true, email, done });
}
