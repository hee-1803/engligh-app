"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setMsg(`Lỗi: ${error.message}`);
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    setMsg(error ? `Lỗi: ${error.message}` : "Đã gửi link đăng nhập. Hãy kiểm tra email của bạn.");
  }

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm grid gap-3 border rounded-xl p-6">
        <h1 className="text-2xl font-bold">Lộ Trình Tiếng Anh</h1>
        <p className="text-sm text-gray-500">Đăng nhập để lưu tiến độ học trên mọi thiết bị.</p>
        <button type="button" onClick={signInGoogle}
          className="bg-teal-700 text-white rounded-lg py-2 font-semibold">
          Đăng nhập với Google
        </button>
        <p className="text-center text-xs text-gray-400">hoặc nhận link qua email</p>
        <form onSubmit={sendLink} className="grid gap-2">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@gmail.com" className="border rounded-lg px-3 py-2 bg-transparent" />
          <button disabled={loading} className="border rounded-lg py-2 font-semibold disabled:opacity-50">
            {loading ? "Đang gửi..." : "Gửi link đăng nhập"}
          </button>
        </form>
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </main>
  );
}
