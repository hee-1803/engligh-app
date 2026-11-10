import * as webpush from "web-push";

let ready = false;
function setup() {
  if (ready) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  ready = true;
}

export type Sub = { endpoint: string; keys: { p256dh: string; auth: string } };

// Gửi 1 thông báo. Trả về "gone" nếu thiết bị đã hủy đăng ký (cần xóa khỏi database).
export async function sendPush(sub: Sub, payload: { title: string; body: string; url?: string }) {
  setup();
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 3600, urgency: "normal" });
    return "ok";
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) return "gone";
    console.error("Gửi thông báo lỗi:", code, (e as Error).message);
    return "error";
  }
}

// Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD (giống cách app lưu ngày học)
export function todayVN() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
}
export function hourVN() {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", hour12: false }).format(new Date()));
}

// Nội dung nhắc dựa trên tiến độ học
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reminderFor(data: any) {
  const sessions: { date: string; course?: string; remedial?: boolean }[] = data?.sessions || [];
  const courseId = data?.path?.id;
  const done = sessions.filter((s) => s.course === courseId && !s.remedial).length;
  const due = Object.values(data?.cards || {}).filter((c) => (c as { due: number }).due <= Date.now()).length;
  const name = data?.profile?.name ? `${data.profile.name} ơi, ` : "";
  const testDue = done > 0 && done % 5 === 0 && (data?.tests || []).filter((t: { course?: string }) => t.course === courseId).length < done / 5;
  return {
    title: "Hôm nay bạn chưa học tiếng Anh",
    body: `${name}${testDue ? "bài kiểm tra định kỳ đang chờ bạn" : `buổi ${done + 1} đã sẵn sàng`}${due ? `, và ${due} thẻ flashcard cần ôn` : ""}. Chỉ cần ${data?.profile?.minutes || 30} phút!`,
    url: "/",
  };
}
