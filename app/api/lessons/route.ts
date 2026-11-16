import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validate, duplicates, LEVELS, type Lesson } from "@/lib/lesson-check";

/* KHO BÀI CHUNG
   GET                              → bài đã phát hành (người học tải khi mở app)
   POST {action:"contribute", lesson, situation, job}  → bài AI vừa soạn cho 1 người: tự kiểm tra, đạt thì phát hành, không đạt thì chờ duyệt, trùng thì bỏ qua
   POST {action:"report", ...}      → người học báo lỗi trong bài
   POST {action:"done", id, total}  → ghi điểm khi học xong 1 bài lấy từ kho (để phát hiện bài có vấn đề) */
const bad = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });
const CONTRIB_PER_DAY = 15, HIDE_AFTER_REPORTS = 3;

async function who() { const s = await createClient(); const { data: { user } } = await s.auth.getUser(); return user; }

export async function GET() {
  const user = await who();
  if (!user) return bad("Chưa đăng nhập", 401);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ lessons: [] });
  const { data, error } = await createAdminClient().from("lessons").select("id, level, topic, topic_en, data, sort, updated_at, source").eq("status", "published").order("level").order("sort").order("id");
  if (error) return NextResponse.json({ lessons: [] });
  return NextResponse.json({ lessons: data }, { headers: { "Cache-Control": "private, max-age=300" } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clean = (x: any, max = 600) => typeof x === "string" ? x.replace(/[<>]/g, "").slice(0, max) : x;

export async function POST(req: Request) {
  const user = await who();
  if (!user) return bad("Chưa đăng nhập", 401);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return bad("Máy chủ chưa cấu hình", 500);
  const db = createAdminClient();
  const b = await req.json().catch(() => ({}));

  if (b.action === "contribute") {
    const l = b.lesson as Lesson & Record<string, unknown>;
    if (!l || !LEVELS.includes(l.level)) return bad("Bài không hợp lệ");
    const day = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
    const { data: c } = await db.from("lesson_contrib").select("n").eq("user_id", user.id).eq("day", day).maybeSingle();
    if ((c?.n || 0) >= CONTRIB_PER_DAY) return NextResponse.json({ ok: true, skipped: "limit" });
    await db.from("lesson_contrib").upsert({ user_id: user.id, day, n: (c?.n || 0) + 1 });
    // chỉ giữ nội dung bài học, bỏ mọi trường riêng của người học
    const keep = ["level", "topic", "topic_en", "scenario", "words", "grammar", "translations", "roleplay"];
    const data: Record<string, unknown> = Object.fromEntries(keep.filter((k) => k in l).map((k) => [k, l[k]]));
    data.topic_en = (l.topic_en as string) || l.topic;
    data.situation = clean(b.situation, 120) || ""; data.job = clean(b.job, 80) || "";
    if (JSON.stringify(data).length > 60000) return NextResponse.json({ ok: true, skipped: "too-big" });
    const errs = validate(data as unknown as Lesson);
    const { data: others } = await db.from("lessons").select("id, level, topic, topic_en, data").eq("level", l.level).neq("status", "hidden").limit(800);
    const dup = duplicates(data as unknown as Lesson, (others || []) as never);
    if (dup.errors.length) return NextResponse.json({ ok: true, skipped: "duplicate" });
    const { count } = await db.from("lessons").select("id", { count: "exact", head: true }).eq("level", l.level);
    const status = errs.length ? "draft" : "published";
    const { data: row, error } = await db.from("lessons").insert({ level: l.level, topic: clean(l.topic, 160), topic_en: clean(data.topic_en, 160), data, status, sort: (count || 0) + 1, source: "ai", flagged: errs.length > 0, flag_reason: errs.length ? "Kiểm tra tự động: " + errs.slice(0, 4).join("; ") : null }).select("id").single();
    if (error) return bad(error.message, 500);
    return NextResponse.json({ ok: true, id: row?.id, status });
  }

  if (b.action === "report") {
    const kinds = ["answer", "question", "meaning", "audio", "display", "other"];
    const kind = kinds.includes(b.kind) ? b.kind : "other";
    const lessonId = b.lessonId ? String(b.lessonId) : null;
    const item = b.item && JSON.stringify(b.item).length < 8000 ? b.item : null;
    const lesson = !lessonId && b.lesson && JSON.stringify(b.lesson).length < 60000 ? b.lesson : null;
    // chống gửi liên tục: tối đa 20 báo cáo / người / ngày
    const since = new Date(Date.now() - 864e5).toISOString();
    const { count: mine } = await db.from("lesson_reports").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
    if ((mine || 0) >= 20) return bad("Bạn đã gửi nhiều báo cáo hôm nay, cảm ơn bạn!", 429);
    const { error } = await db.from("lesson_reports").insert({ lesson_id: lessonId, level: clean(b.level, 4), topic: clean(b.topic, 160), step: Number.isInteger(b.step) ? b.step : null, kind, note: clean(b.note, 600) || null, item, lesson, user_id: user.id });
    if (error) return bad(/lesson_reports/.test(error.message) ? "Chưa tạo bảng báo lỗi: chạy supabase/lessons2.sql" : error.message, 500);
    if (lessonId) {
      // đủ số người khác nhau báo lỗi → tự ẩn bài cho tới khi quản trị viên xem lại
      const { data: rs } = await db.from("lesson_reports").select("user_id").eq("lesson_id", lessonId).eq("status", "open");
      const n = new Set((rs || []).map((r) => r.user_id)).size;
      const upd: Record<string, unknown> = { reports: n, flagged: true, flag_reason: `${n} người báo lỗi` };
      if (n >= HIDE_AFTER_REPORTS) upd.status = "hidden";
      await db.from("lessons").update(upd).eq("id", lessonId);
    }
    return NextResponse.json({ ok: true });
  }

  if (b.action === "done" && b.id) {
    const total = Math.max(0, Math.min(100, Number(b.total) || 0));
    const { data: r } = await db.from("lessons").select("uses, score_sum, flagged").eq("id", b.id).maybeSingle();
    if (!r) return NextResponse.json({ ok: true });
    const uses = (r.uses || 0) + 1, sum = (r.score_sum || 0) + total, avg = sum / uses;
    const upd: Record<string, unknown> = { uses, score_sum: sum };
    if (uses >= 5 && avg < 45 && !r.flagged) { upd.flagged = true; upd.flag_reason = `Điểm trung bình thấp bất thường (${Math.round(avg)}/100 sau ${uses} lượt học)`; }
    await db.from("lessons").update(upd).eq("id", b.id);
    return NextResponse.json({ ok: true });
  }
  return bad("Không rõ thao tác");
}
