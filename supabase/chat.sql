-- TRÒ CHUYỆN ẨN DANH: phòng chung theo trình độ + ghép đôi 1-1, có tin nhắn giọng nói
-- Chạy 1 lần trong Supabase → SQL Editor. Mọi truy cập đi qua API của app (service role), nên bật RLS và KHÔNG tạo policy.
create table if not exists chat_rooms (
  id text primary key,                 -- 'lv-A1' (phòng chung) hoặc 'p-<uuid>' (ghép đôi)
  kind text not null check (kind in ('room','pair')),
  level text,
  a uuid, b uuid,                      -- 2 người trong phòng ghép đôi
  created_at timestamptz default now(),
  closed_at timestamptz
);
create table if not exists chat_messages (
  id bigserial primary key,
  room_id text not null references chat_rooms(id) on delete cascade,
  user_id uuid not null,
  text text,
  audio_path text,                     -- đường dẫn trong bucket 'chat-voice'
  audio_sec int,
  hidden boolean default false,
  created_at timestamptz default now()
);
create index if not exists chat_messages_room_idx on chat_messages(room_id, id);
create index if not exists chat_messages_user_idx on chat_messages(user_id, created_at);
create table if not exists chat_queue (user_id uuid primary key, level text not null, since timestamptz default now());
create table if not exists chat_reports (
  id bigserial primary key, message_id bigint, room_id text, reporter uuid not null, reported uuid not null,
  reason text, status text default 'open', created_at timestamptz default now()
);
create table if not exists chat_blocks (user_id uuid not null, blocked uuid not null, created_at timestamptz default now(), primary key (user_id, blocked));
create table if not exists chat_bans (user_id uuid primary key, until timestamptz not null, reason text, created_at timestamptz default now());

alter table chat_rooms enable row level security;
alter table chat_messages enable row level security;
alter table chat_queue enable row level security;
alter table chat_reports enable row level security;
alter table chat_blocks enable row level security;
alter table chat_bans enable row level security;

-- Phòng chung cho từng trình độ
insert into chat_rooms (id, kind, level) values
  ('lv-A0','room','A0'),('lv-A1','room','A1'),('lv-A2','room','A2'),('lv-B1','room','B1'),('lv-B2','room','B2'),('lv-C1','room','C1'),('lv-ALL','room','ALL')
on conflict (id) do nothing;

-- Kho lưu tin nhắn giọng nói (riêng tư, app phát qua link có hạn)
insert into storage.buckets (id, name, public) values ('chat-voice','chat-voice', false) on conflict (id) do nothing;

-- Tự dọn: tin nhắn cũ hơn 30 ngày, hàng chờ treo quá 10 phút (cần pg_cron, đã bật ở bước nhắc học)
select cron.schedule('chat-cleanup', '17 3 * * *', $$
  delete from chat_messages where created_at < now() - interval '30 days';
  delete from chat_rooms where kind = 'pair' and created_at < now() - interval '30 days';
  delete from chat_queue where since < now() - interval '10 minutes';
$$);
