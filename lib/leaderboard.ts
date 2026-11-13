// BẢNG XẾP HẠNG TUẦN + GIẢI ĐẤU + PHẦN THƯỞNG
// Điểm do máy chủ tự tính từ dữ liệu học (app_state) mỗi lần lưu tiến độ, người dùng không gửi điểm lên.
import { alias } from "@/lib/chat";
import { sendPush, type Sub } from "@/lib/push";

type Db = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export const LEAGUES = [
  { k: 0, vi: "Hạt giống", en: "Seed", ic: "🌰" },
  { k: 1, vi: "Mầm non", en: "Sprout", ic: "🌱" },
  { k: 2, vi: "Cây non", en: "Sapling", ic: "🌿" },
  { k: 3, vi: "Cây lớn", en: "Tree", ic: "🌳" },
  { k: 4, vi: "Đại thụ", en: "Great Tree", ic: "🏞️" },
];
export const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];

// Khung ảnh đại diện & cách mở khoá
export const FRAMES: Record<string, { vi: string; en: string; how_vi: string; how_en: string }> = {
  leaf: { vi: "Vòng lá", en: "Leaf ring", how_vi: "Lần đầu đạt 300 điểm trong 1 tuần", how_en: "Reach 300 points in a week" },
  music: { vi: "Nốt nhạc", en: "Music notes", how_vi: "Vào top 10 tuần", how_en: "Finish a week in the top 10" },
  flower: { vi: "Vòng hoa", en: "Flower crown", how_vi: "Vào top 3 tuần", how_en: "Finish a week in the top 3" },
  gold: { vi: "Vàng", en: "Gold", how_vi: "Hạng nhất tuần", how_en: "Finish a week in 1st place" },
  forest: { vi: "Rừng xanh", en: "Forest", how_vi: "Lên giải Cây lớn", how_en: "Reach the Tree league" },
  rainbow: { vi: "Cầu vồng", en: "Rainbow", how_vi: "Lên giải Đại thụ", how_en: "Reach the Great Tree league" },
};
export const TITLES: Record<string, { vi: string; en: string }> = {
  t1: { vi: "🐐 Dê đầu đàn", en: "🐐 Lead Goat" },
  t3: { vi: "🌳 Cây đại thụ", en: "🌳 Mighty Oak" },
  t10: { vi: "🌟 Ngôi sao tuần", en: "🌟 Star of the Week" },
};
// Mốc điểm trong tuần (ai cũng đạt được, không cần lên top)
export const MILESTONES = [
  { p: 50, vi: "Huy hiệu Chăm chỉ 🐝", en: "Busy Bee badge 🐝", gift: "bee" },
  { p: 150, vi: "1 Đóng băng chuỗi 🧊", en: "1 Streak Freeze 🧊", gift: "freeze" },
  { p: 300, vi: "Khung ảnh Vòng lá 🍃", en: "Leaf ring frame 🍃", gift: "leaf" },
  { p: 500, vi: "Huy hiệu Bền bỉ 🔥", en: "Unstoppable badge 🔥", gift: "fire" },
];
export const MAX_FREEZE = 3;
export const DAY_CAP = 300;

// ---- Ngày giờ theo giờ Việt Nam ----
const VN = 7 * 3600e3;
export const dayVN = (t = Date.now()) => new Date(t + VN).toISOString().slice(0, 10);
const addDays = (d: string, n: number) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export function weekOf(d = dayVN()) { const wd = (new Date(d + "T00:00:00Z").getUTCDay() + 6) % 7; return addDays(d, -wd); } // thứ Hai
export const prevWeek = (w: string) => addDays(w, -7);
export const weekEnd = (w: string) => Date.parse(addDays(w, 7) + "T00:00:00Z") - VN; // 0h thứ Hai tuần sau (giờ VN)

