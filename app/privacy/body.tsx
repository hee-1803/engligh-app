"use client";
import Legal, { useLang, contact } from "../legal";

export default function PrivacyBody() {
  const en = useLang() === "en", C = contact(en);
  if (en) return (
    <Legal en title="Privacy policy" updated="12/11/2026">
      <p>SEED (&quot;the app&quot;) is a personalised English-learning app. This page explains what data the app collects, what it is used for and what rights you have.</p>
      <h2>1. Data we collect</h2>
      <ul>
        <li><b>Account information</b> when you sign in with Google, Facebook, Apple or a phone number: name, email address (or phone number) and profile picture.</li>
        <li><b>Learning data</b> you create: goals, level, lessons, answers, scores, flashcards, reminder schedule, and your birthday if you enter it (used only for a birthday theme).</li>
        <li><b>Device information for notifications</b>, only if you turn on study reminders.</li>
        <li><b>Speech</b>: when you use the microphone for practice, your browser turns speech into text on the device or through the browser&apos;s own service (Google/Microsoft). The app receives only the text and does not keep the recording.</li>
        <li><b>Community chat</b> (only if you join): the messages and voice messages you send. You appear under a random nickname; other learners never see your name, email or photo. Voice messages are stored so the other person can play them.</li>
        <li><b>Feedback</b> you send from Settings.</li>
      </ul>
      <p>We do <b>not</b> post on your behalf, and we do not read your friends list, messages or any other data from your social-media accounts.</p>
      <h2>2. How we use it</h2>
      <ul>
        <li>To sign you in and keep your progress in sync across all your devices.</li>
        <li>To write lessons and mark your work around your goals. Your answers are sent to AI services (see section 3) for this purpose.</li>
        <li>To send study reminders on the schedule you choose.</li>
        <li>To keep the community chat safe: messages are automatically checked for personal information and abusive language, and reported messages may be reviewed by an administrator.</li>
      </ul>
      <p>We do not sell or rent your data, and we do not use it for advertising.</p>
      <h2>3. Where data is stored and third parties</h2>
      <ul>
        <li><b>Supabase</b>: stores accounts, learning data, chat and voice messages.</li>
        <li><b>Vercel</b>: runs the app.</li>
        <li><b>Google Gemini, Groq, OpenRouter</b>: AI services that process lesson content and your answers.</li>
        <li><b>Google, Facebook, Apple</b>: sign-in, depending on your choice.</li>
      </ul>
      <h2>4. Your rights</h2>
      <p>You can view and edit your learning details in Settings, delete all your progress at any time, and ask for your account to be deleted completely by following the <a href="/data-deletion?lang=en">data deletion page</a>.</p>
      <h2>5. Contact</h2>
      <p>For any privacy questions, please contact: <b>{C}</b>.</p>
    </Legal>
  );
  return (
    <Legal en={false} title="Chính sách quyền riêng tư" updated="12/11/2026">
      <p>SEED (&quot;ứng dụng&quot;) là ứng dụng học tiếng Anh cá nhân hóa. Trang này giải thích ứng dụng thu thập dữ liệu gì, dùng để làm gì và bạn có quyền gì.</p>
      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li><b>Thông tin tài khoản</b> khi bạn đăng nhập bằng Google, Facebook, Apple hoặc số điện thoại: tên, địa chỉ email (hoặc số điện thoại), ảnh đại diện.</li>
        <li><b>Dữ liệu học tập</b> bạn tạo ra: mục tiêu học, trình độ, bài học, câu trả lời, điểm số, flashcard, lịch nhắc học, và ngày sinh nếu bạn nhập (chỉ dùng để hiện giao diện sinh nhật).</li>
        <li><b>Thông tin thiết bị để gửi thông báo</b>, chỉ khi bạn bật thông báo nhắc học.</li>
        <li><b>Giọng nói</b>: khi bạn luyện nói bằng micro, trình duyệt chuyển giọng nói thành chữ ngay trên thiết bị hoặc qua dịch vụ của trình duyệt (Google/Microsoft). Ứng dụng chỉ nhận phần chữ, không lưu bản ghi âm.</li>
        <li><b>Trò chuyện cộng đồng</b> (chỉ khi bạn tham gia): tin nhắn và tin nhắn thoại bạn gửi. Bạn hiện dưới một biệt danh ngẫu nhiên, người khác không thấy tên, email hay ảnh của bạn. Tin nhắn thoại được lưu để người nhận nghe được.</li>
        <li><b>Phản hồi</b> bạn gửi trong phần Cài đặt.</li>
      </ul>
      <p>Chúng tôi <b>không</b> đăng bài, không đọc danh sách bạn bè, tin nhắn hay bất kỳ dữ liệu nào khác trên tài khoản mạng xã hội của bạn.</p>
      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Đăng nhập và lưu tiến độ học trên mọi thiết bị của bạn.</li>
        <li>Soạn bài học và chấm bài theo mục tiêu của bạn. Nội dung bài làm được gửi tới các dịch vụ AI (xem mục 3) để chấm và soạn bài.</li>
        <li>Gửi thông báo nhắc học theo lịch bạn chọn.</li>
        <li>Giữ an toàn cho phần trò chuyện: tin nhắn được tự động lọc thông tin cá nhân và từ ngữ xúc phạm; tin nhắn bị báo cáo có thể được quản trị viên xem xét.</li>
      </ul>
      <p>Chúng tôi không bán, không cho thuê và không dùng dữ liệu của bạn cho quảng cáo.</p>
      <h2>3. Nơi lưu trữ và bên thứ ba</h2>
      <ul>
        <li><b>Supabase</b>: lưu tài khoản, dữ liệu học tập, tin nhắn và tin nhắn thoại.</li>
        <li><b>Vercel</b>: chạy ứng dụng.</li>
        <li><b>Google Gemini, Groq, OpenRouter</b>: dịch vụ AI xử lý nội dung bài học và bài làm.</li>
        <li><b>Google, Facebook, Apple</b>: xác thực đăng nhập theo lựa chọn của bạn.</li>
      </ul>
      <h2>4. Quyền của bạn</h2>
      <p>Bạn có thể xem và chỉnh sửa thông tin học tập trong phần Cài đặt, xóa toàn bộ tiến độ bất kỳ lúc nào, và yêu cầu xóa hẳn tài khoản theo hướng dẫn tại <a href="/data-deletion">trang Xóa dữ liệu</a>.</p>
      <h2>5. Liên hệ</h2>
      <p>Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ: <b>{C}</b>.</p>
    </Legal>
  );
}
