# Đưa app lên mạng, cài trên điện thoại, bật nhắc học mỗi 2 tiếng

## A. Chuẩn bị trên máy (VS Code, terminal Command Prompt)
1. Giải nén gói này vào thư mục `english-app`, chọn Replace.
   - Nếu còn file `middleware.ts` thì XÓA đi (đã có `proxy.ts`).
2. Cài thư viện gửi thông báo:
   npm install web-push
   npm install -D @types/web-push
3. Tạo cặp khóa thông báo (VAPID):
   npx web-push generate-vapid-keys
   Chép "Public Key" và "Private Key" vào .env.local:
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...Public Key...
   VAPID_PRIVATE_KEY=...Private Key...
   VAPID_SUBJECT=mailto:email-cua-ban@gmail.com
4. Thêm 2 dòng nữa vào .env.local:
   SUPABASE_SERVICE_ROLE_KEY=...  (Supabase > Project Settings > API Keys > service_role / secret key — TUYỆT ĐỐI không chia sẻ)
   CRON_SECRET=...  (tự đặt một chuỗi dài bất kỳ, ví dụ: hoc-tieng-anh-8f3k2m9x7q)
5. Supabase > SQL Editor: chạy PHẦN 1 trong supabase/push.sql (tạo bảng push_subscriptions).
6. Chạy thử: npm run dev → Cài đặt → "Bật nhắc học trên thiết bị này" → "Gửi thử".

## B. Đẩy code lên GitHub
1. Tạo repo mới trên github.com, chọn Private, KHÔNG tick "Add README".
2. Trong terminal (thư mục english-app):
   git add .
   git commit -m "Lo Trinh Tieng Anh"
   git branch -M main
   git remote add origin https://github.com/TEN-BAN/TEN-REPO.git
   git push -u origin main
   (File .env.local KHÔNG được đẩy lên — Next.js đã chặn sẵn trong .gitignore.)

## C. Deploy lên Vercel
1. vercel.com > Add New > Project > chọn repo vừa tạo > Import.
2. Mục Environment Variables: thêm TẤT CẢ các dòng trong .env.local:
   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY, GEMINI_MODEL,
   (GEMINI_FAST_MODEL, GEMINI_FALLBACK_MODELS nếu có),
   NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
   SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET
   Mẹo: dán nguyên nội dung .env.local vào ô đầu tiên, Vercel tự tách thành từng biến.
3. Bấm Deploy, chờ 1–2 phút. Bạn có link dạng https://ten-app.vercel.app

## D. Cho phép đăng nhập từ link mới
1. Supabase > Authentication > URL Configuration:
   - Site URL: https://ten-app.vercel.app
   - Redirect URLs: thêm https://ten-app.vercel.app/**  (giữ http://localhost:3000/** để vẫn chạy trên máy)
2. Google Cloud > Credentials > OAuth client "Web English":
   - Authorized JavaScript origins: thêm https://ten-app.vercel.app
   - Redirect URI giữ nguyên (link supabase.co/auth/v1/callback).

## E. Hẹn giờ nhắc mỗi 2 tiếng
Supabase > SQL Editor: mở PHẦN 2 trong supabase/push.sql, thay
  TEN-APP.vercel.app  → link Vercel của bạn
  MA-BI-MAT           → đúng giá trị CRON_SECRET
rồi Run. App sẽ được gọi lúc 8h, 10h, 12h, 14h, 16h, 18h, 20h, 22h (giờ Việt Nam).
Kiểm tra: select * from cron.job_run_details order by start_time desc limit 5;

## F. Cài lên điện thoại
- Android (Chrome): mở link Vercel > đăng nhập > menu ⋮ > "Cài đặt ứng dụng" / "Thêm vào màn hình chính".
- iPhone (iOS 16.4 trở lên, BẮT BUỘC dùng Safari): mở link > nút Chia sẻ > "Thêm vào MH chính".
  Thông báo trên iPhone CHỈ hoạt động khi mở app từ biểu tượng ngoài màn hình chính.
- Mở app từ biểu tượng > Cài đặt > "Bật nhắc học trên thiết bị này" > Cho phép > "Gửi thử".

## Cập nhật app sau này
Sửa code trên máy > git add . > git commit -m "cap nhat" > git push → Vercel tự deploy lại.

## AI dự phòng khi Gemini hết lượt (không bắt buộc)
Thêm một hoặc cả hai key vào `.env.local` và Vercel → Settings → Environment Variables:
```
GROQ_API_KEY=gsk_...          # console.groq.com/keys
OPENROUTER_API_KEY=sk-or-...  # openrouter.ai/keys
# Tùy chọn đổi model:
# GROQ_MODEL=llama-3.3-70b-versatile
# OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
```
Thứ tự: Gemini → Groq → OpenRouter.

## Trang quản trị /admin
Thêm biến trên Vercel: `ADMIN_EMAILS=email-cua-ban@gmail.com` (nhiều email cách nhau bởi dấu phẩy). Cần sẵn `SUPABASE_SERVICE_ROLE_KEY` và `VAPID_PRIVATE_KEY`.

## Cộng đồng (trò chuyện ẩn danh)
1. Supabase → SQL Editor → dán toàn bộ nội dung `supabase/chat.sql` → Run (tạo bảng, 7 phòng chung, kho ghi âm `chat-voice`, lịch tự dọn).
2. Cần sẵn `SUPABASE_SERVICE_ROLE_KEY` trên Vercel. (Tùy chọn) `CHAT_SALT=chuỗi-ngẫu-nhiên` để tạo biệt danh.
