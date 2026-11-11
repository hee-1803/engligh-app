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
// Số phút tính từ 0h theo giờ Việt Nam
export function minutesVN() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value) % 24, m = Number(parts.find((p) => p.type === "minute")?.value);
  return h * 60 + m;
}
const toMin = (t: string) => { const [h, m] = String(t || "").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
// Người dùng có lần nhắc rơi vào khoảng [now - window, now] không? (cron chạy mỗi `window` phút)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dueNow(profile: any, now: number, window: number) {
  if (!profile || profile.remindOn === false) return false;
  const start = toMin(profile.remind || "20:00"), end = Math.max(toMin(profile.remindEnd || "23:00"), start), every = Math.max(15, Number(profile.remindEvery || 60));
  for (let t = start; t <= end; t += every) if (now >= t && now < t + window) return true;
  return false;
}
export function hourVN() {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", hour12: false }).format(new Date()));
}

// Nội dung nhắc dựa trên tiến độ học
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Lời nhắc "lầy lội": chọn theo tình trạng học, đổi câu mỗi lần nhắc
const SPICY: Record<string, [string, string][]> = {
  cards: [
    ["📇 Flashcard hóa thạch rồi!", "Đống flashcard chờ bạn lật đến mức mọc rêu rồi. Lười thế này chừng nào mới nhớ được từ vựng?"],
    ["🃏 Từ vựng đang mọc rêu", "{due} thẻ flashcard đang chờ bạn. Não dạo này tụt về trình độ A0 rồi đúng không?"],
  ],
  unfinished: [
    ["🛑 Gãy chuỗi 6 bước rồi!", "Học được nửa bài rồi bỏ ngang để lướt TikTok à? Hoàn thành nốt 6 bước của hôm nay đi, đừng có lười!"],
  ],
  test: [
    ["🫣 Vietsub cuộc đời", "Tương lai mù mịt như cái cách bạn nghe tiếng Anh không có sub vậy. Vào làm ngay bài Test hôm nay để sáng mắt ra!"],
  ],
  any: [
    ["🤖 AI đang chê bạn dở kìa!", "Setup sẵn AI để role-play mà bạn bơ nó luôn à? Vào combat tiếng Anh với nó ngay, đừng để máy móc khinh mình!"],
    ["✈️ Gặp Tây lại \"I am fine thank you\"?", "Đừng để vốn từ chỉ dừng ở mức sách giáo khoa lớp 3. Mở app lên nạp thêm từ vựng sinh tồn đi!"],
    ["📉 Lại định kẹt ở {level} cả đời à?", "Lộ trình 3 tháng thành 3 năm nếu bạn cứ sủi học thế này đấy. Bật app lên kéo trình độ lên ngay!"],
    ["🗣️ Tiếng Anh \"No star where\"?", "Phát âm \"phèn\" thế người ta chạy mất dép. Vào học lẹ để cứu rỗi đôi tai người nghe đi má!"],
    ["🕸️ Tôi đóng nhện rồi!", "Màn hình điện thoại vuốt mòn cả kính mà cái icon app này không thèm chạm lấy một lần?"],
    ["🛑 App xin từ chức!", "Phục vụ một người chủ lười biếng thật quá sức chịu đựng. Hãy vào học để níu kéo tôi đi."],
    ["🕯️ Tải app về để thờ à?", "Bật lên \"nhang khói\" vài chữ cho nó đỡ tủi thân đi má!"],
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reminderFor(data: any) {
  const sessions: { date: string; course?: string; remedial?: boolean }[] = data?.sessions || [];
  const courseId = data?.path?.id;
  const done = sessions.filter((s) => s.course === courseId && !s.remedial).length;
  const due = Object.values(data?.cards || {}).filter((c) => (c as { due: number }).due <= Date.now()).length;
  const name = data?.profile?.name ? `${data.profile.name} ơi, ` : "";
  const testDue = done > 0 && done % 5 === 0 && (data?.tests || []).filter((t: { course?: string }) => t.course === courseId).length < done / 5;
  // Đúng ngày sinh nhật: lời nhắc chúc mừng thay vì "chê"
  const bd = String(data?.profile?.birthday || "").slice(-5);
  if (bd && bd === todayVN().slice(5)) {
    return { title: `🎂 Chúc mừng sinh nhật${data?.profile?.name ? " " + data.profile.name : ""}!`,
      body: "Hôm nay là ngày của bạn. Mở app xem món quà nhỏ, rồi học một bài thật nhẹ nhàng nhé. Happy birthday! 🎉", url: "/" };
  }
  if (data?.profile?.remindTone !== "soft") {
    const unfinished = !!(data?.current && data.current.step > 0);
    // Ưu tiên lời nhắc đúng tình trạng (khoảng 60%), còn lại lấy câu chung cho đỡ nhàm
    const pool = [...(unfinished ? SPICY.unfinished : []), ...(testDue ? SPICY.test : []), ...(due >= 5 ? SPICY.cards : [])];
    const list = pool.length && Math.random() < 0.6 ? pool : SPICY.any;
    const [t, b] = list[Math.floor(Math.random() * list.length)];
    const fill = (x: string) => x.replace("{due}", String(due)).replace("{level}", data?.level || "A0");
    return { title: fill(t), body: fill(b), url: "/" };
  }
  return {
    title: "Hôm nay bạn chưa học tiếng Anh",
    body: `${name}${testDue ? "bài kiểm tra định kỳ đang chờ bạn" : `buổi ${done + 1} đã sẵn sàng`}${due ? `, và ${due} thẻ flashcard cần ôn` : ""}. Chỉ cần ${data?.profile?.minutes || 30} phút!`,
    url: "/",
  };
}
