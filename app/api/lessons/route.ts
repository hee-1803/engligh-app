import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Bài đã phát hành trong kho (người học tải khi mở app). Lỗi thì trả rỗng để app dùng kho trong file.
export async function GET() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ lessons: [] });
  const { data, error } = await createAdminClient().from("lessons").select("id, level, topic, topic_en, data, sort, updated_at").eq("status", "published").order("level").order("sort").order("id");
  if (error) return NextResponse.json({ lessons: [] });
  return NextResponse.json({ lessons: data }, { headers: { "Cache-Control": "private, max-age=300" } });
}
