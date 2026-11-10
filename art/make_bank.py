# Sinh public/lessonbank.js từ bank_a.py + bank_b.py. Chạy: python art/make_bank.py
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bank_a import A0, A1, A2
from bank_b import B1, B2, C1

def lesson(t, level):
    topic, scen, words, g, tr, rp = t
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
    }

bank = {lv: [lesson(t, lv) for t in data] for lv, data in [("A0", A0), ("A1", A1), ("A2", A2), ("B1", B1), ("B2", B2), ("C1", C1)]}
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(root, "public", "lessonbank.js"), "w") as f:
    f.write("/* Tự sinh từ art/make_bank.py: kho bài mẫu theo trình độ CEFR */\nwindow.LESSON_BANK=" + json.dumps(bank, ensure_ascii=False) + ";\n")
total = sum(len(v) for v in bank.values())
print({k: len(v) for k, v in bank.items()}, "bài mới,", total, "tổng; từ vựng:", sum(len(l["words"]) for v in bank.values() for l in v))
