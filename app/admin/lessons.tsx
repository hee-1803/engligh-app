"use client";
// Kho bài trong trang quản trị: thêm / sửa / kiểm tra trùng / xem thử / phát hành, giống CMS của các app học ngôn ngữ
import { useEffect, useState } from "react";

type Word = { w: string; ipa: string; pos: string; vi: string; ex: string; ex_vi: string };
type Quiz = { q: string; opts: string[]; ans: number; explain?: string };
type Tr = { src: string; ref: string; dir: "vi-en" | "en-vi" };
type Lesson = {
  level: string; topic: string; topic_en?: string; scenario: string; words: Word[];
  grammar: { name: string; name_en?: string; pattern: string; note: string; quiz: Quiz[] };
  translations: Tr[];
  roleplay: { ai_role: string; user_role: string; setting: string; tasks: string[]; opening: string };
};
type Row = { id: number | string; level: string; topic: string; topic_en?: string; status: string; sort: number; source: string; updated_at: string };
const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];
const ST: Record<string, [string, string]> = { draft: ["Nháp", ""], published: ["Đã phát hành", "good"], hidden: ["Đã ẩn", "bad"] };

const blank = (level = "A1"): Lesson => ({
  level, topic: "", topic_en: "", scenario: "",
  words: Array.from({ length: 6 }, () => ({ w: "", ipa: "", pos: "", vi: "", ex: "", ex_vi: "" })),
  grammar: { name: "", name_en: "", pattern: "", note: "", quiz: Array.from({ length: 3 }, () => ({ q: "", opts: ["", "", "", ""], ans: 0 })) },
  translations: [{ src: "", ref: "", dir: "vi-en" }, { src: "", ref: "", dir: "vi-en" }, { src: "", ref: "", dir: "en-vi" }, { src: "", ref: "", dir: "en-vi" }],
  roleplay: { ai_role: "", user_role: "", setting: "", tasks: ["", "", ""], opening: "" },
});

async function api(body?: unknown, q = "") {
  const r = await fetch("/api/admin/lessons" + q, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined);
  const j = await r.json().catch(() => ({}));
  if (!r.ok && !j.errors) throw new Error(j.error || "Lỗi " + r.status);
  return j;
}

