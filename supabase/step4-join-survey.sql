-- Step 4: Joining and surveys. Run this once in Supabase SQL Editor.
-- No approval needed to join, per the requirements doc's decided-open-
-- question answer. Same survey questions for every Trip in v1 (exact
-- wording still just a reasonable default, not finalized).

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('trip', 'manifest')),
  item_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (item_type, item_id, member_id)
);

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  in_or_out text not null check (in_or_out in ('in', 'maybe', 'out')),
  conflicts text not null default '',
  needs text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, member_id)
);

alter table participants enable row level security;
alter table survey_responses enable row level security;
-- No public policies: server code with the service-role key only, same
-- pattern as comments/follows.

create index if not exists participants_item_idx on participants (item_type, item_id);
