-- =========================================================
-- PHẦN 1: Bảng lưu thiết bị nhận thông báo (chạy 1 lần)
-- =========================================================
create table if not exists push_subscriptions (
  endpoint    text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  keys        jsonb not null,
  user_agent  text,
  created_at  timestamptz default now()
);
alter table push_subscriptions enable row level security;
drop policy if exists own_push on push_subscriptions;
create policy own_push on push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================
-- PHẦN 2: Hẹn giờ nhắc mỗi 2 tiếng (chạy SAU KHI đã deploy lên Vercel)
-- Thay 2 chỗ: TEN-APP.vercel.app và MA-BI-MAT (giống CRON_SECRET trên Vercel)
-- Giờ trong pg_cron là UTC: 1,3,...,15 giờ UTC = 8,10,...,22 giờ Việt Nam
-- =========================================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('nhac-hoc-2-tieng') where exists (select 1 from cron.job where jobname = 'nhac-hoc-2-tieng');
select cron.schedule(
  'nhac-hoc-2-tieng',
  '0 1-15/2 * * *',
  $$ select net.http_get(
       url := 'https://TEN-APP.vercel.app/api/cron/remind',
       headers := jsonb_build_object('Authorization', 'Bearer MA-BI-MAT')
     ); $$
);

-- Kiểm tra lịch đã tạo:      select * from cron.job;
-- Xem kết quả các lần chạy:  select * from cron.job_run_details order by start_time desc limit 10;
-- Xem phản hồi của app:      select status_code, content from net._http_response order by created desc limit 5;
