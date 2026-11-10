-- Chạy trong Supabase > SQL Editor (một lần). Lưu toàn bộ tiến độ học dưới dạng JSON.
create table if not exists app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table app_state enable row level security;
drop policy if exists own_state on app_state;
create policy own_state on app_state for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
