import Script from "next/script";
import "./englishpath.css";

// Toàn bộ giao diện học được dựng bởi /public/englishpath.js
export default function Home() {
  return (
    <>
      <header id="hdr" />
      <main id="app" />
      <nav id="bnav" hidden aria-label="Điều hướng" />
      <Script src="/englishpath.js?v=48" strategy="afterInteractive" />
    </>
  );
}
