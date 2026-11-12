"use client";
import Legal, { useLang, contact } from "../legal";

export default function DeletionBody() {
  const en = useLang() === "en", C = contact(en);
  if (en) return (
    <Legal en title="Deleting your data" updated="12/11/2026">
      <p>You are fully in control of deleting your data from SEED.</p>
      <h2>Delete your progress yourself in the app</h2>
      <ol>
        <li>Sign in to the app.</li>
        <li>Go to <b>Settings</b> → <b>Data</b>.</li>
        <li>Tap <b>Delete progress and start over</b>, then tap again to confirm.</li>
      </ol>
      <p>This immediately deletes all your lessons, scores, flashcards and reminders.</p>
      <h2>Ask us to delete your account completely</h2>
      <p>Email <b>{C}</b> with the subject <b>&quot;Delete my account&quot;</b> and include the email or phone number you sign in with. We will delete your account and all related data, including chat messages, within 30 days and reply to confirm.</p>
      <h2>Removing access from Facebook</h2>
      <p>On Facebook, go to <b>Settings &amp; privacy → Settings → Apps and websites</b>, choose <b>SEED</b> and tap <b>Remove</b>. Then send a request as in Option 2 if you also want your learning data deleted.</p>
    </Legal>
  );
  return (
    <Legal en={false} title="Hướng dẫn xóa dữ liệu" updated="12/11/2026">
      <p>Bạn có toàn quyền xóa dữ liệu của mình khỏi SEED.</p>
      <h2>Tự xóa tiến độ học trong ứng dụng</h2>
      <ol>
        <li>Đăng nhập ứng dụng.</li>
        <li>Vào <b>Cài đặt</b> → <b>Dữ liệu</b>.</li>
        <li>Bấm <b>Xóa tiến độ và làm lại</b> rồi bấm lần nữa để xác nhận.</li>
      </ol>
      <p>Thao tác này xóa ngay toàn bộ bài học, điểm số, flashcard và lịch nhắc của bạn.</p>
      <h2>Yêu cầu xóa hẳn tài khoản</h2>
      <p>Gửi email tới <b>{C}</b> với tiêu đề <b>&quot;Xóa tài khoản&quot;</b>, ghi rõ email hoặc số điện thoại bạn dùng để đăng nhập. Chúng tôi sẽ xóa tài khoản và mọi dữ liệu liên quan, kể cả tin nhắn trò chuyện, trong vòng 30 ngày và trả lời xác nhận cho bạn.</p>
      <h2>Gỡ quyền truy cập từ Facebook</h2>
      <p>Trên Facebook, vào <b>Cài đặt và quyền riêng tư → Cài đặt → Ứng dụng và trang web</b>, chọn <b>SEED</b> rồi bấm <b>Gỡ</b>. Sau đó gửi yêu cầu theo Cách 2 nếu muốn xóa cả dữ liệu học tập.</p>
    </Legal>
  );
}
