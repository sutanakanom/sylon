-- Step 5: Manifests — chat feed, manifestors, conversion to a Trip.
-- Run once in Supabase SQL Editor.
--
-- Manifestors: the creator of a Manifest (or Trip, per the doc) plus
-- anyone they nominate. All manifestors have equal power, including the
-- ability to remove the original creator. If a Manifest somehow has zero
-- manifestors (e.g. the seed data inserted directly by SQL), the first
-- signed-in member to show up can claim it — see becomeManifestor().

create table if not exists manifestors (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('trip', 'manifest')),
  item_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (item_type, item_id, member_id)
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  tag text not null check (tag in ('date_idea', 'place_idea', 'im_in', 'note')),
  body text not null,
  created_at timestamptz not null default now()
);

alter table manifestors enable row level security;
alter table chat_messages enable row level security;
-- No public policies: server code with the service-role key only, same
-- pattern as the other member-only tables.

create index if not exists manifestors_item_idx on manifestors (item_type, item_id);
create index if not exists chat_messages_manifest_idx on chat_messages (manifest_id, created_at);
