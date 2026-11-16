-- KHO BÀI CHUNG TỰ LỚN DẦN + BÁO LỖI BÀI HỌC
-- Chạy 1 lần trong Supabase → SQL Editor (sau lessons.sql).

-- Thống kê & cờ kiểm duyệt cho từng bài
alter table lessons add column if not exists reports int not null default 0;      -- số lượt báo lỗi chưa xử lý
alter table lessons add column if not exists flagged boolean not null default false; -- cần xem lại
alter table lessons add column if not exists flag_reason text;
alter table lessons add column if not exists uses int not null default 0;         -- số lần được học xong
alter table lessons add column if not exists score_sum int not null default 0;    -- tổng điểm (để tính điểm trung bình)

-- Báo lỗi từ người học
create table if not exists lesson_reports (
  id bigserial primary key,
  lesson_id text,                 -- id bài trong kho (nếu bài lấy từ kho)
  level text, topic text,
  step int,                       -- bước trong bài (0 ôn bài cũ … 5 tổng kết)
  kind text not null,             -- loại lỗi
  note text,                      -- người học ghi thêm
  item jsonb,                     -- câu/từ đang làm lúc báo lỗi
  lesson jsonb,                   -- bản sao bài (khi bài không có trong kho)
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz default now()
);
create index if not exists lesson_reports_open on lesson_reports(status, created_at desc);

-- Giới hạn số bài mỗi người góp vào kho mỗi ngày
create table if not exists lesson_contrib (
  user_id uuid not null references auth.users(id) on delete cascade,
  day text not null,
  n int not null default 0,
  primary key (user_id, day)
);

alter table lesson_reports enable row level security;
alter table lesson_contrib enable row level security;
