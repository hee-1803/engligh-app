import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ABOUT_DEFAULT } from "@/lib/about";

// Nội dung trang "Về SEED" (công khai, chỉ đọc). Lỗi / chưa có bảng → trả nội dung mặc định.
export async function GET() {
  let about = ABOUT_DEFAULT;
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data } = await createAdminClient().from("app_content").select("value").eq("key", "about").maybeSingle();
      if (data?.value) about = { ...ABOUT_DEFAULT, ...data.value };
    }
  } catch {}
  return NextResponse.json({ about }, { headers: { "Cache-Control": "public, max-age=60" } });
}
