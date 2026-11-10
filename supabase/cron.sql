-- Lịch gọi app mỗi 15 phút. Giờ nhắc của từng người do họ tự đặt trong Cài đặt của app.
-- Chạy trong Supabase > SQL Editor. Đoạn này tự xóa các lịch cũ.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobname) from cron.job where jobname in ('nhac-hoc-2-tieng', 'nhac-hoc-cuoi-ngay', 'nhac-hoc');
select cron.schedule(
  'nhac-hoc',
  '*/15 * * * *',
  $$ select net.http_get(
       url := 'https://engligh.vercel.app/api/cron/remind',
       headers := jsonb_build_object('Authorization', 'Bearer 9cf1a79960b523894b1d4119b6063bc676b0949002018e8f')
     ); $$
);

-- Kiểm tra:  select jobname, schedule from cron.job;
-- Thử gửi ngay (bỏ qua giờ nhắc, chỉ gửi nếu hôm nay chưa học):
--   select net.http_get(url := 'https://engligh.vercel.app/api/cron/remind?force=1',
--     headers := jsonb_build_object('Authorization', 'Bearer 9cf1a79960b523894b1d4119b6063bc676b0949002018e8f'));
--   select status_code, content from net._http_response order by created desc limit 1;
