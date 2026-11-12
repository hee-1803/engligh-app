-- KHO BÀI TRONG DATABASE (thêm/sửa/xem thử/duyệt bài trong trang quản trị, không cần deploy lại)
-- Chạy 1 lần trong Supabase → SQL Editor.
create table if not exists lessons (
  id bigserial primary key,
  level text not null check (level in ('A0','A1','A2','B1','B2','C1')),
  topic text not null,              -- tên bài tiếng Việt
  topic_en text,                    -- tên bài tiếng Anh
  data jsonb not null,              -- nội dung bài (từ vựng, ngữ pháp, câu dịch, role-play)
  status text not null default 'draft' check (status in ('draft','published','hidden')),
  sort int default 0,               -- thứ tự trong trình độ
  source text default 'admin',      -- admin | ai | file
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists lessons_level_idx on lessons(level, status, sort);
alter table lessons enable row level security;   -- đọc/ghi qua API của app (service role)
