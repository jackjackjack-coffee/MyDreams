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

-- Image/video support: URL of the uploaded media file (null for text dreams).
alter table public.dreams add column if not exists media_url text;

-- Realtime: stream new dreams to all connected clients so markers appear
-- without a page refresh. (Wrapped so re-running the file doesn't error if
-- the table is already in the publication.)
do $$
begin
  alter publication supabase_realtime add table public.dreams;
exception
  when duplicate_object then null;
end $$;

-- STORAGE: dream media bucket ------------------------------------------------
-- Public bucket so anyone can view the images / videos.
insert into storage.buckets (id, name, public)
values ('dream-media', 'dream-media', true)
on conflict (id) do nothing;

drop policy if exists "anyone read dream media" on storage.objects;
create policy "anyone read dream media"
  on storage.objects for select
  using (bucket_id = 'dream-media');

-- SAFETY PASS ------------------------------------------------------------------

-- Hidden flag: a dream reported by enough different visitors disappears from
-- the world automatically and waits for review (see moderation_queue below).
alter table public.dreams add column if not exists hidden boolean not null default false;

-- Everyone can read dreams — except hidden ones. The Supabase dashboard's SQL
-- editor bypasses row security, so you can still see and restore them there.
drop policy if exists "anyone can read dreams" on public.dreams;
create policy "anyone can read dreams"
  on public.dreams for select
  using (hidden = false);

-- Rate-limit helpers. "security definer" lets these count rows without being
-- filtered by row security, so the limit can't be dodged.
create or replace function public.dreams_placed_recently(uid uuid)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)
  from public.dreams
  where author_id = uid
    and created_at > now() - interval '1 hour';
$$;

create or replace function public.media_uploaded_recently(uid uuid)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)
  from storage.objects
  where bucket_id = 'dream-media'
    and (storage.foldername(name))[1] = uid::text
    and created_at > now() - interval '1 hour';
$$;

-- RATE LIMIT: at most 5 dreams per hour per visitor, enforced by the database
-- itself — a malicious script talking straight to the API hits the same wall.
drop policy if exists "authed users insert their own dreams" on public.dreams;
create policy "authed users insert their own dreams"
  on public.dreams for insert
  with check (
    auth.uid() = author_id
    and public.dreams_placed_recently(auth.uid()) < 5
  );

-- One report per visitor per dream, so a single person can't get something
-- hidden by spamming Report. Drop any duplicates that predate this rule so
-- the unique index can be created.
delete from public.reports r
using public.reports r2
where r.dream_id = r2.dream_id
  and r.reporter_id = r2.reporter_id
  and r.id > r2.id;

create unique index if not exists reports_one_per_user_per_dream
  on public.reports (dream_id, reporter_id);

-- AUTO-HIDE: after 3 distinct visitors report a dream, hide it from the world.
create or replace function public.auto_hide_reported_dream()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.reports where dream_id = new.dream_id) >= 3 then
    update public.dreams set hidden = true where id = new.dream_id;
  end if;
  return new;
end;
$$;

drop trigger if exists auto_hide_reported_dream on public.reports;
create trigger auto_hide_reported_dream
  after insert on public.reports
  for each row execute function public.auto_hide_reported_dream();

-- MODERATION QUEUE: every reported dream, most-reported first. Only visible
-- from the dashboard (SQL editor / Table editor), not from the app.
drop view if exists public.moderation_queue;
create view public.moderation_queue
with (security_invoker = on) as
select
  d.id,
  d.kind,
  left(coalesce(d.text, ''), 120) as text_preview,
  d.media_url,
  d.hidden,
  count(r.id)::int as report_count,
  max(r.created_at) as last_reported_at,
  d.created_at
from public.dreams d
join public.reports r on r.dream_id = d.id
group by d.id
order by count(r.id) desc, max(r.created_at) desc;

revoke all on public.moderation_queue from anon, authenticated;

-- Authenticated (including anon-auth) users can upload only into a folder
-- named after their own user id (prevents one visitor from writing into
-- another visitor's space), and at most 5 files per hour.
drop policy if exists "authed users upload to own folder" on storage.objects;
create policy "authed users upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dream-media'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.media_uploaded_recently(auth.uid()) < 5
  );