// ---- Điểm tuần tính từ dữ liệu học ----
// Buổi học: 20 + điểm/10 · Bài kiểm tra: 40 + điểm/10 · Ôn flashcard: 2/thẻ (tối đa 60/ngày) · Mỗi ngày có học: +10 · Tối đa 300/ngày
export function weekPoints(d: any, week: string) {
  const end = addDays(week, 7), inW = (x?: string) => !!x && x >= week && x < end;
  const day: Record<string, number> = {};
  const add = (k: string, n: number) => { day[k] = (day[k] || 0) + n; };
  for (const s of d?.sessions || []) if (inW(s.date)) add(s.date, 20 + Math.round(Math.min(100, Number(s.total) || 0) / 10));
  for (const t of d?.tests || []) if (inW(t.date)) add(t.date, 40 + Math.round(Math.min(100, Number(t.score) || 0) / 10));
  for (const [k, n] of Object.entries(d?.revDays || {})) if (inW(k)) add(k, Math.min(60, 2 * (Number(n) || 0)));
  let total = 0;
  for (const k of Object.keys(day)) total += Math.min(DAY_CAP, day[k] + 10);
  return total;
}
export const levelOf = (d: any) => (LEVELS.includes(d?.level) ? d.level : "A0");

type Prof = { user_id: string; league: number; opt_out: boolean; show_name: boolean; display_name: string | null; badges: any[]; title: string | null; title_week: string | null; frames: string[]; frame: string | null; freezes: number; milestones: Record<string, number[]>; last_overtaken: string | null; seen_week: string | null; last_result?: any };
export const blankProf = (uid: string): Prof => ({ user_id: uid, league: 0, opt_out: false, show_name: false, display_name: null, badges: [], title: null, title_week: null, frames: [], frame: null, freezes: 0, milestones: {}, last_overtaken: null, seen_week: null });
export async function getProf(db: Db, uid: string): Promise<Prof> {
  const { data } = await db.from("lb_profile").select("*").eq("user_id", uid).maybeSingle();
  return data ? { ...blankProf(uid), ...data, badges: data.badges || [], frames: data.frames || [], milestones: data.milestones || {} } : blankProf(uid);
}

// Gọi sau mỗi lần lưu tiến độ: cập nhật điểm tuần, trao mốc điểm, báo cho người vừa bị vượt
export async function updateScore(db: Db, uid: string, d: any) {
  const week = weekOf(), level = levelOf(d), points = weekPoints(d, week);
  const prof = await getProf(db, uid);
  const { data: old } = await db.from("lb_scores").select("points, level, league").eq("user_id", uid).eq("week", week).maybeSingle();
  if (old && old.points === points && old.level === level) return { points };
  await db.from("lb_scores").upsert({ user_id: uid, week, level, league: prof.league, points, updated_at: new Date().toISOString() });

  // Mốc điểm trong tuần
  const got = prof.milestones[week] || [], fresh = MILESTONES.filter((m) => points >= m.p && !got.includes(m.p));
  if (fresh.length) {
    const ms = { ...prof.milestones, [week]: [...got, ...fresh.map((m) => m.p)] };
    for (const k of Object.keys(ms)) if (k < prevWeek(prevWeek(week))) delete ms[k]; // chỉ giữ vài tuần gần nhất
    const badges = [...prof.badges], frames = [...prof.frames]; let freezes = prof.freezes;
    for (const m of fresh) {
      if (m.gift === "freeze") freezes = Math.min(MAX_FREEZE, freezes + 1);
      else if (m.gift === "leaf") { if (!frames.includes("leaf")) frames.push("leaf"); }
      else badges.push({ k: m.gift, w: week, level });
    }
    await db.from("lb_profile").upsert({ ...prof, milestones: ms, badges: badges.slice(-200), frames, freezes });
  }

  // Báo cho người trong cùng bảng vừa bị vượt (mỗi người tối đa 1 lần/ngày)
  if (!prof.opt_out && old && points > old.points) {
    try {
      const { data: passed } = await db.from("lb_scores").select("user_id, points").eq("week", week).eq("level", level).eq("league", prof.league)
        .gte("points", old.points).lt("points", points).gt("points", 0).neq("user_id", uid).limit(5);
      const today = dayVN();
      for (const p of passed || []) {
        const pp = await getProf(db, p.user_id);
        if (pp.opt_out || pp.last_overtaken === today) continue;
        const { data: subs } = await db.from("push_subscriptions").select("endpoint, keys").eq("user_id", p.user_id);
        if (!subs?.length) continue;
        const { data: st } = await db.from("app_state").select("data").eq("user_id", p.user_id).maybeSingle();
        const en = st?.data?.profile?.uiLang === "en", who = alias(uid, "leaderboard");
        const msg = en
          ? { title: "😈 Someone just passed you!", body: `${who.name_en} overtook you on the ${level} leaderboard. One lesson and you're back on top!`, url: "/?view=rank" }
          : { title: "😈 Có người vừa vượt bạn!", body: `${who.name} vừa vượt bạn trên bảng xếp hạng ${level}. Học 1 bài là giành lại ngay!`, url: "/?view=rank" };
        for (const s of subs) { try { await sendPush({ endpoint: s.endpoint, keys: s.keys } as Sub, msg); } catch {} }
        await db.from("lb_profile").upsert({ ...pp, last_overtaken: today });
      }
    } catch {}
  }
  return { points };
}

