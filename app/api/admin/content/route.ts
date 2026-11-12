import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ABOUT_DEFAULT, type About } from "@/lib/about";

const KEYS = Object.keys(ABOUT_DEFAULT) as (keyof About)[];
async function guard() {
  const a = await requireAdmin();
  if (!a.ok) return { deny: NextResponse.json({ error: a.configured ? "Bạn không có quyền quản trị" : "Chưa đặt ADMIN_EMAILS" }, { status: 403 }) };
  return { email: a.user?.email || "" };
}
export async function GET() {
  const g = await guard(); if ("deny" in g) return g.deny;
  const { data, error } = await createAdminClient().from("app_content").select("value, updated_at").eq("key", "about").maybeSingle();
  if (error) return NextResponse.json({ about: ABOUT_DEFAULT, error: error.message.includes("app_content") ? "Chưa tạo bảng app_content: chạy supabase/content.sql" : error.message });
  return NextResponse.json({ about: { ...ABOUT_DEFAULT, ...(data?.value || {}) }, updated_at: data?.updated_at || null });
}
export async function POST(req: Request) {
  const g = await guard(); if ("deny" in g) return g.deny;
  const b = await req.json().catch(() => ({}));
  if (b.reset) { await createAdminClient().from("app_content").delete().eq("key", "about"); return NextResponse.json({ ok: true, about: ABOUT_DEFAULT }); }
  const v: Partial<About> = {};
  for (const k of KEYS) { const x = b.about?.[k]; if (typeof x === "string") v[k] = x.slice(0, k.startsWith("bio") ? 1500 : 300).trim(); }
  if (!v.name) return NextResponse.json({ error: "Thiếu tên người sáng lập" }, { status: 400 });
  const { error } = await createAdminClient().from("app_content").upsert({ key: "about", value: v, updated_at: new Date().toISOString(), updated_by: g.email });
  if (error) return NextResponse.json({ error: error.message.includes("app_content") ? "Chưa tạo bảng app_content: chạy supabase/content.sql trong Supabase" : error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
