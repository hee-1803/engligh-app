import "./englishpath.css";

// Khung chung cho trang chính sách (không cần đăng nhập)
export default function Legal({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="legal">
      <a href="/" className="link">← SEED</a>
      <h1>{title}</h1>
      <p className="muted small">Cập nhật lần cuối: {updated}</p>
      {children}
    </main>
  );
}
export const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "email liên hệ được ghi trong phần cài đặt của ứng dụng";
