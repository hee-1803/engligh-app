import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { askJSON } from "@/lib/gemini";

type GenLesson = {
  title: string;
  grammar_point: string;
  grammar_note_vi: string;
  words: { headword: string; pos: string; ipa: string; meaning_vi: string; example_en: string; example_vi: string }[];
  translations: { src: string; ref: string; dir: "vi-en" | "en-vi" }[];
  roleplay: { ai_role: string; task_vi: string; opening: string };
};

const schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    grammar_point: { type: Type.STRING },
    grammar_note_vi: { type: Type.STRING },
    words: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          headword: { type: Type.STRING }, pos: { type: Type.STRING }, ipa: { type: Type.STRING },
          meaning_vi: { type: Type.STRING }, example_en: { type: Type.STRING }, example_vi: { type: Type.STRING },
        },
        required: ["headword", "pos", "ipa", "meaning_vi", "example_en", "example_vi"],
      },
    },
    translations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { src: { type: Type.STRING }, ref: { type: Type.STRING }, dir: { type: Type.STRING, enum: ["vi-en", "en-vi"] } },
        required: ["src", "ref", "dir"],
      },
    },
    roleplay: {
      type: Type.OBJECT,
      properties: { ai_role: { type: Type.STRING }, task_vi: { type: Type.STRING }, opening: { type: Type.STRING } },
      required: ["ai_role", "task_vi", "opening"],
    },
  },
  required: ["title", "grammar_point", "grammar_note_vi", "words", "translations", "roleplay"],
};

// POST /api/generate-lesson  -> Gemini sinh 1 bài mới và lưu vào database
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
  const { data: last } = await supabase.from("lessons").select("seq_no, title")
    .eq("user_id", user.id).order("seq_no", { ascending: false }).limit(20);
  const seq = (last?.[0]?.seq_no ?? 0) + 1;
  const doneTitles = (last ?? []).map((l) => l.title).join("; ") || "(chưa có)";

  const lesson = await askJSON<GenLesson>(
    "Bạn là chuyên gia thiết kế giáo trình tiếng Anh cho người Việt.",
    `Tạo bài học số ${seq}.
Trình độ: ${profile?.current_level ?? "A2"}. Mục tiêu: ${profile?.primary_goal ?? "communication"}. Quan tâm: ${JSON.stringify(profile?.goal_detail ?? {})}.
Các bài đã có (không lặp chủ đề): ${doneTitles}.
Yêu cầu: đúng 8 từ/cụm từ cốt lõi theo chủ đề, phù hợp trình độ; 3 câu dịch vi-en và 3 câu en-vi có dùng từ và ngữ pháp của bài;
kịch bản role-play thực tế, "opening" là câu mở đầu của AI bằng tiếng Anh.`,
    schema
  );

  const { data: row, error } = await supabase.from("lessons").insert({
    user_id: user.id,
    seq_no: seq,
    title: lesson.title,
    level: profile?.current_level ?? "A2",
    grammar_point: lesson.grammar_point,
    grammar_note_vi: lesson.grammar_note_vi,
    translation_items: lesson.translations,
    roleplay: lesson.roleplay,
    status: seq === 1 ? "available" : "locked",
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: vocab, error: vErr } = await supabase.from("vocabulary")
    .upsert(lesson.words.map((w) => ({ ...w, level: profile?.current_level ?? "A2" })), { onConflict: "headword,pos" })
    .select("id");
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });

  await supabase.from("lesson_vocab").insert(vocab!.map((v) => ({ lesson_id: row.id, vocab_id: v.id })));
  return NextResponse.json({ ok: true, lesson: row });
}
