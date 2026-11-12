// Kiểm tra bài học: đúng cấu trúc + không trùng với bài khác (dùng chung cho API quản trị)
export type Word = { w: string; ipa: string; pos: string; vi: string; ex: string; ex_vi: string };
export type Lesson = {
  level: string; topic: string; topic_en?: string; scenario: string; words: Word[];
  grammar: { name: string; name_en?: string; pattern: string; note: string; quiz: { q: string; opts: string[]; ans: number; explain?: string }[] };
  translations: { src: string; ref: string; dir: "vi-en" | "en-vi" }[];
  roleplay: { ai_role: string; user_role: string; setting: string; tasks: string[]; opening: string };
};
export const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];
const norm = (x: string) => String(x || "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}\s/'-]/gu, " ").replace(/\s+/g, " ").trim();
export const wkey = (w: string) => norm(w).replace(/^(to|a|an|the) (?=\S)/, "");
// Độ giống nhau giữa 2 chuỗi (0..1) theo cặp ký tự
function sim(a: string, b: string) {
  a = norm(a); b = norm(b); if (!a || !b) return 0; if (a === b) return 1;
  const bg = (s: string) => { const m = new Map<string, number>(); for (let i = 0; i < s.length - 1; i++) { const k = s.slice(i, i + 2); m.set(k, (m.get(k) || 0) + 1); } return m; };
  const A = bg(a), B = bg(b); let inter = 0;
  for (const [k, n] of A) inter += Math.min(n, B.get(k) || 0);
  return (2 * inter) / (a.length - 1 + b.length - 1);
}

export function validate(l: Lesson): string[] {
  const e: string[] = [];
  if (!LEVELS.includes(l?.level)) e.push("Chưa chọn trình độ");
  if (!l?.topic?.trim()) e.push("Thiếu tên bài (tiếng Việt)");
  if (!l?.topic_en?.trim()) e.push("Thiếu tên bài tiếng Anh");
  const ws = l?.words || [];
  if (ws.length < 6 || ws.length > 8) e.push(`Cần 6–8 từ vựng (đang có ${ws.length})`);
  ws.forEach((w, i) => {
    if (!w.w?.trim() || !w.vi?.trim()) e.push(`Từ ${i + 1}: thiếu từ hoặc nghĩa`);
    if (!/^\/.+\/$/.test((w.ipa || "").trim())) e.push(`Từ ${i + 1} (${w.w || "?"}): IPA phải nằm trong /.../`);
    if (!w.ex?.trim() || !w.ex_vi?.trim()) e.push(`Từ ${i + 1} (${w.w || "?"}): thiếu câu ví dụ hoặc nghĩa câu ví dụ`);
  });
  const keys = ws.map((w) => wkey(w.w)); const dupIn = keys.filter((k, i) => k && keys.indexOf(k) !== i);
  if (dupIn.length) e.push(`Từ bị lặp trong bài: ${[...new Set(dupIn)].join(", ")}`);
  const g = l?.grammar;
  if (!g?.name?.trim() || !g?.note?.trim()) e.push("Thiếu tên hoặc giải thích ngữ pháp");
  if ((g?.quiz || []).length !== 3) e.push("Ngữ pháp cần đúng 3 câu hỏi");
  (g?.quiz || []).forEach((q, i) => {
    if (!q.q?.includes("___")) e.push(`Câu hỏi ngữ pháp ${i + 1}: cần chỗ trống ___`);
    if ((q.opts || []).filter((o) => o?.trim()).length !== 4) e.push(`Câu hỏi ngữ pháp ${i + 1}: cần 4 lựa chọn`);
    if (!(q.ans >= 0 && q.ans < 4)) e.push(`Câu hỏi ngữ pháp ${i + 1}: chưa chọn đáp án đúng`);
    if (new Set((q.opts || []).map(norm)).size !== (q.opts || []).length) e.push(`Câu hỏi ngữ pháp ${i + 1}: có 2 lựa chọn giống nhau`);
  });
  const tr = l?.translations || [];
  if (tr.length !== 4 || tr.filter((t) => t.dir === "vi-en").length !== 2) e.push("Cần đúng 4 câu dịch: 2 câu Việt → Anh, 2 câu Anh → Việt");
  tr.forEach((t, i) => { if (!t.src?.trim() || !t.ref?.trim()) e.push(`Câu dịch ${i + 1}: thiếu câu gốc hoặc bản dịch mẫu`); });
  const rp = l?.roleplay;
  if (!rp?.ai_role?.trim() || !rp?.setting?.trim() || !rp?.opening?.trim()) e.push("Role-play: thiếu vai AI, bối cảnh hoặc câu mở đầu");
  if ((rp?.tasks || []).filter((x) => x?.trim()).length !== 3) e.push("Role-play: cần đúng 3 nhiệm vụ");
  return e;
}

// So với các bài khác: trả về lỗi (chặn) và cảnh báo (cho qua)
export function duplicates(l: Lesson, others: { id: number; level: string; topic: string; topic_en?: string; data: Lesson }[]) {
  const errors: string[] = [], warns: string[] = [];
  const mine = new Set((l.words || []).map((w) => wkey(w.w)));
  for (const o of others) {
    const name = `#${o.id} ${o.level} · ${o.topic}`;
    const s = Math.max(sim(l.topic, o.topic), l.topic_en && o.topic_en ? sim(l.topic_en, o.topic_en) : 0);
    if (s >= 0.85) (o.level === l.level ? errors : warns).push(`Tên bài giống ${Math.round(s * 100)}% với [${name}]`);
    const shared = (o.data?.words || []).map((w) => wkey(w.w)).filter((k) => mine.has(k));
    if (shared.length >= 4) errors.push(`Trùng ${shared.length} từ với [${name}]: ${shared.join(", ")}`);
    else if (shared.length >= 2) warns.push(`Dùng lại ${shared.length} từ của [${name}]: ${shared.join(", ")}`);
    if (o.level === l.level && norm(o.data?.grammar?.name) && norm(o.data?.grammar?.name) === norm(l.grammar?.name)) warns.push(`Cùng điểm ngữ pháp với [${name}]`);
  }
  return { errors, warns };
}
