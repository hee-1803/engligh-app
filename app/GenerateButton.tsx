"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateButton() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function run() {
    setLoading(true); setErr("");
    const res = await fetch("/api/generate-lesson", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setErr(data.error ?? "Có lỗi xảy ra");
    else router.refresh();
  }

  return (
    <div className="grid gap-2">
      <button onClick={run} disabled={loading}
        className="bg-teal-700 text-white rounded-lg py-2 font-semibold disabled:opacity-50">
        {loading ? "Gemini đang soạn bài (10–20 giây)..." : "Tạo bài học tiếp theo bằng Gemini"}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
