import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { alias, checkText, LEVELS } from "@/lib/chat";

/* Trò chuyện ẩn danh.
   GET  ?room=lv-A1&after=123     → tin nhắn mới (không bao giờ trả user_id của người khác)
   GET  ?pair=1                   → trạng thái ghép đôi của mình
   POST {action:"send", room, text?, audio?(base64), mime?, sec?}
   POST {action:"match", level} · {action:"cancel"} · {action:"leave", room}
   POST {action:"report", id, reason} · {action:"block", id} */
const MAX_TEXT = 500, MAX_AUDIO = 1_500_000, MAX_SEC = 60;
type Db = ReturnType<typeof createAdminClient>;

async function me() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  return user;
}
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function banned(db: Db, uid: string) {
  const { data } = await db.from("chat_bans").select("until, reason").eq("user_id", uid).maybeSingle();
  return data && new Date(data.until) > new Date() ? data : null;
}
async function blockedSet(db: Db, uid: string) {
  const { data } = await db.from("chat_blocks").select("user_id, blocked").or(`user_id.eq.${uid},blocked.eq.${uid}`);
  return new Set((data || []).map((r) => (r.user_id === uid ? r.blocked : r.user_id)));
}
// Được vào phòng không: phòng chung thì ai cũng vào được; phòng ghép đôi chỉ 2 người trong đó
async function canUse(db: Db, uid: string, room: string) {
  const { data: r } = await db.from("chat_rooms").select("*").eq("id", room).maybeSingle();
  if (!r) return null;
  if (r.kind === "pair" && r.a !== uid && r.b !== uid) return null;
  return r;
}

export async function GET(req: Request) {
  const user = await me(); if (!user) return bad("Chưa đăng nhập", 401);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return bad("Máy chủ chưa cấu hình SUPABASE_SERVICE_ROLE_KEY", 500);
  const db = createAdminClient(), u = new URL(req.url);

  if (u.searchParams.get("pair")) {
    const { data: rooms } = await db.from("chat_rooms").select("*").eq("kind", "pair").is("closed_at", null).or(`a.eq.${user.id},b.eq.${user.id}`).order("created_at", { ascending: false }).limit(1);
    const { data: q } = await db.from("chat_queue").select("since, level").eq("user_id", user.id).maybeSingle();
    const { count } = await db.from("chat_queue").select("user_id", { count: "exact", head: true });
    const r = rooms?.[0];
    return NextResponse.json({ room: r ? { id: r.id, level: r.level, partner: alias(r.a === user.id ? r.b : r.a, r.id) } : null, waiting: !!q, since: q?.since, queue: count || 0 });
  }

  const room = u.searchParams.get("room") || "";
  const r = await canUse(db, user.id, room); if (!r) return bad("Không vào được phòng này", 403);
  const after = Number(u.searchParams.get("after") || 0);
  const blocks = await blockedSet(db, user.id);
  let q = db.from("chat_messages").select("id, user_id, text, audio_path, audio_sec, hidden, created_at").eq("room_id", room).order("id", { ascending: false }).limit(60);
  if (after) q = q.gt("id", after);
  const { data, error } = await q;
  if (error) return bad(error.message, 500);
  const rows = (data || []).reverse().filter((m) => !blocks.has(m.user_id));
  const paths = rows.filter((m) => m.audio_path && !m.hidden).map((m) => m.audio_path!);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await db.storage.from("chat-voice").createSignedUrls(paths, 3600);
    (signed || []).forEach((s) => s.signedUrl && s.path && urls.set(s.path, s.signedUrl));
  }
  const messages = rows.map((m) => ({
    id: m.id, mine: m.user_id === user.id, who: alias(m.user_id, room), at: m.created_at,
    text: m.hidden ? "" : m.text || "", hidden: !!m.hidden, audio: m.hidden || !m.audio_path ? null : urls.get(m.audio_path) || null, sec: m.audio_sec || 0,
  }));
  const closed = r.kind === "pair" && !!r.closed_at;
  return NextResponse.json({ messages, me: alias(user.id, room), closed, ban: await banned(db, user.id) });
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
    // Chống spam: tối đa 1 tin / 2 giây và 20 tin / phút
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
    return NextResponse.json({ ok: true, id: data.id });
  }

  if (b.action === "match") {
    const ban = await banned(db, uid); if (ban) return bad("Bạn đang bị tạm khoá trò chuyện do bị báo cáo vi phạm.", 403);
    const level = LEVELS.includes(b.level) ? b.level : "A1", li = LEVELS.indexOf(level);
    await db.from("chat_rooms").update({ closed_at: new Date().toISOString() }).eq("kind", "pair").is("closed_at", null).or(`a.eq.${uid},b.eq.${uid}`);
    const blocks = await blockedSet(db, uid);
    // Ưu tiên người cùng trình độ, rồi lệch 1 bậc; người chờ lâu nhất trước
    const near = LEVELS.filter((_, i) => Math.abs(i - li) <= 1);
    const { data: waiting } = await db.from("chat_queue").select("user_id, level, since").in("level", near).neq("user_id", uid)
      .gte("since", new Date(Date.now() - 5 * 60e3).toISOString()).order("since");
    const cand = (waiting || []).filter((w) => !blocks.has(w.user_id)).sort((x, y) => Number(x.level !== level) - Number(y.level !== level))[0];
    if (cand) {
      const { data: taken } = await db.from("chat_queue").delete().eq("user_id", cand.user_id).select("user_id");
      if (taken?.length) {
        await db.from("chat_queue").delete().eq("user_id", uid);
        const id = "p-" + randomUUID();
        await db.from("chat_rooms").insert({ id, kind: "pair", level: cand.level === level ? level : `${level}/${cand.level}`, a: cand.user_id, b: uid });
        return NextResponse.json({ room: { id, partner: alias(cand.user_id, id) } });
      }
    }
    await db.from("chat_queue").upsert({ user_id: uid, level, since: new Date().toISOString() });
    return NextResponse.json({ waiting: true });
  }
  if (b.action === "cancel") { await db.from("chat_queue").delete().eq("user_id", uid); return NextResponse.json({ ok: true }); }
  if (b.action === "leave") {
    await db.from("chat_rooms").update({ closed_at: new Date().toISOString() }).eq("id", String(b.room)).eq("kind", "pair").or(`a.eq.${uid},b.eq.${uid}`);
    return NextResponse.json({ ok: true });
  }

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
    // Tự xử lý: tin bị 2 người báo cáo → ẩn; người bị 3 người khác nhau báo cáo trong 24 giờ → khoá chat 24 giờ
    const { data: onMsg } = await db.from("chat_reports").select("reporter").eq("message_id", m.id);
    if (new Set((onMsg || []).map((x) => x.reporter)).size >= 2 || m.room_id.startsWith("p-")) await db.from("chat_messages").update({ hidden: true }).eq("id", m.id);
    const { data: onUser } = await db.from("chat_reports").select("reporter").eq("reported", m.user_id).gte("created_at", new Date(Date.now() - 864e5).toISOString());
    if (new Set((onUser || []).map((x) => x.reporter)).size >= 3)
      await db.from("chat_bans").upsert({ user_id: m.user_id, until: new Date(Date.now() + 864e5).toISOString(), reason: "Tự động: bị nhiều người báo cáo" });
    return NextResponse.json({ ok: true });
  }
  return bad("Yêu cầu không hợp lệ");
}
