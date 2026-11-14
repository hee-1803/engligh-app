"use client";
import { useEffect, useMemo, useState } from "react";
import "../englishpath.css";
import LessonsAdmin from "./lessons";
import AboutAdmin from "./about";

type U = { id: string; email: string; name: string; provider: string; joined: string; lastSignIn: string; level: string; goal: string;
  sessions: number; lastStudy: string; today: boolean; week: boolean; cards: number; push: number };
type Data = { stats: { users: number; today: number; week: number; sessions: number; push: number; newWeek: number }; users: U[] };
type Rep = { id: number; reason: string; created_at: string; reporter: string; reported: string; reporterEmail?: string; reportedEmail?: string; room_id: string;
  message: { id: number; text: string | null; audio_path: string | null; hidden: boolean } | null };
type Fb = { id: number; kind: string; rating: number | null; message: string; level: string; status: string; created_at: string; email?: string; user_agent?: string };
type Ban = { user_id: string; until: string; reason: string };
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
  // Tab đang mở (nhớ theo #hash để bấm "Về trang quản trị" quay lại đúng chỗ)
  const [tab, setTabState] = useState("overview");
  useEffect(() => { const h = location.hash.slice(1); if (h) setTabState(h); }, []);
  const setTab = (t: string) => { setTabState(t); history.replaceState(null, "", "#" + t); };
  // Phân trang: mỗi danh sách chỉ hiện 5 mục mới nhất, xem tiếp bằng ‹ Trước / Sau ›
  const PER = 5;
  const [pg, setPg] = useState<Record<string, number>>({});
  function page<T>(arr: T[], k: string) { const p = Math.min(pg[k] || 0, Math.max(0, Math.ceil(arr.length / PER) - 1)); return arr.slice(p * PER, p * PER + PER); }
  function Pager({ k, total }: { k: string; total: number }) {
    const pages = Math.ceil(total / PER); if (pages <= 1) return null; const p = Math.min(pg[k] || 0, pages - 1);
    return <div className="pager"><button className="mini" disabled={p === 0} onClick={() => setPg({ ...pg, [k]: p - 1 })}>‹ Trước</button>
      <span className="small">Trang {p + 1}/{pages} · {total} mục</span><button className="mini" disabled={p >= pages - 1} onClick={() => setPg({ ...pg, [k]: p + 1 })}>Sau ›</button></div>;
  }
  const [reps, setReps] = useState<{ reports: Rep[]; bans: Ban[] } | null>(null);
  const [fbs, setFbs] = useState<Fb[] | null>(null);
  const [rk, setRk] = useState(0), [reloading, setReloading] = useState(false), [done, setDone] = useState(false);
  async function loadFb() { try { const r = await fetch("/api/admin?feedback=1"); if (r.ok) setFbs((await r.json()).feedback); } catch {} }
  useEffect(() => { loadFb(); }, []);
  async function loadReps() { try { const r = await fetch("/api/admin?reports=1"); if (r.ok) setReps(await r.json()); } catch {} }
  useEffect(() => { loadReps(); }, []);
  async function delUser(id: string, email: string) {
    const typed = prompt(`XOÁ VĨNH VIỄN tài khoản ${email}?\n\nSẽ xoá: tiến độ học, flashcard, điểm xếp hạng, thông báo, tin nhắn và tin nhắn thoại, báo cáo, phản hồi, và tài khoản đăng nhập.\nKhông khôi phục được.\n\nGõ lại email để xác nhận:`);
    if (typed === null) return;
    setMsg("Đang xoá…");
    try {
      const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mod: "deleteUser", userId: id, confirmEmail: typed }) });
      const j = await r.json();
      setMsg(j.ok ? `✓ Đã xoá tài khoản ${j.email}` : "✗ " + (j.error || "Lỗi"));
      if (j.ok) { load(); loadReps(); loadFb(); }
    } catch (e) { setMsg("✗ " + (e as Error).message); }
  }
  async function mod(body: Record<string, unknown>) {
    await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); loadReps(); setMsg("");
  }

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
      setMsg(`✓ Đã gửi tới ${j.sent}/${j.devices} thiết bị ${to === "all" ? `(${j.people} người)` : `của ${to.email}`}${j.removed ? `, xoá ${j.removed} thiết bị đã gỡ` : ""}.${j.sent === 0 ? " Thiết bị không nhận được: có thể người này đã tắt thông báo hoặc gỡ app." : ""}`);
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
  const banned = new Map((reps?.bans || []).map((b) => [b.user_id, b]));
  const openReps = reps?.reports || [], newFb = (fbs || []).filter((f) => f.status !== "done");
  const TABS: [string, string, number?][] = [["overview", "📊 Tổng quan"], ["users", "👥 Người dùng", S.users], ["notify", "🔔 Gửi thông báo"], ["lessons", "📚 Kho bài"],
    ["feedback", "💬 Phản hồi", newFb.length], ["reports", "🚩 Vi phạm", openReps.length + (reps?.bans.length || 0)], ["about", "🌱 Giới thiệu"], ["ai", "🤖 AI"]];
  const cards: [string, number, string][] = [["Người dùng", S.users, `+${S.newWeek} trong 7 ngày`], ["Học hôm nay", S.today, ""], ["Học trong 7 ngày", S.week, ""],
    ["Tổng buổi học", S.sessions, ""], ["Bật thông báo", S.push, `${S.users ? Math.round((S.push / S.users) * 100) : 0}% người dùng`]];
  const pickUser = (u: U) => { setTo(u); setMsg(""); setTab("notify"); scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <main className="adm">
      <header className="adm-head">
        <div className="row nowrap">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.png?v=6" alt="" width={44} height={44} className="logo-lg" />
          <div><p className="eyebrow">SEED · Quản trị</p><h1>Trang quản trị</h1></div></div>
        <div className="row"><button className="mini" disabled={reloading} onClick={async () => { setReloading(true); await Promise.all([load(), loadReps(), loadFb()]); setRk((k) => k + 1); setReloading(false); setDone(true); setTimeout(() => setDone(false), 1800); }}>{reloading ? "⏳ Đang tải…" : done ? "✓ Đã tải lại" : "↻ Tải lại"}</button><a className="btn mini" href="/">← Về app</a></div>
      </header>
      <nav className="adm-tabs">{TABS.map(([k, t, n]) => <button key={k} className={tab === k ? "sel" : ""} onClick={() => setTab(k)}>{t}{n ? <span className="badge">{n}</span> : null}</button>)}</nav>

      {tab === "overview" && <>
        <div className="adm-stats">{cards.map(([t, n, sub]) => <div key={t} className="panel"><span className="muted small">{t}</span><b>{n}</b>{sub && <span className="muted small">{sub}</span>}</div>)}</div>
        <div className="adm-two">
          <section className="panel"><div className="row between"><h3>Học gần đây</h3><button className="mini ghost" onClick={() => setTab("users")}>Xem tất cả →</button></div>
            {d.users.filter((u) => u.lastStudy).slice(0, 5).map((u) => <div key={u.id} className="adm-line"><b>{u.name || u.email}</b><span className="muted small">{u.level} · {u.sessions} buổi · {u.today ? "hôm nay" : fmt(u.lastStudy)}</span></div>)}</section>
          <section className="panel"><div className="row between"><h3>Cần xử lý</h3></div>
            <div className="adm-line"><b>💬 Phản hồi mới</b><button className="mini" onClick={() => setTab("feedback")}>{newFb.length}</button></div>
            <div className="adm-line"><b>🚩 Báo cáo vi phạm</b><button className="mini" onClick={() => setTab("reports")}>{openReps.length}</button></div>
            <div className="adm-line"><b>⛔ Đang bị khoá chat</b><button className="mini" onClick={() => setTab("reports")}>{reps?.bans.length || 0}</button></div></section>
        </div></>}

      {tab === "users" && <section className="panel">
        <div className="row between"><h3>Người dùng ({list.length})</h3>
          <div className="row">{([["all", "Tất cả"], ["today", "Học hôm nay"], ["push", "Bật thông báo"], ["idle", "Bỏ học 7 ngày"]] as const).map(([k, t]) =>
            <button key={k} className={`seg mini ${filter === k ? "sel" : ""}`} onClick={() => { setFilter(k); setPg((p) => ({ ...p, users: 0 })); }}>{t}</button>)}</div></div>
        <input placeholder="Tìm theo tên hoặc email" value={q} onChange={(e) => { setQ(e.target.value); setPg((p) => ({ ...p, users: 0 })); }} />
        {msg && <p className="small"><b>{msg}</b></p>}
        <div className="adm-cards">{page(list, "users").map((u) => { const b = banned.get(u.id); return (
          <div key={u.id} className="adm-card">
            <div className="row between nowrap"><div><b>{u.name || "(chưa đặt tên)"}</b> {u.level && <span className="tag">{u.level}</span>}<br /><span className="muted small">{u.email} · {u.provider}</span></div>
              {u.today ? <span className="tag good">Học hôm nay</span> : <span className="muted small">Học: {fmt(u.lastStudy)}</span>}</div>
            <div className="muted small">{GOAL[u.goal] || u.goal || "–"} · {u.sessions} buổi · {u.cards} từ · tham gia {fmt(u.joined)} · {u.push ? `🔔 ${u.push} thiết bị` : "chưa bật thông báo"}</div>
            {b && <div className="fb small">⛔ Đang bị khoá chat đến {new Date(b.until).toLocaleString("vi-VN")} ({b.reason})</div>}
            <div className="row">
              <button className="mini" disabled={!u.push} onClick={() => pickUser(u)}>🔔 Gửi thông báo</button>
              {b ? <button className="mini" onClick={() => mod({ mod: "unban", userId: u.id })}>✓ Mở khoá chat</button>
                : <button className="mini danger" onClick={() => { if (confirm(`Khoá chat ${u.email} trong 1 ngày?`)) mod({ mod: "ban", userId: u.id, days: 1 }); }}>⛔ Khoá chat 1 ngày</button>}
              <button className="mini danger" onClick={() => delUser(u.id, u.email)}>🗑️ Xoá tài khoản</button>
            </div></div>); })}</div>
        <Pager k="users" total={list.length} />
      </section>}

      {tab === "notify" && <section className="panel" id="adm-send">
        <h3>Gửi thông báo</h3>
        <div className="row">
          <span>Gửi tới:</span>
          <button className={`seg ${to === "all" ? "sel" : ""}`} onClick={() => setTo("all")}>Tất cả người đã bật ({S.push})</button>
          {to && to !== "all" && <span className="adm-to">👤 <b>{to.name || "(chưa đặt tên)"}</b> · {to.email} <button className="mini ghost" onClick={() => setTo(null)}>✕</button></span>}
          {(!to || to === "all") && <button className="mini ghost" onClick={() => setTab("users")}>Chọn một người →</button>}
        </div>
        <input placeholder="Tiêu đề, ví dụ: 🎄 Chủ đề Giáng Sinh đã có!" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Nội dung (tối đa 240 ký tự)" value={body} maxLength={240} onChange={(e) => setBody(e.target.value)} />
        <div className="row"><button className="primary" disabled={busy || !to || !title.trim() || !body.trim()} onClick={send}>{busy ? "Đang gửi..." : to === "all" ? "Gửi cho tất cả" : to ? "Gửi cho người này" : "Gửi thông báo"}</button>
          {msg && <span className="small">{msg}</span>}</div>
      </section>}

      {tab === "lessons" && <LessonsAdmin key={rk} />}

      {tab === "feedback" && <section className="panel">
        <div className="row between"><h3>Phản hồi ({newFb.length} mới / {fbs?.length ?? "…"})</h3><button className="mini" onClick={loadFb}>↻</button></div>
        {fbs?.length === 0 && <p className="muted">Chưa có phản hồi nào.</p>}
        {page(fbs || [], "fb").map((f) => (
          <div key={f.id} className="adm-rep" style={{ opacity: f.status === "done" ? 0.55 : 1 }}>
            <div><span className="tag">{({ idea: "💡 Góp ý", bug: "🐞 Báo lỗi", love: "💚 Khen", other: "Khác" } as Record<string, string>)[f.kind] || f.kind}</span>{f.rating ? <b> {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</b> : null}</div>
            {f.message && <div style={{ whiteSpace: "pre-wrap" }}>{f.message}</div>}
            <div className="muted small">{f.email} · {f.level} · {new Date(f.created_at).toLocaleString("vi-VN")} · {/iPhone|iPad/.test(f.user_agent || "") ? "iPhone" : /Android/.test(f.user_agent || "") ? "Android" : "Máy tính"}</div>
            {f.status !== "done" && <div className="row"><button className="mini" onClick={async () => { await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mod: "fbDone", feedbackId: f.id }) }); loadFb(); }}>✓ Đã xem</button></div>}
          </div>))}
        <Pager k="fb" total={fbs?.length || 0} />
      </section>}

      {tab === "reports" && <>
        <section className="panel">
          <div className="row between"><h3>⛔ Đang bị khoá chat ({reps?.bans.length || 0})</h3></div>
          <p className="muted small">Khoá nhầm thì bấm Mở khoá, người đó chat lại được ngay.</p>
          {reps?.bans.length === 0 && <p className="muted">Không có ai bị khoá.</p>}
          {page(reps?.bans || [], "bans").map((b) => <div key={b.user_id} className="adm-line"><span className="small"><b>{d.users.find((u) => u.id === b.user_id)?.email || b.user_id.slice(0, 8)}</b> · đến {new Date(b.until).toLocaleString("vi-VN")} · {b.reason}</span>
            <button className="mini" onClick={() => mod({ mod: "unban", userId: b.user_id })}>✓ Mở khoá</button></div>)}
          <Pager k="bans" total={reps?.bans.length || 0} />
        </section>
        <section className="panel">
          <div className="row between"><h3>🚩 Báo cáo vi phạm ({openReps.length})</h3><button className="mini" onClick={loadReps}>↻</button></div>
          <p className="muted small">Tin bị 2 người báo cáo sẽ tự ẩn. Người bị 3 người khác nhau báo cáo trong 24 giờ sẽ tự bị khoá chat 24 giờ.</p>
          {openReps.length === 0 && <p className="muted">Chưa có báo cáo nào. 🎉</p>}
          {page(openReps, "reps").map((r) => (
            <div key={r.id} className="adm-rep">
              <div><b>{r.message?.audio_path ? "🎤 (tin nhắn giọng nói)" : `“${r.message?.text || "(đã xoá)"}”`}</b>{r.message?.hidden && <span className="tag"> đã ẩn</span>}</div>
              <div className="muted small">Người gửi: <b>{r.reportedEmail}</b> · Người báo cáo: {r.reporterEmail} · Lý do: {r.reason || "–"} · {new Date(r.created_at).toLocaleString("vi-VN")}</div>
              <div className="row">
                <button className="mini" onClick={() => mod({ mod: "dismiss", reportId: r.id })}>Bỏ qua</button>
                {r.message && !r.message.hidden && <button className="mini" onClick={() => mod({ mod: "hide", reportId: r.id, messageId: r.message!.id })}>Ẩn tin nhắn</button>}
                <button className="mini danger" onClick={() => mod({ mod: "ban", reportId: r.id, userId: r.reported, days: 1, messageId: r.message?.id })}>Khoá chat 1 ngày</button>
                <button className="mini danger" onClick={() => mod({ mod: "ban", reportId: r.id, userId: r.reported, days: 30, messageId: r.message?.id })}>Khoá 30 ngày</button>
              </div>
            </div>))}
          <Pager k="reps" total={openReps.length} />
        </section></>}

      {tab === "about" && <AboutAdmin key={rk} />}
      {tab === "ai" && <section className="panel">
        <div className="row between"><h3>Trạng thái AI</h3><button className="mini" onClick={checkAI}>Kiểm tra AI</button></div>
        <p className="muted small">Chấm câu, role-play, tra từ: Groq → OpenRouter → AI chính (Google). Soạn bài mới: AI chính trước, hết lượt thì Groq/OpenRouter soạn thay.</p>
        {probe && (probe.length ? probe.map((p) => <div key={p.name} className="adm-line"><span><b>{p.name}</b> <span className="muted small">{p.model}</span></span>
          {p.ok ? <span className="tag good">✓ {((p.ms || 0) / 1000).toFixed(1)}s</span> : <span className="tag bad">✗ {p.error}</span>}</div>) : <p><span className="spin" /> Đang kiểm tra...</p>)}
      </section>}
    </main>
  );
}
