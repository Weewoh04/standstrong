-- StandStrong community schema
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create or replace function public.community_contains_nsfw(input_text text)
returns boolean
language plpgsql
as $$
declare
  normalized text;
  patterns text[];
  p text;
begin
  if input_text is null then
    return false;
  end if;

  normalized := lower(input_text);
  patterns := array[
    'porn', 'xxx', 'nude', 'nsfw', 'onlyfans', 'camgirl', 'cam boy',
    'escort', 'fetish', 'anal', 'blowjob', 'handjob', 'cumshot',
    'rape', 'incest', 'loli', 'cp'
  ];

  foreach p in array patterns loop
    if normalized like '%' || p || '%' then
      return true;
    end if;
  end loop;

  return false;
end;
$$;

create or replace function public.community_reject_nsfw()
returns trigger
language plpgsql
as $$
declare
  combined text;
begin
  combined := coalesce(new.title, '') || ' ' || coalesce(new.content, '') || ' ' || coalesce(new.body, '');

  if public.community_contains_nsfw(combined) then
    raise exception 'NSFW_BLOCKED';
  end if;

  return new;
end;
$$;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  post_type text not null check (post_type in ('story', 'discussion')),
  title text not null check (char_length(title) between 3 and 120),
  content text not null check (char_length(content) between 5 and 4000),
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 2000),
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 500),
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

create table if not exists public.community_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.community_comments(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 500),
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_id)
);

drop trigger if exists trg_community_posts_nsfw on public.community_posts;
create trigger trg_community_posts_nsfw
before insert or update on public.community_posts
for each row execute function public.community_reject_nsfw();

drop trigger if exists trg_community_comments_nsfw on public.community_comments;
create trigger trg_community_comments_nsfw
before insert or update on public.community_comments
for each row execute function public.community_reject_nsfw();

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_comment_reports enable row level security;

create policy if not exists community_posts_public_read
on public.community_posts
for select
to anon, authenticated
using (status = 'published');

create policy if not exists community_comments_public_read
on public.community_comments
for select
to anon, authenticated
using (status = 'published');

create policy if not exists community_posts_insert_own
on public.community_posts
for insert
to authenticated
with check (author_id = auth.uid());

create policy if not exists community_comments_insert_own
on public.community_comments
for insert
to authenticated
with check (author_id = auth.uid());

create policy if not exists community_posts_update_own
on public.community_posts
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy if not exists community_posts_delete_own
on public.community_posts
for delete
to authenticated
using (author_id = auth.uid());

create policy if not exists community_comments_update_own
on public.community_comments
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy if not exists community_comments_delete_own
on public.community_comments
for delete
to authenticated
using (author_id = auth.uid());

create policy if not exists community_reports_insert_own
on public.community_reports
for insert
to authenticated
with check (reporter_id = auth.uid());

create policy if not exists community_comment_reports_insert_own
on public.community_comment_reports
for insert
to authenticated
with check (reporter_id = auth.uid());

create index if not exists idx_community_posts_created_at on public.community_posts(created_at desc);
create index if not exists idx_community_comments_post_id on public.community_comments(post_id);
create index if not exists idx_community_comments_created_at on public.community_comments(created_at desc);