export default function LessonsAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [lv, setLv] = useState("all");
  const [st, setSt] = useState("all");
  const [pgN, setPgN] = useState(0);
  const [ed, setEd] = useState<{ id?: number | string; l: Lesson; src?: string } | null>(null);
  const [res, setRes] = useState<{ errors: string[]; warns: string[] } | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [aiTopic, setAiTopic] = useState("");

  async function load() { try { const j = await api(); setRows(j.lessons); setErr(""); } catch (e) { setErr((e as Error).message); } }
  useEffect(() => { load(); }, []);

  const set = (f: (l: Lesson) => void) => setEd((e) => { if (!e) return e; const l = structuredClone(e.l); f(l); return { ...e, l }; });

  async function open(id: number | string) { setBusy("open"); try { const j = await api(undefined, "?id=" + id); setEd({ id, l: { ...blank(j.level), ...j.data, level: j.level, topic: j.topic, topic_en: j.topic_en || j.data.topic_en || "" } }); setRes(null); setMsg(""); scrollTo({ top: 0 }); } catch (e) { setMsg("✗ " + (e as Error).message); } setBusy(""); }
  async function check() { if (!ed) return; setBusy("check"); try { setRes(await api({ action: "check", lesson: ed.l, id: ed.id })); } catch (e) { setMsg("✗ " + (e as Error).message); } setBusy(""); }
  async function save(status: "draft" | "published") {
    if (!ed) return; setBusy(status);
    try { const j = await api({ action: "save", lesson: ed.l, id: ed.id, status, source: ed.src }); setRes({ errors: j.errors || [], warns: j.warns || [] });
      if (j.error) setMsg("✗ " + j.error); else { setEd({ ...ed, id: j.id }); setMsg(status === "published" ? "✓ Đã phát hành. Người học sẽ thấy bài ở lần mở app tiếp theo." : "✓ Đã lưu nháp"); load(); }
    } catch (e) { setMsg("✗ " + (e as Error).message); }
    setBusy("");
  }
  async function setStatus(id: number | string, status: string) { try { const j = await api({ action: "status", id, status }); setMsg(j.error ? "✗ " + j.error + (j.errors ? ": " + j.errors.join("; ") : "") : "✓ Đã cập nhật"); load(); } catch (e) { setMsg("✗ " + (e as Error).message); } }
  async function importFile() {
    setBusy("import");
    try {
      await new Promise<void>((ok, no) => { if ((window as unknown as { LESSON_BANK?: unknown }).LESSON_BANK) return ok(); const s = document.createElement("script"); s.src = "/lessonbank.js?v=2"; s.onload = () => ok(); s.onerror = () => no(new Error("Không tải được lessonbank.js")); document.head.appendChild(s); });
      const LB = (window as unknown as { LESSON_BANK: Record<string, Lesson[]> }).LESSON_BANK;
      const all = Object.entries(LB).flatMap(([level, ls]) => ls.map((l) => ({ ...l, level })));
      const j = await api({ action: "import", lessons: all }); setMsg(`✓ Đã nhập ${j.added} bài, bỏ qua ${j.skipped} bài đã có`); load();
    } catch (e) { setMsg("✗ " + (e as Error).message); }
    setBusy("");
  }
  // AI soạn nháp theo chủ đề + trình độ (dùng /api/ai sẵn có), rồi quản trị viên sửa và duyệt
  async function aiDraft() {
    const level = ed?.l.level || (lv !== "all" ? lv : "A1"); if (!aiTopic.trim()) return setMsg("Nhập chủ đề để AI soạn");
    setBusy("ai"); setMsg("");
    const sys = "You are an expert ESL course writer for Vietnamese learners. Write original content (never copy from published textbooks).";
    const prompt = `Write one lesson at CEFR level ${level} about: "${aiTopic}". Return JSON exactly:
{"topic":"lesson title in Vietnamese","topic_en":"lesson title in English","scenario":"one-sentence situation in Vietnamese",
"words":[{"w":"word or phrase","ipa":"/IPA/","pos":"part of speech in Vietnamese","vi":"Vietnamese meaning","ex":"English example","ex_vi":"Vietnamese translation"}] (exactly 8, all different, suited to ${level}),
"grammar":{"name":"grammar point (Vietnamese)","name_en":"grammar point (English)","pattern":"pattern","note":"2-3 sentence explanation in Vietnamese","quiz":[{"q":"sentence with ___","opts":["4 options"],"ans":0}] (exactly 3)},
"translations":[{"src":"...","ref":"...","dir":"vi-en"}] (4 items: 2 vi-en, 2 en-vi, using the lesson words),
"roleplay":{"ai_role":"in English","user_role":"in Vietnamese","setting":"in Vietnamese","tasks":["3 tasks in Vietnamese"],"opening":"AI's first line in English"}}`;
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system: sys, contents: prompt, json: true, heavy: true }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "AI lỗi");
      const d = JSON.parse(j.text);
      const l = { ...blank(level), ...d, level, words: (d.words || []).slice(0, 8), grammar: { ...blank().grammar, ...d.grammar } } as Lesson;
      setEd({ l, src: "ai" }); setRes(null); setMsg("✓ AI đã soạn nháp. Đọc lại, sửa, bấm Kiểm tra rồi Lưu.");
    } catch (e) { setMsg("✗ " + (e as Error).message); }
    setBusy("");
  }

  // Mới cập nhật lên đầu, mỗi trang 5 bài
  const list = (rows || []).filter((r) => (lv === "all" || r.level === lv) && (st === "all" || r.status === st)).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
  const pages = Math.max(1, Math.ceil(list.length / 5)), cur = Math.min(pgN, pages - 1), shown = list.slice(cur * 5, cur * 5 + 5);
  const count = (k: string) => (rows || []).filter((r) => r.level === k && r.status === "published").length;
  const F = ({ label, v, on, ph, wide }: { label: string; v: string; on: (x: string) => void; ph?: string; wide?: boolean }) => (
    <label className={`lf ${wide ? "wide" : ""}`}><span>{label}</span><input value={v || ""} placeholder={ph} onChange={(e) => on(e.target.value)} /></label>);

  if (err) return <section className="panel" id="lessons"><h3>Kho bài</h3><p className="fb">{err}</p></section>;

  return (
    <section className="panel" id="lessons">
      <div className="row between"><h3>Kho bài ({rows?.length ?? "…"})</h3>
        <div className="row"><button className="mini" onClick={() => { setEd({ l: blank(lv !== "all" ? lv : "A1") }); setRes(null); setMsg(""); }}>+ Thêm bài</button>
          {rows && rows.filter((r) => r.source === "file").length === 0 && <button className="mini" disabled={busy === "import"} onClick={importFile}>{busy === "import" ? "Đang nhập..." : "Nhập kho bài có sẵn"}</button>}</div></div>
      <div className="row">{LEVELS.map((k) => <span key={k} className="tag">{k}: {count(k)}</span>)}<span className="muted small">bài đã phát hành</span></div>

      <div className="row aidraft"><input placeholder="Chủ đề để AI soạn nháp, ví dụ: đặt phòng khách sạn qua điện thoại" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
        <button className="mini" disabled={busy === "ai"} onClick={aiDraft}>{busy === "ai" ? "AI đang soạn..." : "✨ AI soạn nháp"}</button></div>
      {msg && <p className="small">{msg}</p>}

      {ed && (
        <div className="led">
          <div className="row between"><b>{ed.id ? `Sửa bài #${ed.id}` : "Bài mới"}</b><button className="mini ghost" onClick={() => setEd(null)}>Đóng</button></div>
          <div className="lgrid">
            <label className="lf"><span>Trình độ</span><select value={ed.l.level} onChange={(e) => set((l) => { l.level = e.target.value; })}>{LEVELS.map((k) => <option key={k}>{k}</option>)}</select></label>
            <F label="Tên bài (Việt)" v={ed.l.topic} on={(x) => set((l) => { l.topic = x; })} />
            <F label="Tên bài (Anh)" v={ed.l.topic_en || ""} on={(x) => set((l) => { l.topic_en = x; })} />
            <F label="Tình huống" v={ed.l.scenario} on={(x) => set((l) => { l.scenario = x; })} wide />
          </div>
          <h4>Từ vựng (6–8 từ)</h4>
          <div className="adm-table"><table><thead><tr><th>Từ</th><th>IPA</th><th>Từ loại</th><th>Nghĩa</th><th>Ví dụ</th><th>Nghĩa ví dụ</th><th /></tr></thead><tbody>
            {ed.l.words.map((w, i) => <tr key={i}>{(["w", "ipa", "pos", "vi", "ex", "ex_vi"] as (keyof Word)[]).map((k) => <td key={k}><input value={w[k]} onChange={(e) => set((l) => { l.words[i][k] = e.target.value; })} /></td>)}
              <td><button className="mini ghost" onClick={() => set((l) => { l.words.splice(i, 1); })}>✕</button></td></tr>)}
          </tbody></table></div>
          {ed.l.words.length < 8 && <button className="mini" onClick={() => set((l) => { l.words.push({ w: "", ipa: "", pos: "", vi: "", ex: "", ex_vi: "" }); })}>+ Thêm từ</button>}
          <h4>Ngữ pháp</h4>
          <div className="lgrid">
            <F label="Tên (Việt)" v={ed.l.grammar.name} on={(x) => set((l) => { l.grammar.name = x; })} />
            <F label="Tên (Anh)" v={ed.l.grammar.name_en || ""} on={(x) => set((l) => { l.grammar.name_en = x; })} />
            <F label="Công thức" v={ed.l.grammar.pattern} on={(x) => set((l) => { l.grammar.pattern = x; })} />
            <label className="lf wide"><span>Giải thích</span><textarea rows={2} value={ed.l.grammar.note} onChange={(e) => set((l) => { l.grammar.note = e.target.value; })} /></label>
          </div>
          {ed.l.grammar.quiz.map((q, i) => (
            <div key={i} className="lq"><input placeholder={`Câu hỏi ${i + 1}, có chỗ trống ___`} value={q.q} onChange={(e) => set((l) => { l.grammar.quiz[i].q = e.target.value; })} />
              {q.opts.map((o, k) => <label key={k} className="opt-in"><input type="radio" name={`ans${i}`} checked={q.ans === k} onChange={() => set((l) => { l.grammar.quiz[i].ans = k; })} title="Đáp án đúng" />
                <input value={o} placeholder={`Lựa chọn ${k + 1}`} onChange={(e) => set((l) => { l.grammar.quiz[i].opts[k] = e.target.value; })} /></label>)}</div>))}
          <p className="muted small">Chấm tròn = đáp án đúng.</p>
          <h4>Câu dịch (2 Việt → Anh, 2 Anh → Việt)</h4>
          {ed.l.translations.map((t, i) => (
            <div key={i} className="lq tr"><select value={t.dir} onChange={(e) => set((l) => { l.translations[i].dir = e.target.value as Tr["dir"]; })}><option value="vi-en">Việt → Anh</option><option value="en-vi">Anh → Việt</option></select>
              <input placeholder="Câu gốc" value={t.src} onChange={(e) => set((l) => { l.translations[i].src = e.target.value; })} />
              <input placeholder="Bản dịch mẫu" value={t.ref} onChange={(e) => set((l) => { l.translations[i].ref = e.target.value; })} /></div>))}
          <h4>Role-play</h4>
          <div className="lgrid">
            <F label="Vai AI (tiếng Anh)" v={ed.l.roleplay.ai_role} on={(x) => set((l) => { l.roleplay.ai_role = x; })} />
            <F label="Vai người học" v={ed.l.roleplay.user_role} on={(x) => set((l) => { l.roleplay.user_role = x; })} />
            <F label="Bối cảnh" v={ed.l.roleplay.setting} on={(x) => set((l) => { l.roleplay.setting = x; })} wide />
            {ed.l.roleplay.tasks.map((t, i) => <F key={i} label={`Nhiệm vụ ${i + 1}`} v={t} on={(x) => set((l) => { l.roleplay.tasks[i] = x; })} />)}
            <F label="Câu mở đầu của AI (tiếng Anh)" v={ed.l.roleplay.opening} on={(x) => set((l) => { l.roleplay.opening = x; })} wide />
          </div>

          {res && <div className="lres">
            {res.errors.length === 0 ? <p className="tag good">✓ Không có lỗi, không trùng</p> : <ul className="bad-list">{res.errors.map((x, i) => <li key={i}>❌ {x}</li>)}</ul>}
            {res.warns.length > 0 && <ul className="warn-list">{res.warns.map((x, i) => <li key={i}>⚠️ {x}</li>)}</ul>}</div>}
          <div className="row sticky-actions">
            <button onClick={check} disabled={!!busy}>{busy === "check" ? "Đang kiểm tra..." : "Kiểm tra"}</button>
            <button onClick={() => save("draft")} disabled={!!busy}>Lưu nháp</button>
            <button disabled={!ed.id} title={ed.id ? "" : "Lưu nháp trước"} onClick={() => window.open(`/?preview=${ed.id}`, "_blank")}>👀 Xem thử như người học</button>
            <button className="primary" onClick={() => save("published")} disabled={!!busy}>Phát hành</button>
          </div>
        </div>)}

      <div className="row"><select value={lv} onChange={(e) => { setLv(e.target.value); setPgN(0); }}><option value="all">Mọi trình độ</option>{LEVELS.map((k) => <option key={k}>{k}</option>)}</select>
        <select value={st} onChange={(e) => { setSt(e.target.value); setPgN(0); }}><option value="all">Mọi trạng thái</option><option value="draft">Nháp</option><option value="published">Đã phát hành</option><option value="hidden">Đã ẩn</option></select></div>
      <div className="adm-table"><table><thead><tr><th>#</th><th>Trình độ</th><th>Bài</th><th>Trạng thái</th><th>Nguồn</th><th /></tr></thead><tbody>
        {shown.map((r) => <tr key={r.id}><td className="muted">{String(r.id).slice(0, 6)}</td><td><span className="tag">{r.level}</span></td><td><b>{r.topic}</b><br /><span className="muted small">{r.topic_en}</span></td>
          <td><span className={`tag ${ST[r.status]?.[1]}`}>{ST[r.status]?.[0]}</span></td><td className="small">{({ file: "Kho có sẵn", admin: "Tự soạn", ai: "AI" } as Record<string, string>)[r.source] || r.source}</td>
          <td className="row nowrap"><button className="mini" onClick={() => open(r.id)}>Sửa</button><button className="mini" onClick={() => window.open(`/?preview=${r.id}`, "_blank")}>👀</button>
            {r.status !== "published" ? <button className="mini" onClick={() => setStatus(r.id, "published")}>Phát hành</button> : <button className="mini danger" onClick={() => setStatus(r.id, "hidden")}>Ẩn</button>}</td></tr>)}
      </tbody></table></div>
      {pages > 1 && <div className="pager"><button className="mini" disabled={cur === 0} onClick={() => setPgN(cur - 1)}>‹ Trước</button>
        <span className="small">Trang {cur + 1}/{pages} · {list.length} bài</span><button className="mini" disabled={cur >= pages - 1} onClick={() => setPgN(cur + 1)}>Sau ›</button></div>}
    </section>
  );
}
