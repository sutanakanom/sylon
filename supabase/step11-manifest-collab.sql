-- Step 11: reworks Manifest into a real collaborative pre-trip idea, per
-- the new SYLON-manifest-detail-export design — "known/rough/open"
-- anchors, a vote + availability + brainstorm workspace, a host-written
-- summary, and a gated convert-to-trip. Run once in Supabase SQL Editor.

alter table manifests add column if not exists purpose text;
alter table manifests add column if not exists decided_country text;
alter table manifests add column if not exists target_start_date date;
alter table manifests add column if not exists target_end_date date;
alter table manifests add column if not exists availability_windows jsonb not null default '[]'; -- ["Jan – Apr 2027", ...]
alter table manifests add column if not exists creator_summary_headline text;
alter table manifests add column if not exists creator_summary_body text;
alter table manifests add column if not exists creator_summary_tags jsonb not null default '[]';
alter table manifests add column if not exists creator_summary_updated_at timestamptz;

-- Each member's saved availability windows for one manifest — a signal,
-- not a commitment, per the design's own "your answers are signals" copy.
create table if not exists manifest_availability (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  windows jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  unique (manifest_id, member_id)
);

alter table manifest_availability enable row level security;

-- Real per-member likes on a brainstorm idea (a chat_messages row tagged
-- date_idea/place_idea) — reuses the existing chat feed rather than a
-- parallel "ideas" table, since an idea already is a tagged chat message.
create table if not exists chat_message_likes (
  id uuid primary key default gen_random_uuid(),
  chat_message_id uuid not null references chat_messages(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (chat_message_id, member_id)
);

alter table chat_message_likes enable row level security;
-- No public policies on either new table: server code with the
-- service-role key only, same pattern as the other member-only tables.

create index if not exists manifest_availability_manifest_idx on manifest_availability (manifest_id);
create index if not exists chat_message_likes_message_idx on chat_message_likes (chat_message_id);
