import { createClient } from "@/lib/supabase/server";

// Danh sách email quản trị, cách nhau bởi dấu phẩy: ADMIN_EMAILS=a@gmail.com,b@gmail.com
export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase() || "";
  return { user, ok: !!user && !!email && adminEmails().includes(email), configured: adminEmails().length > 0 };
}
