-- Step 10: real content for the redesigned trip/manifest detail pages —
-- the readiness meter, checklist, "going with"/"main event", a quote-style
-- note, the manifest's "signs of life" list, its reality-fund meter, and
-- a votes table so country voting can be a real click-to-vote action
-- instead of a static count. Run once in Supabase SQL Editor.

-- Trips ---------------------------------------------------------------
alter table trips add column if not exists companion_name text;
alter table trips add column if not exists main_event text;
alter table trips add column if not exists checklist jsonb not null default '[]'; -- [{ label, done }]
alter table trips add column if not exists readiness_percent int;
alter table trips add column if not exists note_quote text;
alter table trips add column if not exists note_author text;

-- Manifests -------------------------------------------------------------
alter table manifests add column if not exists signals jsonb not null default '[]'; -- [{ title, body }]
alter table manifests add column if not exists reality_fund_percent int;
alter table manifests add column if not exists note_quote text;
alter table manifests add column if not exists note_author text;

-- Per-member country votes -----------------------------------------------
-- One vote per member per manifest, so a vote can be cast, changed, or
-- (implicitly) removed by voting again. manifests.country_votes stays the
-- source of truth for *display* (the option list + counts) — voteCountry()
-- recomputes its counts from this table after every vote, so existing
-- reads (getPublicItems, getItemBySlug) don't need to change.
create table if not exists manifest_votes (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  country text not null,
  created_at timestamptz not null default now(),
  unique (manifest_id, member_id)
);

alter table manifest_votes enable row level security;
-- No public policies: server code with the service-role key only, same
-- pattern as the other member-only tables.

create index if not exists manifest_votes_manifest_idx on manifest_votes (manifest_id);
