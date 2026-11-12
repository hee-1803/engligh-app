import Script from "next/script";
import "./englishpath.css";

// Toàn bộ giao diện học được dựng bởi /public/englishpath.js
export default function Home() {
  return (
    <>
      <header id="hdr" />
      <main id="app">
        {/* Màn hình mở app: 2 chú dê rượt nhau thành vòng tròn, tung bụi và nốt nhạc (thay cho chữ "Đang tải") */}
        <div className="boot" role="status" aria-label="Loading">
          <div className="boot-ring">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/loader-goats.png" alt="" width={240} height={240} />
            <i className="puff p1" /><i className="puff p2" /><i className="puff p3" /><i className="puff p4" />
            <b className="note n1">♪</b><b className="note n2">♫</b><b className="note n3">♪</b><b className="note n4">♫</b>
          </div>
          <span className="boot-dots"><i /><i /><i /></span>
        </div>
      </main>
      <nav id="bnav" hidden aria-label="Navigation" />
      <Script src="/englishpath.js?v=56" strategy="afterInteractive" />
    </>
  );
}
