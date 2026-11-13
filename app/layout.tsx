import Script from "next/script";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEED",
  description: "Học tiếng Anh cá nhân hóa theo mục tiêu của bạn",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.png?v=6", apple: "/apple-touch-icon.png?v=6" },
  appleWebApp: { capable: true, title: "SEED", statusBarStyle: "default" },
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
      <body>{children}<Script src="/install.js?v=4" strategy="afterInteractive" /></body>
    </html>
  );
}
