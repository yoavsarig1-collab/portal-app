-- Portal — optional cloud save schema
-- Paste this whole file into Supabase → SQL Editor → Run

create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  name text,
  interests text[] not null default '{}',
  seeking text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  practice_id text not null,
  ts bigint not null,
  completed boolean not null,
  skipped_after_ms integer,
  reflection text,
  context jsonb,
  unique (user_id, practice_id, ts)
);

alter table public.profiles enable row level security;
alter table public.history enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own history" on public.history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- beta feedback: anyone may leave a note, nobody may read them through the app
-- (Yoav reads them in the Supabase dashboard: Table Editor → feedback)
create table public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text,
  message text not null check (char_length(message) between 1 and 2000)
);

alter table public.feedback enable row level security;

create policy "anyone can leave feedback" on public.feedback
  for insert to anon, authenticated with check (true);
