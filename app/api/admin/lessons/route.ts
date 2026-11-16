import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validate, duplicates, LEVELS, type Lesson } from "@/lib/lesson-check";

/* Quản lý kho bài (chỉ quản trị viên)
   GET  ?id=12              → 1 bài (để sửa / xem thử)
   GET                      → danh sách (không kèm nội dung đầy đủ)
   POST {action:"check", lesson, id?}      → kiểm tra cấu trúc + trùng, không lưu
   POST {action:"save", lesson, id?, status} → lưu (nháp hoặc phát hành); phát hành thì phải không có lỗi
   POST {action:"status", id, status}       → phát hành / ẩn / về nháp
   POST {action:"import", lessons:[...]}    → nhập kho bài có sẵn (bỏ qua bài trùng tên) */
async function guard() {
  const a = await requireAdmin();
  if (!a.ok) return { deny: NextResponse.json({ error: a.configured ? "Bạn không có quyền quản trị" : "Chưa đặt ADMIN_EMAILS" }, { status: 403 }) };
  return { email: a.user?.email || "" };
}
type Row = { id: number | string; level: string; topic: string; topic_en?: string; data: Lesson; status: string; sort: number; source: string; updated_at: string };

export async function GET(req: Request) {
  const g = await guard(); if (g.deny) return g.deny;
  const db = createAdminClient(), id = new URL(req.url).searchParams.get("id");
  const u = new URL(req.url);
  if (u.searchParams.get("reports")) {
    const st = u.searchParams.get("reports") === "done" ? "done" : "open";
    const { data, error } = await db.from("lesson_reports").select("*").eq("status", st).order("created_at", { ascending: false }).limit(300);
    if (error) return NextResponse.json({ reports: [], error: /lesson_reports/.test(error.message) ? "Chưa tạo bảng báo lỗi: chạy supabase/lessons2.sql" : error.message });
    return NextResponse.json({ reports: data });
  }
  if (id) { const { data } = await db.from("lessons").select("*").eq("id", id).maybeSingle(); return data ? NextResponse.json(data) : NextResponse.json({ error: "Không tìm thấy" }, { status: 404 }); }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data, error }: { data: any; error: any } = await db.from("lessons").select("id, level, topic, topic_en, status, sort, source, updated_at, flagged, flag_reason, reports, uses, score_sum").order("level").order("sort").order("id");
  if (error && /flagged|reports|uses|score_sum|flag_reason/.test(error.message)) ({ data, error } = await db.from("lessons").select("id, level, topic, topic_en, status, sort, source, updated_at").order("level").order("sort").order("id")); // chưa chạy lessons2.sql
  if (error) return NextResponse.json({ error: error.message.includes("lessons") ? "Chưa tạo bảng lessons (chạy supabase/lessons.sql)" : error.message }, { status: 500 });
  return NextResponse.json({ lessons: data });
}

async function check(db: ReturnType<typeof createAdminClient>, l: Lesson, id?: number | string) {
  const errors = validate(l);
  const { data } = await db.from("lessons").select("id, level, topic, topic_en, data").neq("status", "hidden");
  const d = duplicates(l, ((data || []) as Row[]).filter((o) => o.id !== id));
  return { errors: [...errors, ...d.errors], warns: d.warns };
}

export async function POST(req: Request) {
  const g = await guard(); if (g.deny) return g.deny;
  const db = createAdminClient(), b = await req.json();
  if (b.action === "check") return NextResponse.json(await check(db, b.lesson, b.id));
  // Báo lỗi từ người học: đánh dấu đã xử lý / mở lại / xoá
  if (b.action === "report") {
    if (b.op === "delete") { const { error } = await db.from("lesson_reports").delete().eq("id", b.id); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true }); }
    const status = b.op === "reopen" ? "open" : "done";
    const { data: r, error } = await db.from("lesson_reports").update({ status }).eq("id", b.id).select("lesson_id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (r?.lesson_id) { // cập nhật số báo cáo còn mở của bài
      const { data: rs } = await db.from("lesson_reports").select("user_id").eq("lesson_id", r.lesson_id).eq("status", "open");
      const n = new Set((rs || []).map((x: { user_id: string }) => x.user_id)).size;
      await db.from("lessons").update({ reports: n, ...(n === 0 ? { flagged: false, flag_reason: null } : {}) }).eq("id", r.lesson_id);
    }
    return NextResponse.json({ ok: true });
  }
  // Bỏ cờ "cần xem lại" khi đã kiểm tra bài
  if (b.action === "unflag") { const { error } = await db.from("lessons").update({ flagged: false, flag_reason: null }).eq("id", b.id); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true }); }
  if (b.action === "save") {
    const l: Lesson = b.lesson, status = ["draft", "published"].includes(b.status) ? b.status : "draft";
    const r = await check(db, l, b.id);
    if (status === "published" && r.errors.length) return NextResponse.json({ ...r, error: "Còn lỗi, chưa phát hành được" }, { status: 400 });
    if (!LEVELS.includes(l?.level) || !l?.topic?.trim()) return NextResponse.json({ ...r, error: "Cần ít nhất trình độ và tên bài để lưu nháp" }, { status: 400 });
    const row = { level: l.level, topic: l.topic.trim(), topic_en: l.topic_en?.trim() || null, data: l, status, updated_at: new Date().toISOString() };
    if (b.id) { const { error } = await db.from("lessons").update(row).eq("id", b.id); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json({ ok: true, id: b.id, ...r }); }
    const { count } = await db.from("lessons").select("id", { count: "exact", head: true }).eq("level", l.level);
    const { data, error } = await db.from("lessons").insert({ ...row, sort: (count || 0) + 1, source: b.source || "admin", created_by: g.email }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data.id, ...r });
  }
  if (b.action === "delete") {
    const { error } = await db.from("lessons").delete().eq("id", b.id);
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
  }
  if (b.action === "status") {
    if (!["draft", "published", "hidden"].includes(b.status)) return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
    if (b.status === "published") {
      const { data: row } = await db.from("lessons").select("data").eq("id", b.id).maybeSingle();
      const r = row ? await check(db, row.data, b.id) : { errors: ["Không tìm thấy"], warns: [] };
      if (r.errors.length) return NextResponse.json({ ...r, error: "Còn lỗi, chưa phát hành được" }, { status: 400 });
    }
    await db.from("lessons").update({ status: b.status, updated_at: new Date().toISOString() }).eq("id", b.id);
    return NextResponse.json({ ok: true });
  }
  if (b.action === "import") {
    const { data: have } = await db.from("lessons").select("level, topic");
    const seen = new Set((have || []).map((x) => `${x.level}|${x.topic}`));
    const rows = (b.lessons || []).filter((l: Lesson) => LEVELS.includes(l.level) && !seen.has(`${l.level}|${l.topic}`))
      .map((l: Lesson, i: number) => ({ level: l.level, topic: l.topic, topic_en: l.topic_en || null, data: l, status: "published", sort: i + 1, source: "file", created_by: g.email }));
    if (rows.length) { const { error } = await db.from("lessons").insert(rows); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); }
    return NextResponse.json({ ok: true, added: rows.length, skipped: (b.lessons || []).length - rows.length });
  }
  return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
}
