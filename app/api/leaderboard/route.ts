import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEAGUES, LEVELS, FRAMES, TITLES, MILESTONES, MAX_FREEZE, weekOf, prevWeek, weekEnd, dayVN, levelOf, getProf, updateScore, finalizeWeek, shownName, curTitle } from "@/lib/leaderboard";

/* Bảng xếp hạng tuần
   GET  ?level=A1&league=0 → top 10 + vị trí của bạn + phần thưởng
   POST {action:"settings", opt_out?, show_name?, display_name?, frame?}
   POST {action:"freeze", day}   → dùng 1 đóng băng chuỗi cho ngày bị lỡ
   POST {action:"seen"}          → đã xem kết quả tuần trước */
const bad = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });

async function who() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

export async function GET(req: Request) {
  const user = await who(); if (!user) return bad("Chưa đăng nhập", 401);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return bad("Thiếu SUPABASE_SERVICE_ROLE_KEY", 500);
  const db = createAdminClient(), uid = user.id, week = weekOf();
  const u0 = new URL(req.url), browse = u0.searchParams.get("browse") === "1";
  let myLevel = "A0";
  if (browse) {
    // Chỉ xem bảng khác: không tính lại điểm, chỉ đọc (nhanh)
    const { data: st } = await db.from("lb_scores").select("level").eq("user_id", uid).eq("week", week).maybeSingle();
    myLevel = st?.level || "A0";
  } else {
    // Chốt tuần trước (nếu chưa) và tính lại điểm của mình cùng lúc
    const pw = prevWeek(week);
    const [fin, stR] = await Promise.all([
      db.from("lb_weeks").select("week").eq("week", pw).maybeSingle().then(async (x: any) => { if (!x.data) { try { await finalizeWeek(db, pw); } catch {} } }), // eslint-disable-line @typescript-eslint/no-explicit-any
      db.from("app_state").select("data").eq("user_id", uid).maybeSingle(),
    ]); void fin;
    if (stR.error) return bad(stR.error.message, 500);
    myLevel = levelOf(stR.data?.data);
    try { await updateScore(db, uid, stR.data?.data || {}); } catch (e) {
      const m = (e as Error).message || ""; if (/lb_|relation/.test(m)) return bad("Chưa tạo bảng xếp hạng: chạy supabase/leaderboard.sql trong Supabase", 500);
    }
  }
  const prof = await getProf(db, uid);

  const u = u0;
  const level = LEVELS.includes(u.searchParams.get("level") || "") ? u.searchParams.get("level")! : myLevel;
  const lg = Number(u.searchParams.get("league")); const league = Number.isInteger(lg) && lg >= 0 && lg <= 4 ? lg : prof.league;

  const [{ data: rows, error }, myRow] = await Promise.all([
    db.from("lb_scores").select("user_id, points").eq("week", week).eq("level", level).eq("league", league).gt("points", 0).order("points", { ascending: false }).limit(300),
    db.from("lb_scores").select("points").eq("user_id", uid).eq("week", week).maybeSingle(),
  ]);
  if (error) return bad(/lb_/.test(error.message) ? "Chưa tạo bảng xếp hạng: chạy supabase/leaderboard.sql trong Supabase" : error.message, 500);
  const ids = (rows || []).map((r) => r.user_id);
  const profs = new Map<string, any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (ids.length) { const { data } = await db.from("lb_profile").select("user_id, opt_out, show_name, display_name, frame, title, title_week, badges").in("user_id", ids); for (const p of data || []) profs.set(p.user_id, p); }
  const list = (rows || []).filter((r) => !profs.get(r.user_id)?.opt_out || r.user_id === uid);
  const ranked = list.filter((r) => r.user_id === uid ? !prof.opt_out : true).map((r, i) => {
    const p = profs.get(r.user_id), n = shownName(p, r.user_id), medals = (p?.badges || []).filter((b: any) => ["gold", "silver", "bronze"].includes(b.k)).length; // eslint-disable-line @typescript-eslint/no-explicit-any
    return { rank: i + 1, me: r.user_id === uid, points: r.points, ...n, frame: p?.frame || null, title: curTitle(p), medals };
  });
  const mine = ranked.find((r) => r.me) || null;
  const myPts = myRow.data?.points || 0;
  const tenth = ranked[9]?.points ?? 0;
  const got = prof.milestones[week] || [];

  return NextResponse.json({
    week, endsAt: weekEnd(week), today: dayVN(), level, league, myLevel, myLeague: prof.league, leagues: LEAGUES, total: ranked.length,
    top: ranked.slice(0, 10), me: mine ? { ...mine, gapTop10: mine.rank > 10 ? Math.max(1, tenth - mine.points + 1) : 0 } : { points: myPts, rank: null, ...shownName(prof, uid) },
    near: mine && mine.rank > 10 ? ranked.slice(Math.max(10, mine.rank - 2), mine.rank + 1) : [],
    milestones: MILESTONES.map((m) => ({ ...m, got: got.includes(m.p) })),
    reward: {
      opt_out: prof.opt_out, show_name: prof.show_name, display_name: prof.display_name, freezes: prof.freezes, maxFreeze: MAX_FREEZE,
      frame: prof.frame, frames: prof.frames, allFrames: FRAMES, title: curTitle(prof), titles: TITLES,
      badges: prof.badges.slice(-60).reverse(),
      lastResult: prof.last_result && prof.seen_week !== prof.last_result.w ? prof.last_result : null,
    },
  });
}

export async function POST(req: Request) {
  const user = await who(); if (!user) return bad("Chưa đăng nhập", 401);
  const db = createAdminClient(), uid = user.id;
  const b = await req.json().catch(() => ({}));
  const prof = await getProf(db, uid);
  if (b.action === "settings") {
    const p = { ...prof };
    if (typeof b.opt_out === "boolean") p.opt_out = b.opt_out;
    if (typeof b.show_name === "boolean") p.show_name = b.show_name;
    if (typeof b.display_name === "string") p.display_name = b.display_name.replace(/[<>]/g, "").trim().slice(0, 30) || null;
    if (b.frame === null || b.frame === "") p.frame = null;
    else if (typeof b.frame === "string") { if (!p.frames.includes(b.frame)) return bad("Bạn chưa mở khoá khung này"); p.frame = b.frame; }
    const { error } = await db.from("lb_profile").upsert(p);
    return error ? bad(error.message, 500) : NextResponse.json({ ok: true });
  }
  if (b.action === "freeze") {
    const day = String(b.day || "");
    const y = new Date(Date.parse(dayVN() + "T00:00:00Z") - 864e5).toISOString().slice(0, 10);
    if (day !== y) return bad("Chỉ dùng được cho ngày hôm qua");
    if (prof.freezes < 1) return bad("Bạn không còn lượt đóng băng chuỗi");
    const { error } = await db.from("lb_profile").upsert({ ...prof, freezes: prof.freezes - 1 });
    return error ? bad(error.message, 500) : NextResponse.json({ ok: true, freezes: prof.freezes - 1 });
  }
  if (b.action === "seen") {
    await db.from("lb_profile").upsert({ ...prof, seen_week: prof.last_result?.w || null });
    return NextResponse.json({ ok: true });
  }
  return bad("Không rõ thao tác");
}
