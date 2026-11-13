import { NextResponse } from "next/server";
import { curTitle } from "@/lib/leaderboard";
import { randomUUID, createHmac } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { alias, checkText, LEVELS } from "@/lib/chat";
import { sendPush, type Sub } from "@/lib/push";

/* Trò chuyện ẩn danh.
   GET  ?room=lv-A1&after=123&lv=A1  → tin nhắn mới (không bao giờ trả user_id của người khác)
   GET  ?inbox=1&lv=A1               → danh sách cuộc trò chuyện 1-1 của mình
   POST {action:"send", room, text? | audio(base64), mime, sec}
   POST {action:"recall", id}                     → thu hồi tin của mình
   POST {action:"match", level}                   → ghép đôi (người đang chờ, hoặc người từng vào cộng đồng gần đây)
   POST {action:"cancel"} · {action:"leave", room} · {action:"keep", room, on}
   POST {action:"report", id, reason} · {action:"block", id} */
const MAX_TEXT = 500, MAX_AUDIO = 1_500_000, MAX_SEC = 60, NEW_PER_DAY = 8;
type Db = ReturnType<typeof createAdminClient>;
type Room = { id: string; kind: string; level: string | null; a: string | null; b: string | null; closed_at: string | null; a_keep: boolean; b_keep: boolean; saved_at: string | null; last_msg_at: string | null; last_push_at: string | null; created_at: string; a_mute?: boolean; b_mute?: boolean };

async function me() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  return user;
}
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const other = (r: Room, uid: string) => (r.a === uid ? r.b : r.a) as string;
const tok = (id: string) => createHmac("sha256", process.env.CHAT_SALT || process.env.CRON_SECRET || "ep").update("blk|" + id).digest("hex").slice(0, 24);
const mutedFor = (r: Room, uid: string) => !!(r.a === uid ? r.a_mute : r.b_mute);

async function banned(db: Db, uid: string) {
  const { data } = await db.from("chat_bans").select("until, reason").eq("user_id", uid).maybeSingle();
  return data && new Date(data.until) > new Date() ? data : null;
}
async function blockedSet(db: Db, uid: string) {
  const { data } = await db.from("chat_blocks").select("user_id, blocked").or(`user_id.eq.${uid},blocked.eq.${uid}`);
  return new Set((data || []).map((r) => (r.user_id === uid ? r.blocked : r.user_id)));
}
async function canUse(db: Db, uid: string, room: string): Promise<Room | null> {
  const { data: r } = await db.from("chat_rooms").select("*").eq("id", room).maybeSingle();
  if (!r) return null;
  if (r.kind === "pair" && r.a !== uid && r.b !== uid) return null;
  return r as Room;
}
// Đánh dấu đang dùng cộng đồng (để người khác ghép được với mình cả khi mình offline)
async function seen(db: Db, uid: string, lv: string | null) {
  const level = LEVELS.includes(lv || "") ? lv : undefined;
  await db.from("chat_members").upsert({ user_id: uid, last_seen: new Date().toISOString(), ...(level ? { level } : {}) });
}
async function pushTo(db: Db, uid: string, payload: { title: string; body: string; url?: string }) {
  if (!process.env.VAPID_PRIVATE_KEY) return;
  const { data: subs } = await db.from("push_subscriptions").select("endpoint, keys").eq("user_id", uid);
  const gone: string[] = [];
  for (const s of subs || []) if ((await sendPush({ endpoint: s.endpoint, keys: s.keys } as Sub, payload)) === "gone") gone.push(s.endpoint);
  if (gone.length) await db.from("push_subscriptions").delete().in("endpoint", gone);
}

