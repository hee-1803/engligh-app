-- NỘI DUNG TRANG "VỀ SEED" (sửa trong trang quản trị → tab 🌱 Giới thiệu). Chạy 1 lần trong Supabase → SQL Editor.
create table if not exists app_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by text
);
alter table app_content enable row level security;   -- đọc/ghi qua API của app (service role)
