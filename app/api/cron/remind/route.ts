import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush, todayVN, minutesVN, dueNow, reminderFor, type Sub } from "@/lib/push";

// Supabase (pg_cron) gọi route này mỗi 15 phút.
// Mỗi người dùng có lịch nhắc riêng trong Cài đặt (bắt đầu, kết thúc, nhắc mỗi bao lâu).
// Gửi cho ai đến giờ nhắc mà hôm nay chưa học.
const WINDOW = Number(process.env.CRON_EVERY_MINUTES ?? 15);

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Thiếu SUPABASE_SERVICE_ROLE_KEY hoặc VAPID_PRIVATE_KEY trong biến môi trường" }, { status: 500 });
  }
  const test = new URL(req.url).searchParams.get("force") === "1"; // ?force=1: bỏ qua giờ nhắc để thử
  const db = createAdminClient();
  const { data: subs, error } = await db.from("push_subscriptions").select("user_id, endpoint, keys");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs?.length) return NextResponse.json({ sent: 0, note: "chưa có thiết bị nào bật thông báo" });

  const userIds = [...new Set(subs.map((s) => s.user_id))];
  const { data: states } = await db.from("app_state").select("user_id, data").in("user_id", userIds);
  const byUser = new Map((states || []).map((s) => [s.user_id, s.data]));
  const today = todayVN(), now = minutesVN();

  let sent = 0, skipped = 0;
  const gone: string[] = [];
  for (const s of subs) {
    const data = byUser.get(s.user_id);
    // "Đã học hôm nay": xong một buổi, làm bài kiểm tra, hoặc có học/ôn trong app hôm nay (kể cả học dở, ôn flashcard)
    const studied = (data?.sessions || []).some((x: { date: string }) => x.date === today)
      || (data?.tests || []).some((x: { date: string }) => x.date === today) || data?.lastActive === today;
    if (!data?.path || studied || (!test && !dueNow(data.profile, now, WINDOW))) { skipped++; continue; }
    const r = await sendPush({ endpoint: s.endpoint, keys: s.keys } as Sub, reminderFor(data));
    if (r === "ok") sent++;
    if (r === "gone") gone.push(s.endpoint);
  }
  if (gone.length) await db.from("push_subscriptions").delete().in("endpoint", gone);
  return NextResponse.json({ sent, skipped, removed: gone.length, today, time: `${Math.floor(now / 60)}:${String(now % 60).padStart(2, "0")}` });
}