// Chốt tuần trước (chạy 1 lần, người đầu tiên mở bảng xếp hạng trong tuần mới sẽ kích hoạt)
export async function finalizeWeek(db: Db, week: string) {
  const { data: claimed, error } = await db.from("lb_weeks").insert({ week }).select("week");
  if (error || !claimed?.length) return false; // đã chốt rồi (hoặc người khác đang chốt)
  const { data: rows } = await db.from("lb_scores").select("user_id, level, league, points").eq("week", week).gt("points", 0);
  const groups = new Map<string, { user_id: string; points: number; level: string; league: number }[]>();
  for (const r of rows || []) { const k = r.level + "|" + r.league; (groups.get(k) || groups.set(k, []).get(k)!).push(r); }
  const next = addDays(week, 7);
  const ids = (rows || []).map((r: any) => r.user_id);
  const profs = new Map<string, Prof>();
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await db.from("lb_profile").select("*").in("user_id", ids.slice(i, i + 200));
    for (const p of data || []) profs.set(p.user_id, { ...blankProf(p.user_id), ...p, badges: p.badges || [], frames: p.frames || [], milestones: p.milestones || {} });
  }
  const out: Prof[] = [];
  for (const list of groups.values()) {
    list.sort((a, b) => b.points - a.points);
    const n = list.length, up = Math.max(1, Math.ceil(n * 0.2)), down = n >= 5 ? Math.floor(n * 0.2) : 0;
    list.forEach((r, i) => {
      const rank = i + 1, p = profs.get(r.user_id) || blankProf(r.user_id);
      if (p.opt_out) return;
      const res: any = { w: week, level: r.level, league: r.league, rank, of: n, points: r.points };
      if (rank <= 10) {
        res.k = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "star";
        p.badges = [...p.badges, res].slice(-200);
        p.title = rank === 1 ? "t1" : rank <= 3 ? "t3" : "t10"; p.title_week = next;
        for (const f of [rank <= 10 && "music", rank <= 3 && "flower", rank === 1 && "gold"]) if (f && !p.frames.includes(f)) p.frames.push(f);
        p.freezes = Math.min(MAX_FREEZE, p.freezes + 1);
      }
      if (rank <= up && r.points >= 50 && p.league < 4) { p.league++; res.move = "up"; }
      else if (down && rank > n - down && p.league > 0) { p.league--; res.move = "down"; }
      if (p.league >= 3 && !p.frames.includes("forest")) p.frames.push("forest");
      if (p.league >= 4 && !p.frames.includes("rainbow")) p.frames.push("rainbow");
      p.last_result = res;
      out.push(p);
    });
  }
  for (let i = 0; i < out.length; i += 200) await db.from("lb_profile").upsert(out.slice(i, i + 200));
  return true;
}

export function shownName(p: Prof | undefined, uid: string) {
  const a = alias(uid, "leaderboard");
  if (p?.show_name && p.display_name) return { name: p.display_name, name_en: p.display_name, icon: a.icon, hue: a.hue, real: true };
  return { name: a.name, name_en: a.name_en, icon: a.icon, hue: a.hue, real: false };
}
export const curTitle = (p?: Prof | null) => (p?.title && p.title_week === weekOf() ? TITLES[p.title] || null : null);
