"use client";
import { useEffect, useState } from "react";
import "./englishpath.css";

// Ngôn ngữ giống app: lựa chọn trong Cài đặt (ep_lang), nếu "theo máy" thì theo ngôn ngữ thiết bị
export function useLang(): "vi" | "en" {
  const [l, setL] = useState<"vi" | "en">("vi");
  useEffect(() => {
    let p = "auto"; try { p = localStorage.getItem("ep_lang") || "auto"; } catch {}
    const q = new URLSearchParams(location.search).get("lang");
    setL(q === "en" || q === "vi" ? q : p === "en" || p === "vi" ? p : /^vi/i.test(navigator.language || "") ? "vi" : "en");
  }, []);
  return l;
}
// Khung chung cho trang chính sách (không cần đăng nhập)
export default function Legal({ en, title, updated, children }: { en: boolean; title: string; updated: string; children: React.ReactNode }) {
  useEffect(() => { document.title = title + " · SEED"; document.documentElement.lang = en ? "en" : "vi"; }, [title, en]);
  return (
    <main className="legal">
      <nav className="lg-top">
        <a href="/" className="lg-brand"><img src="/logo.png?v=6" alt="" width="36" height="36" /><b>SEED</b></a>
        <div className="lg-lang" role="group" aria-label="Language">
          <a href="?lang=vi" className={en ? "" : "on"}>Tiếng Việt</a><a href="?lang=en" className={en ? "on" : ""}>English</a>
        </div>
      </nav>
      <header className="lg-hero">
        <h1>{title}</h1>
        <p>{en ? "Last updated" : "Cập nhật lần cuối"}: {updated}</p>
      </header>
      <article className="lg-body">{children}</article>
      <a href="/" className="lg-back">← {en ? "Back to SEED" : "Quay lại SEED"}</a>
    </main>
  );
}
export const contact = (en: boolean) => process.env.NEXT_PUBLIC_CONTACT_EMAIL || (en ? "the contact email shown in the app's Settings" : "email liên hệ được ghi trong phần cài đặt của ứng dụng");
