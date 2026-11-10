"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STICKERS, MASCOT } from "@/lib/stickers";
import "../englishpath.css";

// Nhãn dán / linh vật vẽ bằng SVG (lib/stickers.ts)
function Stk({ name, size = 48, rot = 0, style }: { name: string; size?: number; rot?: number; style?: React.CSSProperties }) {
  return (
    <span
      className="stk"
      style={{ "--s": `${size}px`, "--r": `${rot}deg`, ...style } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: STICKERS[name] || "" }}
    />
  );
}
function Mascot({ mood = "happy", size = 120, className = "" }: { mood?: string; size?: number; className?: string }) {
  return <span className={`mascot ${className}`} style={{ "--s": `${size}px` } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: MASCOT[mood] || "" }} />;
}

const FEATS: [string, string][] = [
  ["map", "Lộ trình riêng theo mục tiêu và lĩnh vực của bạn"],
  ["chat", "Role-play nói chuyện với AI như người thật"],
  ["headphones", "Luyện nghe, chấm phát âm ngay trên điện thoại"],
  ["book", "Flashcard tự động, ôn đúng lúc sắp quên"],
];

export default function LoginPage() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState<"" | "google" | "facebook">("");

  async function signIn(provider: "google" | "facebook") {
    setLoading(provider);
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        // Google: luôn cho chọn tài khoản · Facebook: hỏi lại nếu người dùng đã từ chối quyền email
        queryParams: provider === "google" ? { prompt: "select_account" } : { auth_type: "rerequest" },
        scopes: provider === "facebook" ? "email public_profile" : undefined,
      },
    });
    if (error) { setMsg(`Không đăng nhập được: ${error.message}`); setLoading(""); }
  }

  return (
    <main className="login">
      <section className="login-art">
        <p className="eyebrow">Lộ Trình Tiếng Anh</p>
        <h1>Mỗi ngày 30 phút, nói tiếng Anh tự tin hơn</h1>
        <div className="login-stage" aria-hidden="true">
          <Mascot mood="cheer" size={170} className="bob" />
          <Stk name="plane" size={58} rot={-12} style={{ left: "6%", top: "8%" }} />
          <Stk name="coffee" size={50} rot={8} style={{ left: "14%", bottom: "4%" }} />
          <Stk name="laptop" size={56} rot={10} style={{ right: "8%", top: "4%" }} />
          <Stk name="star" size={40} rot={-8} style={{ right: "18%", bottom: "10%" }} />
          <Stk name="sparkle" size={34} rot={0} style={{ left: "30%", top: "0%" }} />
          <Stk name="heart" size={36} rot={12} style={{ right: "34%", bottom: "-2%" }} />
        </div>
        <ul className="login-feats">
          {FEATS.map(([s, t]) => (
            <li key={s}><Stk name={s} size={36} rot={-6} /> {t}</li>
          ))}
        </ul>
      </section>

      <section className="login-form">
        <div className="login-card">
          <div className="row nowrap">
            <Mascot mood="happy" size={56} />
            <div>
              <h2>Chào mừng bạn!</h2>
              <p className="muted small">Đăng nhập để lưu tiến độ học trên mọi thiết bị.</p>
            </div>
          </div>
          <button type="button" onClick={() => signIn("google")} className="gbtn" disabled={!!loading}>
            <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            {loading === "google" ? "Đang chuyển tới Google..." : "Tiếp tục với Google"}
          </button>
          <button type="button" onClick={() => signIn("facebook")} className="gbtn fbbtn" disabled={!!loading}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="#fff" />
              <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
            </svg>
            {loading === "facebook" ? "Đang chuyển tới Facebook..." : "Tiếp tục với Facebook"}
          </button>
          <p className="muted small center">Chỉ dùng để đăng nhập. App không đăng gì lên tài khoản của bạn.</p>
          {msg && <p className="fb small">{msg}</p>}
        </div>
      </section>
    </main>
  );
}
