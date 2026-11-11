-- TRÒ CHUYỆN v3: tắt thông báo riêng từng cuộc trò chuyện. Chạy SAU chat2.sql.
alter table chat_rooms add column if not exists a_mute boolean default false;
alter table chat_rooms add column if not exists b_mute boolean default false;
