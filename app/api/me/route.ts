import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Thông tin tài khoản đang đăng nhập
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const m = user.user_metadata || {};
  return NextResponse.json({
    email: user.email ?? "",
    name: m.full_name || m.name || "",
    avatar: m.avatar_url || m.picture || "",
    provider: user.app_metadata?.provider || "email",
    since: user.created_at,
  });
}
