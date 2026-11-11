// Tiện ích cho trò chuyện ẩn danh (chỉ dùng ở server)
import { createHash } from "crypto";

const ANIMALS = ["Cáo", "Mèo", "Gấu", "Thỏ", "Cú", "Sóc", "Hươu", "Rái cá", "Chim sẻ", "Cá heo", "Gấu trúc", "Chim cánh cụt", "Hải ly", "Nhím", "Vẹt", "Ong"];
const COLORS = ["Xanh", "Hồng", "Tím", "Vàng", "Cam", "Bạc", "Ngọc", "Mây", "Nắng", "Gió", "Trăng", "Sao"];
const ICONS = ["🦊", "🐱", "🐻", "🐰", "🦉", "🐿️", "🦌", "🦦", "🐦", "🐬", "🐼", "🐧", "🦫", "🦔", "🦜", "🐝"];

// Biệt danh ẩn danh: cố định theo người + phòng + ngày, đổi mỗi ngày để không ai lần ra ai
// Phòng ghép đôi: biệt danh cố định suốt cuộc trò chuyện (để nhận ra nhau khi nhắn mỗi ngày)
export function alias(userId: string, room: string) {
  const day = room.startsWith("p-") ? "pair" : new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  const h = createHash("sha256").update(`${process.env.CHAT_SALT || process.env.CRON_SECRET || "ep"}|${userId}|${room}|${day}`).digest();
  const a = h[0] % ANIMALS.length;
  return { name: `${ANIMALS[a]} ${COLORS[h[1] % COLORS.length]} #${(h[2] % 90) + 10}`, icon: ICONS[a], hue: h[3] % 360 };
}

// Chặn thông tin cá nhân để giữ ẩn danh và an toàn
const PII = [
  /(?:\+?84|0)(?:[\s.-]?\d){8,10}/,                         // số điện thoại
  /[\w.+-]+@[\w-]+\.[\w.]+/,                                  // email
  /\b(?:https?:\/\/|www\.)\S+/i,                              // đường link
  /\b(?:zalo|facebook|fb\.com|instagram|insta|ig|telegram|tele|tiktok|messenger|snapchat|discord|wechat|line id)\b/i,
  /@[a-z0-9_.]{3,}/i,                                         // tên tài khoản mạng xã hội
];
const BAD = ["địt", "đụ", "lồn", "buồi", "cặc", "đéo", "đĩ", "fuck", "shit", "bitch", "cunt", "dick", "pussy", "nigger", "nigga", "đmm", "dmm", "vcl", "vkl", "clm", "cl", "đcm", "dcm"];
const norm = (s: string) => s.toLowerCase().normalize("NFC");
export function checkText(t: string): string | null {
  if (PII.some((r) => r.test(t))) return "Để giữ ẩn danh và an toàn, không gửi số điện thoại, email, đường link hay tài khoản mạng xã hội.";
  const words = norm(t).split(/[^\p{L}\p{N}]+/u);
  if (BAD.some((b) => words.includes(b) || (/[^\x00-\x7f]/.test(b) && norm(t).includes(b)))) return "Tin nhắn có từ ngữ không phù hợp. Hãy trò chuyện lịch sự nhé.";
  return null;
}
export const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];
