# Hướng dẫn thêm bài vào kho SEED

## 1. Thêm vào đâu
| Trình độ | File | Danh sách |
|---|---|---|
| A0, A1, A2 | `art/bank_a.py` | `A0 = [...]`, `A1 = [...]`, `A2 = [...]` |
| B1, B2, C1 | `art/bank_b.py` | `B1 = [...]`, `B2 = [...]`, `C1 = [...]` |

Thêm bài mới **xuống cuối** danh sách của đúng trình độ. Không sửa hay xoá bài cũ (người học đã học bài đó vẫn giữ lịch sử).

## 2. Mẫu một bài (copy rồi sửa)
```python
("Đặt bàn qua điện thoại", "Gọi điện cho nhà hàng để đặt bàn tối thứ Bảy",
 [("book","/bʊk/","Động từ","đặt (chỗ)","I'd like to book a table.","Tôi muốn đặt một bàn."),
  ("table for two","/ˈteɪbl fə tuː/","Cụm từ","bàn cho hai người","A table for two, please.","Cho tôi một bàn hai người."),
  ("available","/əˈveɪləbl/","Tính từ","còn trống","Is 7 p.m. available?","7 giờ tối còn chỗ không?"),
  ("under the name","/ˈʌndə ðə neɪm/","Cụm từ","đứng tên","It's under the name Huy.","Đặt dưới tên Huy."),
  ("confirm","/kənˈfɜːm/","Động từ","xác nhận","Can you confirm my booking?","Bạn xác nhận giúp tôi nhé?"),
  ("cancel","/ˈkænsl/","Động từ","huỷ","I need to cancel my booking.","Tôi cần huỷ đặt chỗ.")],
 ("Would like to + V", "I'd like to + động từ", "Dùng để đặt yêu cầu lịch sự, tự nhiên hơn I want.",
  [("I'd like ___ a table.",["to book","book","booking","booked"]),
   ("___ you like to order?",["Would","Do","Are","Will"]),
   ("I'd like ___ my booking.",["to cancel","cancel","cancelling","cancels"])]),
 [("Tôi muốn đặt một bàn cho bốn người.","I'd like to book a table for four.","v"),
  ("Is 8 p.m. available?","8 giờ tối còn chỗ không?","e"),
  ("Đặt dưới tên Lan nhé.","It's under the name Lan.","v"),
  ("I need to cancel my booking.","Tôi cần huỷ đặt chỗ.","e")],
 ("Mia, a restaurant receptionist","Khách gọi đặt bàn","Bạn gọi điện cho nhà hàng để đặt bàn.",
  ["Nói số người và giờ","Cho biết tên","Hỏi có chỗ đậu xe không"],"Good evening, Green Garden Restaurant. How can I help?"),
 {"topic_en": "Booking a table by phone", "grammar_en": "Would like to + verb"}),
```

**Quy tắc (lệnh kiểm tra sẽ báo lỗi nếu sai):**
- 6–8 từ; mỗi từ đủ 6 phần: từ, IPA trong `/.../`, từ loại, nghĩa, câu ví dụ, nghĩa câu ví dụ.
- Ngữ pháp có đúng **3 câu hỏi**, mỗi câu **4 lựa chọn**, **đáp án đúng luôn đặt đầu tiên** (app tự xáo trộn).
- Đúng **4 câu dịch**: 2 câu `"v"` (Việt → Anh) và 2 câu `"e"` (Anh → Việt).
- Phần cuối `{"topic_en": ..., "grammar_en": ...}` là tên tiếng Anh để hiện khi người dùng chọn English (nên có).
- Tự viết câu ví dụ, hội thoại; không chép nguyên văn từ sách hay giáo trình có bản quyền.

## 3. Kiểm tra và xuất kho
```
python art/make_bank.py
```
Lệnh này kiểm tra **trùng lặp** trước khi ghi `public/lessonbank.js`:
| Ký hiệu | Ý nghĩa | Việc cần làm |
|---|---|---|
| ❌ Chủ đề gần giống ≥ 85% (cùng trình độ) | Gần như trùng bài | Đổi chủ đề khác |
| ❌ Hai bài dùng chung ≥ 4 từ | Trùng nội dung | Thay bớt từ |
| ❌ Từ lặp trong cùng một bài | Lỗi soạn | Xoá từ lặp |
| ⚠️ Dùng lại 2–3 từ của bài khác | Chấp nhận được (ôn lại) | Cân nhắc |
| ⚠️ Cùng điểm ngữ pháp 2 lần ở một trình độ | Có thể là ôn tập | Cân nhắc |

Có lỗi ❌ thì file kho **không bị ghi đè**. Sửa xong chạy lại, rồi `git push` như mọi lần.

## 4. Flashcard không bị trùng
App gộp thẻ theo từ đã chuẩn hoá: `To Book`, `book`, `book.` là **một thẻ**. Từ học lại ở bài khác chỉ cập nhật câu ví dụ, không tạo thẻ mới. Thẻ trùng của người dùng cũ được tự gộp khi mở app.

## 5. Thêm bao nhiêu là hợp lý
- Mỗi trình độ nên có **ít nhất 10–15 bài** (khoảng 2–3 tuần học) trước khi app quay vòng ôn lại.
- Mỗi bài **6–8 từ mới**, xoay quanh **một tình huống cụ thể** (đặt bàn, hỏi giá, báo cáo tiến độ…), không gom nhiều chủ đề.
- Thêm theo đợt (ví dụ 5 bài/lần), chạy kiểm tra, rồi deploy một lần.
