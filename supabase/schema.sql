-- MyDreams schema. Paste this into Supabase → SQL Editor → New query → Run.
-- Re-runnable: drops & recreates policies but preserves data.

create extension if not exists "pgcrypto";

-- DREAMS ---------------------------------------------------------------------
create table if not exists public.dreams (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('text', 'image', 'video')),
  text text check (text is null or length(text) <= 500),
  x real not null,
  y real not null,
  z real not null,
  author_id uuid not null references auth.users(id) on delete cascade
);

alter table public.dreams enable row level security;

drop policy if exists "anyone can read dreams" on public.dreams;
create policy "anyone can read dreams"
  on public.dreams for select
  using (true);

drop policy if exists "authed users insert their own dreams" on public.dreams;
create policy "authed users insert their own dreams"
  on public.dreams for insert
  with check (auth.uid() = author_id);

-- REPORTS --------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid not null references public.dreams(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "authed users insert reports" on public.reports;
create policy "authed users insert reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- Realtime: stream new dreams to all connected clients so markers appear
-- without a page refresh.
alter publication supabase_realtime add table public.dreams;
