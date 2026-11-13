import Script from "next/script";
import "./englishpath.css";

// Màn hình mở app: 2 chú dê chạy từng bước, rượt nhau quanh vòng elip, tung bụi và nốt nhạc
const BOOT = "<div class=\"boot\" role=\"status\" aria-label=\"Loading\"><div class=\"gtrack\"><div class=\"runner r1\"><div class=\"depth\"><div class=\"flip\"><img class=\"gimg\" src=\"/goat-run1.png\" alt=\"\" width=\"120\" height=\"124\"><i class=\"dust d1\"></i><i class=\"dust d2\"></i><i class=\"dust d3\"></i></div><b class=\"note\">♪</b></div></div><div class=\"runner r2\"><div class=\"depth\"><div class=\"flip\"><img class=\"gimg\" src=\"/goat-run1.png\" alt=\"\" width=\"120\" height=\"124\"><i class=\"dust d1\"></i><i class=\"dust d2\"></i><i class=\"dust d3\"></i></div><b class=\"note\">♫</b></div></div></div><span class=\"boot-dots\"><i></i><i></i><i></i></span></div>";

// Toàn bộ giao diện học được dựng bởi /public/englishpath.js
export default function Home() {
  return (
    <>
      <header id="hdr" />
      <main id="app">
        {/* Màn hình mở app: 2 chú dê rượt nhau thành vòng tròn, tung bụi và nốt nhạc (thay cho chữ "Đang tải") */}
        <div dangerouslySetInnerHTML={{ __html: BOOT }} />
      </main>
      <nav id="bnav" hidden aria-label="Navigation" />
      <Script src="/englishpath.js?v=80" strategy="afterInteractive" />
    </>
  );
}
