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
      <div className="row between"><a href="/" className="link">← SEED</a>
        <span className="small"><a href="?lang=vi" className={en ? "link" : ""}>Tiếng Việt</a> · <a href="?lang=en" className={en ? "" : "link"}>English</a></span></div>
      <h1>{title}</h1>
      <p className="muted small">{en ? "Last updated" : "Cập nhật lần cuối"}: {updated}</p>
      {children}
    </main>
  );
}
export const contact = (en: boolean) => process.env.NEXT_PUBLIC_CONTACT_EMAIL || (en ? "the contact email shown in the app's Settings" : "email liên hệ được ghi trong phần cài đặt của ứng dụng");
