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
  // Bản tiếng Việt lúc tải / lúc dịch gần nhất: để biết ô tiếng Anh nào có thể đã cũ
  const [base, setBase] = useState<Record<string, string>>({});
  const PAIRS = ["tagline", "bio", "loves", "quote"] as const;
  const snap = (x: About) => Object.fromEntries(PAIRS.map((p) => [p, x[`${p}_vi` as keyof About]]));
  const stale = a ? PAIRS.filter((p) => base[p] !== undefined && base[p] !== a[`${p}_vi` as keyof About]) : [];
  async function translate() {
    if (!a) return; setBusy("tr"); setMsg("");
    const src = Object.fromEntries(PAIRS.map((p) => [p, a[`${p}_vi` as keyof About]]));
    let out: Record<string, string> | null = null;
    try {
      const sys = "You translate short app copy from Vietnamese to natural, warm, fluent English for an English-learning app called SEED. Keep emojis and line breaks exactly (one label per line in 'loves'). Do not add content. Return JSON with the same keys.";
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system: sys, contents: JSON.stringify(src), json: true }) });
      const j = await r.json(); if (r.ok) { const d = JSON.parse(j.text); if (PAIRS.every((p) => typeof d[p] === "string")) out = d; }
    } catch {}
    if (!out) { // dự phòng: dịch từng ô bằng dịch máy
      try { out = {}; for (const p of PAIRS) { const r = await fetch(`/api/translate?sl=vi&tl=en&q=${encodeURIComponent(src[p])}`); const j = await r.json(); if (!r.ok) throw new Error(j.error); out[p] = j.text; } } catch (e) { out = null; setMsg("✗ Chưa dịch được: " + (e as Error).message); }
    }
    if (out) { const o = out; setA({ ...a, ...Object.fromEntries(PAIRS.map((p) => [`${p}_en`, o[p].trim()])) }); setBase(src); setMsg("✓ Đã dịch sang tiếng Anh. Đọc lại rồi bấm 💾 Lưu."); }
    setBusy("");
  }
  async function load() { try { const r = await fetch("/api/admin/content"); const j = await r.json(); setA(j.about); setBase(snap(j.about)); setAt(j.updated_at); if (j.error) setMsg("✗ " + j.error); } catch (e) { setMsg("✗ " + (e as Error).message); } }
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
            {stale.some((p) => k === `${p}_en`) && <span className="tag warn">có thể đã cũ</span>}{kind === "input" ? <input value={a[k]} onChange={(e) => set(k, e.target.value)} /> : <textarea rows={k.startsWith("bio") ? 6 : 3} value={a[k]} onChange={(e) => set(k, e.target.value)} />}</div>)}
        </div>
        {stale.length > 0 && <p className="small warn-t">⚠️ Bạn đã sửa tiếng Việt ở: {stale.map((p) => ({ tagline: "Slogan", bio: "Giới thiệu", loves: "Sở thích", quote: "Trích dẫn" })[p]).join(", ")}. Bản tiếng Anh có thể đã cũ, bấm ✨ Dịch sang tiếng Anh.</p>}
        <div className="row"><button disabled={!!busy} onClick={translate}>{busy === "tr" ? "Đang dịch…" : "✨ Dịch sang tiếng Anh"}</button><button className="primary" disabled={!!busy} onClick={() => save()}>{busy === "save" ? "Đang lưu…" : "💾 Lưu"}</button><button className="ghost" disabled={!!busy} onClick={() => save(true)}>Về mặc định</button></div>
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
