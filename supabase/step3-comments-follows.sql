-- Step 3: Comments and following. Run this once in Supabase SQL Editor.
-- Per the requirements doc's rough-view table, comments are member-only —
-- even on a public Trip/Manifest, a visitor without an account doesn't
-- see them. Reads and writes both go through server code using the
-- service-role key (same pattern as members/invite_codes), so RLS here
-- just needs to block the anon key from touching these tables at all.

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('trip', 'manifest')),
  item_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('trip', 'manifest')),
  item_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (item_type, item_id, member_id)
);

alter table comments enable row level security;
alter table follows enable row level security;
-- No public policies: only server code with the service-role key reads
-- or writes these, same as members/invite_codes.

create index if not exists comments_item_idx on comments (item_type, item_id, created_at);
create index if not exists follows_item_idx on follows (item_type, item_id);
