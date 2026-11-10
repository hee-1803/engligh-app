import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush, todayVN, hourVN, reminderFor, type Sub } from "@/lib/push";

// Được Supabase (pg_cron) gọi mỗi 2 tiếng. Gửi nhắc cho ai hôm nay chưa học.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 401 });
  }
  const start = Number(process.env.REMIND_START_HOUR ?? 8), end = Number(process.env.REMIND_END_HOUR ?? 22), h = hourVN();
  if (h < start || h > end) return NextResponse.json({ skipped: "ngoài giờ nhắc", hour: h });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Thiếu SUPABASE_SERVICE_ROLE_KEY hoặc VAPID_PRIVATE_KEY trong biến môi trường" }, { status: 500 });
  }
  const db = createAdminClient();
  const { data: subs, error } = await db.from("push_subscriptions").select("user_id, endpoint, keys");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs?.length) return NextResponse.json({ sent: 0, note: "chưa có thiết bị nào bật thông báo" });

  const userIds = [...new Set(subs.map((s) => s.user_id))];
  const { data: states } = await db.from("app_state").select("user_id, data").in("user_id", userIds);
  const byUser = new Map((states || []).map((s) => [s.user_id, s.data]));
  const today = todayVN();

  let sent = 0, skipped = 0;
  const gone: string[] = [];
  for (const s of subs) {
    const data = byUser.get(s.user_id);
    const studied = (data?.sessions || []).some((x: { date: string }) => x.date === today);
    if (studied || !data?.path) { skipped++; continue; }
    const r = await sendPush({ endpoint: s.endpoint, keys: s.keys } as Sub, reminderFor(data));
    if (r === "ok") sent++;
    if (r === "gone") gone.push(s.endpoint);
  }
  if (gone.length) await db.from("push_subscriptions").delete().in("endpoint", gone);
  return NextResponse.json({ sent, skipped, removed: gone.length, today, hour: h });
}
