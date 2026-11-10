import Legal, { CONTACT } from "../legal";

export const metadata = { title: "Xóa dữ liệu · Lộ Trình Tiếng Anh" };

export default function DataDeletion() {
  return (
    <Legal title="Hướng dẫn xóa dữ liệu" updated="10/11/2026">
      <p>Bạn có toàn quyền xóa dữ liệu của mình khỏi Lộ Trình Tiếng Anh.</p>

      <h2>Cách 1: Tự xóa tiến độ học trong ứng dụng</h2>
      <ol>
        <li>Đăng nhập ứng dụng.</li>
        <li>Bấm ảnh đại diện → <b>Cài đặt</b>.</li>
        <li>Ở mục <b>Dữ liệu</b>, bấm <b>Xóa toàn bộ tiến độ và làm lại</b> rồi bấm lần nữa để xác nhận.</li>
      </ol>
      <p>Thao tác này xóa ngay toàn bộ bài học, điểm số, flashcard và lịch nhắc của bạn.</p>

      <h2>Cách 2: Yêu cầu xóa hẳn tài khoản</h2>
      <p>Gửi email tới <b>{CONTACT}</b> với tiêu đề <b>&quot;Xóa tài khoản&quot;</b>, ghi rõ email hoặc số điện thoại bạn dùng để đăng nhập. Chúng tôi sẽ xóa tài khoản và mọi dữ liệu liên quan trong vòng 30 ngày và trả lời xác nhận cho bạn.</p>

      <h2>Gỡ quyền truy cập từ Facebook</h2>
      <p>Trên Facebook, vào <b>Cài đặt và quyền riêng tư → Cài đặt → Ứng dụng và trang web</b>, chọn <b>Lộ Trình Tiếng Anh</b> rồi bấm <b>Gỡ</b>. Sau đó gửi yêu cầu theo Cách 2 nếu muốn xóa cả dữ liệu học tập.</p>
    </Legal>
  );
}
