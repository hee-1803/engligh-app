"use client";
import { useEffect, useMemo, useState } from "react";
import "../englishpath.css";

type U = { id: string; email: string; name: string; provider: string; joined: string; lastSignIn: string; level: string; goal: string;
  sessions: number; lastStudy: string; today: boolean; week: boolean; cards: number; push: number };
type Data = { stats: { users: number; today: number; week: number; sessions: number; push: number; newWeek: number }; users: U[] };
type Probe = { name: string; model?: string; ok: boolean; ms?: number; error?: string };

const fmt = (s: string) => (s ? new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "–");
const GOAL: Record<string, string> = { work: "Công việc", travel: "Du lịch", exam: "Thi cử", talk: "Giao tiếp", comm: "Giao tiếp" };

export default function AdminPage() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "push" | "idle">("all");
  const [to, setTo] = useState<U | "all" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [probe, setProbe] = useState<Probe[] | null>(null);

  async function load() {
    setErr("");
    try { const r = await fetch("/api/admin"); const j = await r.json(); if (!r.ok) throw new Error(j.error || r.status); setD(j); }
    catch (e) { setErr((e as Error).message); }
  }
  useEffect(() => { load(); }, []);

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return (d?.users || []).filter((u) =>
      (!k || u.email.toLowerCase().includes(k) || u.name.toLowerCase().includes(k)) &&
      (filter === "all" || (filter === "today" && u.today) || (filter === "push" && u.push > 0) || (filter === "idle" && !u.week)));
  }, [d, q, filter]);

  async function send() {
    if (!to) return;
    if (to === "all" && !confirm(`Gửi thông báo này tới TẤT CẢ ${d?.stats.push || 0} người đã bật thông báo?`)) return;
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, ...(to === "all" ? { all: true } : { userId: to.id }) }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error);
      setMsg(`✓ Đã gửi tới ${j.sent}/${j.devices} thiết bị (${j.people} người)${j.removed ? `, xoá ${j.removed} thiết bị đã gỡ` : ""}.`);
      setTitle(""); setBody("");
    } catch (e) { setMsg("✗ " + (e as Error).message); }
    setBusy(false);
  }
  async function checkAI() {
    setProbe([]);
    try { const r = await fetch("/api/ai?probe=1"); setProbe((await r.json()).list || []); } catch { setProbe([{ name: "Kiểm tra", ok: false, error: "không kết nối được" }]); }
  }

  if (err) return (
    <main className="adm"><section className="panel"><h2>Trang quản trị</h2><p className="fb">{err}</p>
      <p className="muted small">Thêm biến <code>ADMIN_EMAILS=email-của-bạn</code> trên Vercel (Settings → Environment Variables), deploy lại rồi đăng nhập bằng đúng email đó.</p>
      <a className="btn" href="/">← Về app</a></section></main>);
  if (!d) return <main className="adm"><section className="panel"><p><span className="spin" /> Đang tải dữ liệu...</p></section></main>;

  const S = d.stats;
  const cards: [string, number, string][] = [["Người dùng", S.users, `+${S.newWeek} trong 7 ngày`], ["Học hôm nay", S.today, ""], ["Học trong 7 ngày", S.week, ""],
    ["Tổng buổi học", S.sessions, ""], ["Bật thông báo", S.push, `${S.users ? Math.round((S.push / S.users) * 100) : 0}% người dùng`]];

  return (
    <main className="adm">
      <div className="row between"><div><p className="eyebrow">Lộ Trình · Quản trị</p><h1>Trang quản trị</h1></div>
        <div className="row"><button onClick={load}>↻ Tải lại</button><a className="btn" href="/">← Về app</a></div></div>

      <div className="adm-stats">{cards.map(([t, n, sub]) => <div key={t} className="panel"><span className="muted small">{t}</span><b>{n}</b>{sub && <span className="muted small">{sub}</span>}</div>)}</div>

      <section className="panel">
        <h3>Gửi thông báo</h3>
        <div className="row">
          <span>Gửi tới:</span>
          <button className={`seg ${to === "all" ? "sel" : ""}`} onClick={() => setTo("all")}>Tất cả người đã bật ({S.push})</button>
          {to && to !== "all" && <span className="tag">{to.name || to.email}</span>}
          {(!to || to === "all") && <span className="muted small">hoặc bấm “Gửi” ở một người trong danh sách</span>}
        </div>
        <input placeholder="Tiêu đề, ví dụ: 🎄 Chủ đề Giáng Sinh đã có!" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Nội dung (tối đa 240 ký tự)" value={body} maxLength={240} onChange={(e) => setBody(e.target.value)} />
        <div className="row"><button className="primary" disabled={busy || !to || !title.trim() || !body.trim()} onClick={send}>{busy ? "Đang gửi..." : "Gửi thông báo"}</button>
          {msg && <span className="small">{msg}</span>}</div>
      </section>

      <section className="panel">
        <div className="row between"><h3>Người dùng ({list.length})</h3>
          <div className="row">{([["all", "Tất cả"], ["today", "Học hôm nay"], ["push", "Bật thông báo"], ["idle", "Bỏ học 7 ngày"]] as const).map(([k, t]) =>
            <button key={k} className={`seg mini ${filter === k ? "sel" : ""}`} onClick={() => setFilter(k)}>{t}</button>)}</div></div>
        <input placeholder="Tìm theo tên hoặc email" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="adm-table"><table>
          <thead><tr><th>Người dùng</th><th>Trình độ</th><th>Buổi</th><th>Học gần nhất</th><th>Tham gia</th><th>Thông báo</th><th /></tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u.id}>
              <td><b>{u.name || "(chưa đặt tên)"}</b><br /><span className="muted small">{u.email || u.id.slice(0, 8)} · {u.provider}</span></td>
              <td>{u.level ? <span className="tag">{u.level}</span> : "–"}<br /><span className="muted small">{GOAL[u.goal] || ""}</span></td>
              <td>{u.sessions}<br /><span className="muted small">{u.cards} từ</span></td>
              <td>{u.today ? <span className="tag good">Hôm nay</span> : fmt(u.lastStudy)}</td>
              <td>{fmt(u.joined)}</td>
              <td>{u.push ? <span className="tag good">✓ {u.push} thiết bị</span> : <span className="muted small">Chưa bật</span>}</td>
              <td><button className="mini" disabled={!u.push} onClick={() => { setTo(u); scrollTo({ top: 0, behavior: "smooth" }); }}>Gửi</button></td>
            </tr>))}</tbody></table></div>
      </section>

      <section className="panel">
        <div className="row between"><h3>Trạng thái AI</h3><button className="mini" onClick={checkAI}>Kiểm tra AI</button></div>
        {probe && (probe.length ? probe.map((p) => <div key={p.name} className="row between nowrap"><span><b>{p.name}</b> <span className="muted small">{p.model}</span></span>
          {p.ok ? <span className="tag good">✓ {((p.ms || 0) / 1000).toFixed(1)}s</span> : <span className="tag bad">✗ {p.error}</span>}</div>) : <p><span className="spin" /> Đang kiểm tra...</p>)}
      </section>
    </main>
  );
}
