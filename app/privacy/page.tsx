import Legal, { CONTACT } from "../legal";

export const metadata = { title: "Chính sách quyền riêng tư · Lộ Trình Tiếng Anh" };

export default function Privacy() {
  return (
    <Legal title="Chính sách quyền riêng tư" updated="10/11/2026">
      <p>Lộ Trình Tiếng Anh (&quot;ứng dụng&quot;) là ứng dụng học tiếng Anh cá nhân hóa. Trang này giải thích ứng dụng thu thập dữ liệu gì, dùng để làm gì và bạn có quyền gì.</p>

      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li><b>Thông tin tài khoản</b> khi bạn đăng nhập bằng Google, Facebook, Apple hoặc số điện thoại: tên, địa chỉ email (hoặc số điện thoại), ảnh đại diện.</li>
        <li><b>Dữ liệu học tập</b> bạn tạo ra: mục tiêu học, trình độ, bài học, câu trả lời, điểm số, flashcard, lịch nhắc học.</li>
        <li><b>Thông tin thiết bị để gửi thông báo</b>, chỉ khi bạn bật thông báo nhắc học.</li>
        <li><b>Giọng nói</b>: khi bạn dùng micro, trình duyệt chuyển giọng nói thành chữ ngay trên thiết bị hoặc qua dịch vụ của trình duyệt (Google/Microsoft). Ứng dụng chỉ nhận phần chữ, không lưu bản ghi âm.</li>
      </ul>
      <p>Chúng tôi <b>không</b> đăng bài, không đọc danh sách bạn bè, tin nhắn hay bất kỳ dữ liệu nào khác trên tài khoản mạng xã hội của bạn.</p>

      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Đăng nhập và lưu tiến độ học trên mọi thiết bị của bạn.</li>
        <li>Soạn bài học và chấm bài theo mục tiêu của bạn. Nội dung bài làm được gửi tới dịch vụ AI Google Gemini để chấm và soạn bài.</li>
        <li>Gửi thông báo nhắc học theo lịch bạn chọn.</li>
      </ul>
      <p>Chúng tôi không bán, không cho thuê và không dùng dữ liệu của bạn cho quảng cáo.</p>

      <h2>3. Nơi lưu trữ và bên thứ ba</h2>
      <ul>
        <li><b>Supabase</b>: lưu tài khoản và dữ liệu học tập.</li>
        <li><b>Vercel</b>: chạy ứng dụng.</li>
        <li><b>Google Gemini</b>: xử lý nội dung bài học và bài làm.</li>
        <li><b>Google, Facebook, Apple</b>: xác thực đăng nhập theo lựa chọn của bạn.</li>
      </ul>

      <h2>4. Quyền của bạn</h2>
      <p>Bạn có thể xem và chỉnh sửa thông tin học tập trong phần Cài đặt, xóa toàn bộ tiến độ bất kỳ lúc nào, và yêu cầu xóa hẳn tài khoản theo hướng dẫn tại <a href="/data-deletion">trang Xóa dữ liệu</a>.</p>

      <h2>5. Liên hệ</h2>
      <p>Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ: <b>{CONTACT}</b>.</p>
    </Legal>
  );
}