export async function GET(req: Request) {
  const user = await me(); if (!user) return bad("Chưa đăng nhập", 401);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return bad("Máy chủ chưa cấu hình SUPABASE_SERVICE_ROLE_KEY", 500);
  const db = createAdminClient(), u = new URL(req.url), uid = user.id;
  await seen(db, uid, u.searchParams.get("lv"));

  // Danh sách người mình đã chặn (không lộ id thật: dùng mã ẩn + biệt danh trong cuộc trò chuyện gần nhất)
  if (u.searchParams.get("blocks")) {
    const { data: bl } = await db.from("chat_blocks").select("blocked, created_at").eq("user_id", uid).order("created_at", { ascending: false });
    const list = await Promise.all((bl || []).map(async (x) => {
      const { data: rr } = await db.from("chat_rooms").select("id").eq("kind", "pair").or(`and(a.eq.${uid},b.eq.${x.blocked}),and(a.eq.${x.blocked},b.eq.${uid})`).order("created_at", { ascending: false }).limit(1);
      return { key: tok(x.blocked), who: alias(x.blocked, rr?.[0]?.id || "p-blocked"), at: x.created_at, room: !!rr?.length };
    }));
    return NextResponse.json({ blocks: list });
  }
  if (u.searchParams.get("inbox")) {
    const { data: rooms } = await db.from("chat_rooms").select("*").eq("kind", "pair").is("closed_at", null).or(`a.eq.${uid},b.eq.${uid}`)
      .order("last_msg_at", { ascending: false, nullsFirst: false }).limit(50);
    const { data: reads } = await db.from("chat_reads").select("room_id, last_id").eq("user_id", uid);
    const rd = new Map((reads || []).map((r) => [r.room_id, Number(r.last_id)]));
    const list = await Promise.all((rooms || []).map(async (r: Room) => {
      const { data: last } = await db.from("chat_messages").select("id, user_id, text, audio_path, recalled, hidden").eq("room_id", r.id).order("id", { ascending: false }).limit(1);
      const { count } = await db.from("chat_messages").select("id", { count: "exact", head: true }).eq("room_id", r.id).neq("user_id", uid).gt("id", rd.get(r.id) || 0);
      const m = last?.[0], mineKeep = r.a === uid ? r.a_keep : r.b_keep, theirKeep = r.a === uid ? r.b_keep : r.a_keep;
      return { id: r.id, level: r.level, partner: alias(other(r, uid), r.id), saved: !!r.saved_at, mineKeep, theirKeep, muted: mutedFor(r, uid), unread: count || 0, at: r.last_msg_at || r.created_at,
        preview: !m ? "" : (m.user_id === uid ? "Bạn: " : "") + (m.recalled ? "Đã thu hồi một tin nhắn" : m.hidden ? "(tin đã ẩn)" : m.audio_path ? "🎤 Tin nhắn giọng nói" : String(m.text || "").slice(0, 80)) };
    }));
    const { data: q } = await db.from("chat_queue").select("since").eq("user_id", uid).maybeSingle();
    return NextResponse.json({ rooms: list, waiting: !!q, unread: list.reduce((n, r) => n + r.unread, 0) });
  }

  const room = u.searchParams.get("room") || "";
  const r = await canUse(db, uid, room); if (!r) return bad("Không vào được phòng này", 403);
  const after = Number(u.searchParams.get("after") || 0);
  const blocks = await blockedSet(db, uid);
  let q = db.from("chat_messages").select("id, user_id, text, audio_path, audio_sec, hidden, recalled, created_at").eq("room_id", room).order("id", { ascending: false }).limit(r.kind === "pair" ? 200 : 60);
  if (after) q = q.gt("id", after);
  const { data, error } = await q;
  if (error) return bad(error.message, 500);
  const rows = (data || []).reverse().filter((m) => !blocks.has(m.user_id));
  const paths = rows.filter((m) => m.audio_path && !m.hidden && !m.recalled).map((m) => m.audio_path!);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await db.storage.from("chat-voice").createSignedUrls(paths, 3600);
    (signed || []).forEach((s) => s.signedUrl && s.path && urls.set(s.path, s.signedUrl));
  }
  // Danh hiệu tuần từ bảng xếp hạng (hiện cạnh biệt danh)
  const tmap = new Map<string, { vi: string; en: string } | null>();
  try {
    const uids = [...new Set(rows.map((m) => m.user_id).concat(uid))];
    const { data: lp } = await db.from("lb_profile").select("user_id, title, title_week, opt_out").in("user_id", uids);
    for (const p of lp || []) if (!p.opt_out) tmap.set(p.user_id, curTitle(p as never));
  } catch {}
  const gone = !!(r.kind === "pair" && r.closed_at);
  const messages = rows.map((m) => {
    const off = m.hidden || m.recalled;
    return { id: m.id, mine: m.user_id === uid, who: { ...alias(m.user_id, room), title: tmap.get(m.user_id) || null }, at: m.created_at, recalled: !!m.recalled, hidden: !!m.hidden && !m.recalled,
      text: off ? "" : m.text || "", audio: off || !m.audio_path ? null : urls.get(m.audio_path) || null, sec: m.audio_sec || 0 };
  });
  if (rows.length) await db.from("chat_reads").upsert({ user_id: uid, room_id: room, last_id: rows[rows.length - 1].id });
  // Tin đã thu hồi trong 10 phút gần đây: báo để màn hình người khác cập nhật
  const { data: rc } = await db.from("chat_messages").select("id").eq("room_id", room).eq("recalled", true).gte("created_at", new Date(Date.now() - 864e5).toISOString());
  const pairInfo = r.kind === "pair" ? { partner: alias(other(r, uid), room), saved: !!r.saved_at, muted: mutedFor(r, uid), mineKeep: r.a === uid ? r.a_keep : r.b_keep, theirKeep: r.a === uid ? r.b_keep : r.a_keep, level: r.level } : null;
  return NextResponse.json({ messages, recalled: (rc || []).map((x) => x.id), me: { ...alias(uid, room), title: tmap.get(uid) || null }, closed: gone, pair: pairInfo, ban: await banned(db, uid) });
}

