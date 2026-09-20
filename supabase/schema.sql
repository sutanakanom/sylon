-- SYLON schema — run this once in Supabase (SQL Editor) after you create
-- your project. Matches lib/types.ts. Row Level Security (RLS) is enabled
-- everywhere; public rows are readable by anyone, invite-only rows are not
-- exposed yet (that arrives with build-order step 2, invites + login).

create extension if not exists "pgcrypto";

-- Trips: solid plans with real dates.
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status text not null check (status in ('planning', 'confirmed', 'completed', 'cancelled')),
  visibility text not null check (visibility in ('public', 'invite-only')) default 'invite-only',
  rough_date text not null,
  countries text[] not null default '{}',
  legs jsonb not null default '[]', -- [{ place, startDate, endDate }]
  summary text not null default '',
  member_count int not null default 1,
  created_at timestamptz not null default now()
);

-- Manifests: open brainstorms, not yet a solid plan.
create table if not exists manifests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status text not null check (status in ('open', 'converted', 'dropped')),
  visibility text not null check (visibility in ('public', 'invite-only')) default 'invite-only',
  rough_date text not null,
  country_votes jsonb not null default '[]', -- [{ country, votes }]
  summary text not null default '',
  member_count int not null default 1,
  created_at timestamptz not null default now()
);

alter table trips enable row level security;
alter table manifests enable row level security;

-- v1: anyone can read public rows. Invite-only rows aren't served to the
-- public API yet — that policy tightens once accounts/invites exist.
create policy "Public trips are readable by anyone"
  on trips for select
  using (visibility = 'public');

create policy "Public manifests are readable by anyone"
  on manifests for select
  using (visibility = 'public');

-- ---------------------------------------------------------------------
-- Below: tables for build-order step 2 (invites + email login). Not yet
-- wired into the app — created now so the schema doesn't need a second
-- migration pass later.
-- ---------------------------------------------------------------------

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  photo_url text,
  instagram_handle text,
  created_at timestamptz not null default now()
);

create table if not exists invite_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text unique not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz
);

alter table members enable row level security;
alter table invite_codes enable row level security;
-- No public policies on members/invite_codes yet: these are only ever
-- touched from server-side code using the service-role key, never the
-- browser anon key.
