# Sinh public/lessonbank.js từ bank_a.py + bank_b.py. Chạy: python art/make_bank.py
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_a import A0, A1, A2
from bank_b import B1, B2, C1

def lesson(t, level):
    topic, scen, words, g, tr, rp = t[:6]
    extra = t[6] if len(t) > 6 else {}   # tuỳ chọn: {"topic_en": "...", "grammar_en": "..."}
    gname, pattern, note, quiz = g
    assert len(words) >= 6, topic
    for w in words:
        assert len(w) == 6 and w[1].startswith("/") and w[1].endswith("/"), (topic, w)
    assert len(quiz) == 3 and all(len(q[1]) == 4 for q in quiz), topic
    assert len(tr) == 4 and sorted(x[2] for x in tr) == ["e", "e", "v", "v"], topic
    return {
        "level": level, "topic": topic, "scenario": scen,
        "words": [dict(zip(["w", "ipa", "pos", "vi", "ex", "ex_vi"], w)) for w in words],
        "grammar": {"name": gname, "pattern": pattern, "note": note,
                    "quiz": [{"q": q, "opts": o, "ans": 0, "explain": f'Đáp án đúng: "{o[0]}". {note}'} for q, o in quiz]},
        "translations": [{"src": s, "ref": r, "dir": "vi-en" if d == "v" else "en-vi"} for s, r, d in tr],
        "roleplay": dict(zip(["ai_role", "user_role", "setting", "tasks", "opening"], rp)),
        **({"topic_en": extra["topic_en"]} if extra.get("topic_en") else {}),
        **({"grammar_en": extra["grammar_en"]} if extra.get("grammar_en") else {}),
    }

# ---------- KIỂM TRA TRÙNG trước khi xuất kho ----------
import difflib, re, unicodedata
def norm(x):
    x = unicodedata.normalize("NFC", str(x)).lower().strip()
    x = re.sub(r"[^\w\s/'-]", " ", x); return re.sub(r"\s+", " ", x).strip()
def wkey(w):  # khoá từ vựng giống app dùng cho flashcard
    k = norm(w); return re.sub(r"^(to|a|an|the) ", "", k)
LEVELS = [("A0", A0), ("A1", A1), ("A2", A2), ("B1", B1), ("B2", B2), ("C1", C1)]
errors, warns, seen_topic, seen_word, seen_gram = [], [], {}, {}, {}
for lv, data in LEVELS:
    for t in data:
        topic, words, gname = t[0], t[2], t[3][0]
        name = f"{lv} · {topic}"
        # 1) Chủ đề trùng hoặc gần giống (trong cùng trình độ là lỗi, khác trình độ là cảnh báo)
        for (olv, ot), oname in seen_topic.items():
            r = difflib.SequenceMatcher(None, norm(topic), norm(ot)).ratio()
            if r >= 0.85: (errors if olv == lv else warns).append(f"Chủ đề gần giống ({r:.0%}): [{name}] và [{oname}]")
        seen_topic[(lv, topic)] = name
        # 2) Từ lặp ngay trong một bài
        ks = [wkey(w[0]) for w in words]
        for k in set(x for x in ks if ks.count(x) > 1): errors.append(f"Từ '{k}' lặp 2 lần trong [{name}]")
        # 3) Hai bài dùng chung nhiều từ (>= 4 từ là gần như trùng bài)
        shared = {}
        for k in set(ks):
            for o in seen_word.get(k, []): shared.setdefault(o, []).append(k)
        for o, lst in shared.items():
            if len(lst) >= 4: errors.append(f"[{name}] trùng {len(lst)} từ với [{o}]: {', '.join(sorted(lst))}")
            elif len(lst) >= 2: warns.append(f"[{name}] dùng lại {len(lst)} từ của [{o}]: {', '.join(sorted(lst))}")
        for k in set(ks): seen_word.setdefault(k, []).append(name)
        # 4) Cùng điểm ngữ pháp trong cùng trình độ
        g = (lv, norm(gname))
        if g in seen_gram: warns.append(f"Ngữ pháp '{gname}' dạy 2 lần ở {lv}: [{seen_gram[g]}] và [{name}]")
        seen_gram[g] = name
for w in warns: print("⚠️ ", w)
if errors:
    for e in errors: print("❌", e)
    sys.exit("\nCó bài bị trùng. Sửa các lỗi ❌ rồi chạy lại (file lessonbank.js chưa bị ghi đè).")

bank = {lv: [lesson(t, lv) for t in data] for lv, data in [("A0", A0), ("A1", A1), ("A2", A2), ("B1", B1), ("B2", B2), ("C1", C1)]}
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(root, "public", "lessonbank.js"), "w") as f:
    f.write("/* Tự sinh từ art/make_bank.py: kho bài mẫu theo trình độ CEFR */\nwindow.LESSON_BANK=" + json.dumps(bank, ensure_ascii=False) + ";\n")
total = sum(len(v) for v in bank.values())
print({k: len(v) for k, v in bank.items()}, "bài mới,", total, "tổng; từ vựng:", sum(len(l["words"]) for v in bank.values() for l in v))
