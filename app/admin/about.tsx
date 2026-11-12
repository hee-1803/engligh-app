"use client";
import { useEffect, useState } from "react";
import type { About } from "@/lib/about";

// Sửa trang "Về SEED & người sáng lập" (người học thấy ngay khi mở lại trang đó)
const F: [keyof About, string, "input" | "area"][] = [
  ["tagline_vi", "Slogan dưới logo (Việt)", "input"], ["tagline_en", "Slogan (Anh)", "input"],
  ["bio_vi", "Giới thiệu (Việt)", "area"], ["bio_en", "Giới thiệu (Anh)", "area"],
  ["loves_vi", "Sở thích – mỗi dòng 1 nhãn (Việt)", "area"], ["loves_en", "Sở thích – mỗi dòng 1 nhãn (Anh)", "area"],
  ["quote_vi", "Câu trích dẫn (Việt)", "area"], ["quote_en", "Câu trích dẫn (Anh)", "area"],
];
export default function AboutAdmin() {
  const [a, setA] = useState<About | null>(null), [msg, setMsg] = useState(""), [busy, setBusy] = useState(""), [at, setAt] = useState<string | null>(null);
  async function load() { try { const r = await fetch("/api/admin/content"); const j = await r.json(); setA(j.about); setAt(j.updated_at); if (j.error) setMsg("✗ " + j.error); } catch (e) { setMsg("✗ " + (e as Error).message); } }
  useEffect(() => { load(); }, []);
  async function save(reset = false) {
    if (reset && !confirm("Đưa nội dung về bản mặc định ban đầu?")) return;
    setBusy(reset ? "reset" : "save"); setMsg("");
    try { const r = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reset ? { reset: true } : { about: a }) }); const j = await r.json();
      setMsg(j.error ? "✗ " + j.error : reset ? "✓ Đã về mặc định" : "✓ Đã lưu, người học thấy nội dung mới khi mở lại trang Giới thiệu"); if (!j.error) load(); } catch (e) { setMsg("✗ " + (e as Error).message); }
    setBusy("");
  }
  if (!a) return <section className="panel"><p className="muted">Đang tải…</p></section>;
  const set = (k: keyof About, v: string) => setA({ ...a, [k]: v });
  const tags = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  return (
    <div className="adm-two">
      <section className="panel led">
        <div className="row between"><b>🌱 Trang “Về SEED & người sáng lập”</b>{at && <span className="muted small">Sửa lần cuối: {new Date(at).toLocaleString("vi-VN")}</span>}</div>
        <div className="lgrid">
          <div className="tfield"><label>Tên người sáng lập</label><input value={a.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="tfield"><label>Sinh nhật SEED (vd 18/3)</label><input value={a.birthday} onChange={(e) => set("birthday", e.target.value)} /></div>
        </div>
        <div className="lgrid">
          {F.map(([k, label, kind]) => <div className="tfield" key={k}><label>{label}</label>
            {kind === "input" ? <input value={a[k]} onChange={(e) => set(k, e.target.value)} /> : <textarea rows={k.startsWith("bio") ? 6 : 3} value={a[k]} onChange={(e) => set(k, e.target.value)} />}</div>)}
        </div>
        <div className="row"><button className="primary" disabled={!!busy} onClick={() => save()}>{busy === "save" ? "Đang lưu…" : "💾 Lưu"}</button><button className="ghost" disabled={!!busy} onClick={() => save(true)}>Về mặc định</button></div>
        {msg && <p className="small">{msg}</p>}
      </section>
      <section className="panel founder">
        <p className="eyebrow">Xem trước (tiếng Việt)</p>
        <p className="muted center">{a.tagline_vi}</p>
        <p className="eyebrow">Người sáng lập</p><h3>{a.name}</h3><p>{a.bio_vi}</p>
        <div className="row">{tags(a.loves_vi).map((t) => <span className="tag" key={t}>{t}</span>)}</div>
        <blockquote>“{a.quote_vi}”</blockquote>
        <p className="small muted">Sinh nhật SEED cùng ngày với người sáng lập ({a.birthday}).</p>
      </section>
    </div>
  );
}
