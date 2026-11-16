-- GIỌNG ĐỌC AI: nơi lưu file MP3 đã tạo (mỗi câu chỉ tạo 1 lần) + đếm số ký tự mỗi ngày
-- Chạy 1 lần trong Supabase → SQL Editor.

-- Kho file âm thanh (công khai để điện thoại tải nhanh; chỉ chứa câu tiếng Anh/tiếng Việt trong bài, không có dữ liệu cá nhân)
insert into storage.buckets (id, name, public) values ('tts', 'tts', true) on conflict (id) do update set public = true;

-- Đếm ký tự đã gửi cho Google mỗi ngày (để không vượt hạn mức miễn phí)
create table if not exists tts_usage (
  day text primary key,
  chars int not null default 0
);
alter table tts_usage enable row level security;
