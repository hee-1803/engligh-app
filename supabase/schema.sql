-- =========================================================
-- English App - Schema cho bản cá nhân (Supabase / PostgreSQL)
-- Chạy toàn bộ file này trong Supabase > SQL Editor > New query
-- =========================================================

create type cefr_level as enum ('A0','A1','A2','B1','B2','C1');
create type goal_type  as enum ('communication','work','travel','exam');

-- ---------- HỒ SƠ ----------
create table user_profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  primary_goal   goal_type default 'communication',
  goal_detail    jsonb default '{}',      -- {"interest":"IT","exam":"IELTS"}
  daily_minutes  smallint default 30,
  weak_skills    text[] default '{}',
  current_level  cefr_level default 'A2',
  target_level   cefr_level default 'B1',
  streak_days    int default 0,
  last_active    date,
  created_at     timestamptz default now()
);

-- ---------- NỘI DUNG ----------
create table vocabulary (
  id            uuid primary key default gen_random_uuid(),
  headword      text not null,
  pos           text,
  ipa           text,
  meaning_vi    text,
  example_en    text,
  example_vi    text,
  level         cefr_level,
  tags          text[] default '{}',
  unique (headword, pos)
);

create table lessons (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade,
  seq_no            int not null,             -- thứ tự trong lộ trình: 1, 2, 3...
  title             text not null,
  level             cefr_level,
  grammar_point     text,
  grammar_note_vi   text,
  translation_items jsonb default '[]',      -- [{"src":"...","ref":"...","dir":"vi-en"}]
  roleplay          jsonb default '{}',      -- {"ai_role":"...","task_vi":"...","opening":"..."}
  is_remedial       boolean default false,
  status            text default 'locked' check (status in ('locked','available','in_progress','completed')),
  created_at        timestamptz default now(),
  unique (user_id, seq_no)
);

create table lesson_vocab (
  lesson_id uuid references lessons(id) on delete cascade,
  vocab_id  uuid references vocabulary(id) on delete cascade,
  primary key (lesson_id, vocab_id)
);

-- ---------- BUỔI HỌC ----------
create table lesson_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  lesson_id       uuid references lessons(id) on delete cascade,
  prev_session_id uuid references lesson_sessions(id),
  current_step    smallint default 1 check (current_step between 1 and 6),
  scores          jsonb default '{}',        -- {"review":80,"sentence":70,"translation":75,"roleplay":60}
  overall_score   numeric(5,2),
  summary         jsonb,
  started_at      timestamptz default now(),
  completed_at    timestamptz
);

create table session_step_results (
  id            bigserial primary key,
  session_id    uuid references lesson_sessions(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  step          smallint check (step between 1 and 6),
  vocab_id      uuid references vocabulary(id),
  user_input    text,
  ai_feedback   jsonb,                       -- {"score":7,"corrected":"...","errors":[...]}
  score         numeric(4,2),
  created_at    timestamptz default now()
);

create table roleplay_messages (
  id          bigserial primary key,
  session_id  uuid references lesson_sessions(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  role        text check (role in ('user','ai')),
  content     text,
  correction  text,
  created_at  timestamptz default now()
);

-- ---------- FLASHCARD + SRS (FSRS) ----------
create table user_vocab (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  vocab_id       uuid references vocabulary(id) on delete cascade,
  source         text default 'lesson',     -- lesson, roleplay_mistake, manual
  personal_example text,
  state          smallint default 0,        -- 0 New, 1 Learning, 2 Review, 3 Relearning
  stability      real default 0,
  difficulty     real default 0,
  reps           int default 0,
  lapses         int default 0,
  due_at         timestamptz default now(),
  last_review    timestamptz,
  unique (user_id, vocab_id)
);
create index idx_user_vocab_due on user_vocab (user_id, due_at);

create table flashcard_reviews (
  id            bigserial primary key,
  user_vocab_id uuid references user_vocab(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  rating        smallint check (rating between 1 and 4),  -- Again/Hard/Good/Easy
  context       text,                                    -- warm_up, flashcard, unit_test
  reviewed_at   timestamptz default now()
);

-- ---------- KIỂM TRA ----------
create table assessments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  type          text check (type in ('placement','unit_test')),
  unit_no       int,
  total_score   numeric(5,2),
  skill_scores  jsonb,
  result_level  cefr_level,
  wrong_items   jsonb default '[]',
  completed_at  timestamptz default now()
);

-- =========================================================
-- BẢO MẬT: mỗi người chỉ đọc/ghi dữ liệu của chính mình
-- =========================================================
alter table user_profiles        enable row level security;
alter table vocabulary           enable row level security;
alter table lessons              enable row level security;
alter table lesson_vocab         enable row level security;
alter table lesson_sessions      enable row level security;
alter table session_step_results enable row level security;
alter table roleplay_messages    enable row level security;
alter table user_vocab           enable row level security;
alter table flashcard_reviews    enable row level security;
alter table assessments          enable row level security;

create policy own_profile  on user_profiles        for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_lessons  on lessons              for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_sessions on lesson_sessions      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_steps    on session_step_results for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_messages on roleplay_messages    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_cards    on user_vocab           for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_reviews  on flashcard_reviews    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_tests    on assessments          for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Từ điển dùng chung: người đã đăng nhập được đọc và thêm
create policy vocab_rw on vocabulary for all to authenticated using (true) with check (true);
create policy lesson_vocab_rw on lesson_vocab for all to authenticated
  using (exists (select 1 from lessons l where l.id = lesson_id and l.user_id = auth.uid()))
  with check (exists (select 1 from lessons l where l.id = lesson_id and l.user_id = auth.uid()));

-- Tự tạo hồ sơ khi có tài khoản mới
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (user_id, display_name) values (new.id, split_part(new.email,'@',1));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
