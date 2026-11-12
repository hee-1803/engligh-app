import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lộ Trình Tiếng Anh",
  description: "Học tiếng Anh cá nhân hóa theo mục tiêu của bạn",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.png?v=3", apple: "/apple-touch-icon.png?v=3" },
  appleWebApp: { capable: true, title: "Lộ Trình", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#3fae7a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: app tự gắn cỡ chữ / giao diện sáng-tối lên thẻ <html>
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
