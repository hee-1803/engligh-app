-- PHẢN HỒI NGƯỜI DÙNG (Cài đặt → Gửi phản hồi). Chạy 1 lần trong Supabase → SQL Editor.
create table if not exists feedback (
  id bigserial primary key,
  user_id uuid not null,
  kind text,            -- idea | bug | love | other
  rating int,           -- 1..5 (không bắt buộc)
  message text,
  level text,
  user_agent text,
  status text default 'new',   -- new | done
  created_at timestamptz default now()
);
alter table feedback enable row level security;  -- chỉ đọc/ghi qua API của app (service role)
