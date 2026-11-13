-- BẢNG XẾP HẠNG TUẦN + GIẢI ĐẤU + PHẦN THƯỞNG
-- Chạy 1 lần trong Supabase → SQL Editor. App đọc/ghi qua API (service role), người dùng không ghi trực tiếp được.

-- Điểm từng tuần (week = ngày thứ Hai của tuần, giờ Việt Nam)
create table if not exists lb_scores (
  user_id uuid not null references auth.users(id) on delete cascade,
  week text not null,
  level text not null,
  league int not null default 0,
  points int not null default 0,
  updated_at timestamptz default now(),
  primary key (user_id, week)
);
create index if not exists lb_scores_board on lb_scores(week, level, league, points desc);

-- Hồ sơ phần thưởng của từng người
create table if not exists lb_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  league int not null default 0,            -- 0 Hạt giống · 1 Mầm non · 2 Cây non · 3 Cây lớn · 4 Đại thụ
  opt_out boolean not null default false,   -- không tham gia xếp hạng
  show_name boolean not null default false, -- hiện tên thật thay cho biệt danh
  display_name text,
  badges jsonb not null default '[]',       -- huy hiệu đã nhận
  title text, title_week text,              -- danh hiệu tuần này
  frames jsonb not null default '[]',       -- khung ảnh đã mở khoá
  frame text,                               -- khung đang dùng
  freezes int not null default 0,           -- số lần đóng băng chuỗi còn lại
  milestones jsonb not null default '{}',   -- mốc điểm đã nhận theo tuần
  last_overtaken text,                      -- ngày gần nhất được báo "bị vượt"
  last_result jsonb,                        -- kết quả tuần trước (để báo cho người dùng)
  seen_week text                            -- đã xem kết quả tuần nào
);

-- Đánh dấu tuần đã chốt (trao thưởng, lên/xuống giải)
create table if not exists lb_weeks (
  week text primary key,
  done_at timestamptz default now()
);

alter table lb_scores enable row level security;
alter table lb_profile enable row level security;
alter table lb_weeks enable row level security;