export async function POST(req: Request) {
  const user = await me(); if (!user) return bad("Chưa đăng nhập", 401);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return bad("Máy chủ chưa cấu hình SUPABASE_SERVICE_ROLE_KEY", 500);
  const db = createAdminClient(), b = await req.json(), uid = user.id;

  if (b.action === "send") {
    const ban = await banned(db, uid);
    if (ban) return bad(`Bạn đang bị tạm khoá trò chuyện đến ${new Date(ban.until).toLocaleString("vi-VN")} do bị báo cáo vi phạm.`, 403);
    const r = await canUse(db, uid, b.room); if (!r) return bad("Không vào được phòng này", 403);
    if (r.kind === "pair" && r.closed_at) return bad("Cuộc trò chuyện này đã kết thúc", 400);
    if (r.kind === "pair" && (await blockedSet(db, uid)).has(other(r, uid))) return bad("Không gửi được tin nhắn", 403);
    const { data: recent } = await db.from("chat_messages").select("created_at").eq("user_id", uid).gte("created_at", new Date(Date.now() - 60e3).toISOString()).order("created_at", { ascending: false });
    if ((recent || []).length >= 20) return bad("Bạn gửi hơi nhanh, nghỉ một chút rồi gửi tiếp nhé.", 429);
    if (recent?.[0] && Date.now() - new Date(recent[0].created_at).getTime() < 2000) return bad("Chờ 2 giây giữa hai tin nhắn nhé.", 429);

    const text = String(b.text || "").trim().slice(0, MAX_TEXT);
    let audio_path: string | null = null, audio_sec: number | null = null;
    if (b.audio) {
      const buf = Buffer.from(String(b.audio), "base64");
      const mime = String(b.mime || "audio/webm").split(";")[0];
      if (!/^audio\/(webm|ogg|mp4|mpeg|aac|x-m4a)$/.test(mime)) return bad("Định dạng ghi âm không hỗ trợ");
      if (buf.length > MAX_AUDIO) return bad("Đoạn ghi âm quá dài (tối đa khoảng 60 giây)");
      audio_sec = Math.min(MAX_SEC, Math.max(1, Math.round(Number(b.sec) || 1)));
      audio_path = `${b.room}/${uid}/${Date.now()}.${mime.split("/")[1].replace("x-m4a", "m4a").replace("mpeg", "mp3")}`;
      const { error } = await db.storage.from("chat-voice").upload(audio_path, buf, { contentType: mime });
      if (error) return bad("Không lưu được ghi âm: " + error.message, 500);
    } else {
      if (!text) return bad("Tin nhắn trống");
      const why = checkText(text); if (why) return bad(why);
    }
    const { data, error } = await db.from("chat_messages").insert({ room_id: b.room, user_id: uid, text: b.audio ? null : text, audio_path, audio_sec }).select("id").single();
    if (error) return bad(error.message, 500);
    if (r.kind === "pair") {
      const now = new Date().toISOString();
      await db.from("chat_rooms").update({ last_msg_at: now }).eq("id", r.id);
      // Người kia không mở app trong 2 phút → báo bằng thông báo (tối đa 1 lần / 10 phút mỗi cuộc trò chuyện)
      const to = other(r, uid);
      const { data: mem } = await db.from("chat_members").select("last_seen").eq("user_id", to).maybeSingle();
      const away = !mem || Date.now() - new Date(mem.last_seen).getTime() > 120e3;
      const quiet = !r.last_push_at || Date.now() - new Date(r.last_push_at).getTime() > 600e3;
      if (away && quiet && !mutedFor(r, to)) {
        await db.from("chat_rooms").update({ last_push_at: now }).eq("id", r.id);
        const w = alias(uid, r.id);
        await pushTo(db, to, { title: `${w.icon} ${w.name} nhắn cho bạn`, body: b.audio ? "🎤 Tin nhắn giọng nói" : text.slice(0, 120), url: "/?view=chat" });
      }
    }
    return NextResponse.json({ ok: true, id: data.id });
  }

  if (b.action === "recall") {
    const { data: m } = await db.from("chat_messages").select("id, user_id, audio_path, recalled").eq("id", Number(b.id)).maybeSingle();
    if (!m || m.user_id !== uid) return bad("Chỉ thu hồi được tin nhắn của chính bạn");
    if (m.audio_path) await db.storage.from("chat-voice").remove([m.audio_path]);
    await db.from("chat_messages").update({ recalled: true, text: null, audio_path: null }).eq("id", m.id);
    return NextResponse.json({ ok: true });
  }

  if (b.action === "match") {
    const ban = await banned(db, uid); if (ban) return bad("Bạn đang bị tạm khoá trò chuyện do bị báo cáo vi phạm.", 403);
    const level = LEVELS.includes(b.level) ? b.level : "A1", li = LEVELS.indexOf(level);
    await seen(db, uid, level);
    const today = new Date(Date.now() - 864e5).toISOString();
    const { count: made } = await db.from("chat_rooms").select("id", { count: "exact", head: true }).eq("kind", "pair").or(`a.eq.${uid},b.eq.${uid}`).gte("created_at", today);
    if ((made || 0) >= NEW_PER_DAY) return bad(`Mỗi ngày tìm tối đa ${NEW_PER_DAY} bạn mới. Hãy trò chuyện tiếp với các bạn đã ghép nhé!`, 429);

    const blocks = await blockedSet(db, uid);
    // Không ghép lại với người đang có cuộc trò chuyện chung
    const { data: mine } = await db.from("chat_rooms").select("a, b").eq("kind", "pair").is("closed_at", null).or(`a.eq.${uid},b.eq.${uid}`);
    const skip = new Set([uid, ...blocks, ...(mine || []).flatMap((r) => [r.a, r.b])]);
    const near = LEVELS.filter((_, i) => Math.abs(i - li) <= 1);
    const rank = (lv: string | null) => (lv === level ? 0 : 1);
    const { data: bannedNow } = await db.from("chat_bans").select("user_id").gt("until", new Date().toISOString());
    (bannedNow || []).forEach((x) => skip.add(x.user_id));

    // 1) Người đang bấm tìm (đang online) — ưu tiên
    const { data: waiting } = await db.from("chat_queue").select("user_id, level, since").in("level", near).gte("since", today).order("since");
    let cand = (waiting || []).filter((w) => !skip.has(w.user_id)).sort((x, y) => rank(x.level) - rank(y.level))[0]?.user_id as string | undefined;
    if (cand) await db.from("chat_queue").delete().eq("user_id", cand);
    // 2) Không ai đang chờ → người từng vào cộng đồng trong 14 ngày (không cần đang online)
    if (!cand) {
      const { data: mem } = await db.from("chat_members").select("user_id, level, last_seen").eq("open", true).in("level", near)
        .gte("last_seen", new Date(Date.now() - 14 * 864e5).toISOString()).order("last_seen", { ascending: false }).limit(200);
      const pool = (mem || []).filter((m) => !skip.has(m.user_id)).sort((x, y) => rank(x.level) - rank(y.level));
      const top = pool.slice(0, 20);
      cand = top[Math.floor(Math.random() * top.length)]?.user_id;
    }
    if (!cand) {
      await db.from("chat_queue").upsert({ user_id: uid, level, since: new Date().toISOString() });
      return NextResponse.json({ waiting: true });
    }
    await db.from("chat_queue").delete().eq("user_id", uid);
    const id = "p-" + randomUUID();
    await db.from("chat_rooms").insert({ id, kind: "pair", level, a: cand, b: uid, last_msg_at: new Date().toISOString() });
    const meA = alias(uid, id);
    await pushTo(db, cand, { title: "🤝 Bạn có một bạn luyện tập mới!", body: `${meA.icon} ${meA.name} muốn cùng luyện tiếng Anh với bạn. Vào Cộng đồng để trả lời nhé.`, url: "/?view=chat" });
    return NextResponse.json({ room: { id, partner: alias(cand, id) } });
  }
  if (b.action === "cancel") { await db.from("chat_queue").delete().eq("user_id", uid); return NextResponse.json({ ok: true }); }
  if (b.action === "leave") {
    await db.from("chat_rooms").update({ closed_at: new Date().toISOString() }).eq("id", String(b.room)).eq("kind", "pair").or(`a.eq.${uid},b.eq.${uid}`);
    return NextResponse.json({ ok: true });
  }
  if (b.action === "keep") {
    const r = await canUse(db, uid, String(b.room)); if (!r || r.kind !== "pair" || r.closed_at) return bad("Không tìm thấy cuộc trò chuyện");
    const on = !!b.on, col = r.a === uid ? "a_keep" : "b_keep", theirs = r.a === uid ? r.b_keep : r.a_keep;
    await db.from("chat_rooms").update({ [col]: on, saved_at: on && theirs ? r.saved_at || new Date().toISOString() : null }).eq("id", r.id);
    if (on && !theirs && !mutedFor(r, other(r, uid))) { const w = alias(uid, r.id); await pushTo(db, other(r, uid), { title: `⭐ ${w.name} muốn giữ cuộc trò chuyện`, body: "Bấm “Giữ cuộc trò chuyện” để trở thành bạn chat và nhắn với nhau mỗi ngày (vẫn ẩn danh).", url: "/?view=chat" }); }
    return NextResponse.json({ ok: true, saved: on && theirs });
  }
  // Chặn người trong cuộc trò chuyện 1-1 (không cần chọn tin nhắn): đóng cuộc trò chuyện, không bao giờ ghép hay thấy tin người đó nữa
  if (b.action === "blockRoom") {
    const r = await canUse(db, uid, String(b.room)); if (!r || r.kind !== "pair") return bad("Không tìm thấy cuộc trò chuyện");
    await db.from("chat_blocks").upsert({ user_id: uid, blocked: other(r, uid) });
    await db.from("chat_rooms").update({ closed_at: new Date().toISOString() }).eq("id", r.id);
    return NextResponse.json({ ok: true });
  }
  // Bỏ chặn: mở lại cuộc trò chuyện 1-1 gần nhất giữa hai người (nếu có)
  if (b.action === "unblock") {
    const { data: bl } = await db.from("chat_blocks").select("blocked").eq("user_id", uid);
    const hit = (bl || []).find((x) => tok(x.blocked) === String(b.key));
    if (!hit) return bad("Không tìm thấy");
    await db.from("chat_blocks").delete().eq("user_id", uid).eq("blocked", hit.blocked);
    const { data: rr } = await db.from("chat_rooms").select("id").eq("kind", "pair").or(`and(a.eq.${uid},b.eq.${hit.blocked}),and(a.eq.${hit.blocked},b.eq.${uid})`).order("created_at", { ascending: false }).limit(1);
    if (rr?.[0] && b.reopen) await db.from("chat_rooms").update({ closed_at: null }).eq("id", rr[0].id);
    return NextResponse.json({ ok: true, room: b.reopen ? rr?.[0]?.id || null : null });
  }
  if (b.action === "mute") {
    const r = await canUse(db, uid, String(b.room)); if (!r || r.kind !== "pair") return bad("Không tìm thấy cuộc trò chuyện");
    await db.from("chat_rooms").update({ [r.a === uid ? "a_mute" : "b_mute"]: !!b.on }).eq("id", r.id);
    return NextResponse.json({ ok: true });
  }
  if (b.action === "open") { await db.from("chat_members").upsert({ user_id: uid, open: !!b.on }); return NextResponse.json({ ok: true }); }

  if (b.action === "report" || b.action === "block") {
    const { data: m } = await db.from("chat_messages").select("id, room_id, user_id").eq("id", Number(b.id)).maybeSingle();
    if (!m || !(await canUse(db, uid, m.room_id))) return bad("Không tìm thấy tin nhắn");
    if (m.user_id === uid) return bad("Đây là tin nhắn của bạn");
    if (b.action === "block") {
      await db.from("chat_blocks").upsert({ user_id: uid, blocked: m.user_id });
      await db.from("chat_rooms").update({ closed_at: new Date().toISOString() }).eq("kind", "pair").is("closed_at", null).or(`and(a.eq.${uid},b.eq.${m.user_id}),and(a.eq.${m.user_id},b.eq.${uid})`);
      return NextResponse.json({ ok: true });
    }
    await db.from("chat_reports").insert({ message_id: m.id, room_id: m.room_id, reporter: uid, reported: m.user_id, reason: String(b.reason || "").slice(0, 200) });
    const { data: onMsg } = await db.from("chat_reports").select("reporter").eq("message_id", m.id);
    if (new Set((onMsg || []).map((x) => x.reporter)).size >= 2 || m.room_id.startsWith("p-")) await db.from("chat_messages").update({ hidden: true }).eq("id", m.id);
    const { data: onUser } = await db.from("chat_reports").select("reporter").eq("reported", m.user_id).gte("created_at", new Date(Date.now() - 864e5).toISOString());
    if (new Set((onUser || []).map((x) => x.reporter)).size >= 3)
      await db.from("chat_bans").upsert({ user_id: m.user_id, until: new Date(Date.now() + 864e5).toISOString(), reason: "Tự động: bị nhiều người báo cáo" });
    return NextResponse.json({ ok: true });
  }
  return bad("Yêu cầu không hợp lệ");
}
