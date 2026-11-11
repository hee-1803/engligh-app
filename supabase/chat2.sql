-- TRÒ CHUYỆN v2: thu hồi tin nhắn, ghép đôi không cần cùng online, giữ cuộc trò chuyện (bạn chat ẩn danh)
-- Chạy SAU chat.sql, 1 lần trong Supabase → SQL Editor.
alter table chat_rooms add column if not exists a_keep boolean default false;
alter table chat_rooms add column if not exists b_keep boolean default false;
alter table chat_rooms add column if not exists saved_at timestamptz;      -- cả 2 cùng bấm "Giữ" → thành bạn chat
alter table chat_rooms add column if not exists last_msg_at timestamptz;
alter table chat_rooms add column if not exists last_push_at timestamptz;
alter table chat_messages add column if not exists recalled boolean default false;

-- Người tham gia cộng đồng (để ghép đôi cả khi người kia đang offline)
create table if not exists chat_members (user_id uuid primary key, level text, last_seen timestamptz default now(), open boolean default true);
-- Đã đọc tới tin nào (đếm tin chưa đọc)
create table if not exists chat_reads (user_id uuid not null, room_id text not null, last_id bigint default 0, primary key (user_id, room_id));
alter table chat_members enable row level security;
alter table chat_reads enable row level security;
create index if not exists chat_rooms_a_idx on chat_rooms(a) where kind = 'pair';
create index if not exists chat_rooms_b_idx on chat_rooms(b) where kind = 'pair';

-- Lịch dọn mới: KHÔNG xoá tin của các cuộc trò chuyện đã giữ (bạn chat)
select cron.unschedule('chat-cleanup');
select cron.schedule('chat-cleanup', '17 3 * * *', $$
  delete from chat_messages m using chat_rooms r
    where m.room_id = r.id and m.created_at < now() - interval '30 days' and r.saved_at is null;
  delete from chat_rooms where kind = 'pair' and saved_at is null and created_at < now() - interval '30 days';
  delete from chat_queue where since < now() - interval '1 day';
$$);
