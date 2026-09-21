-- Step 6b: owner_handle — supports personal pages at /[handle] instead of
-- everything living at the site root. v1 still has one host (Kanom), but
-- the requirements doc's Purpose section always intended every Trip and
-- Manifest to carry an owner, so multi-host mode is possible later
-- without a rebuild. Run once in Supabase SQL Editor.

alter table trips add column if not exists owner_handle text not null default 'kanom';
alter table manifests add column if not exists owner_handle text not null default 'kanom';

create index if not exists trips_owner_idx on trips (owner_handle);
create index if not exists manifests_owner_idx on manifests (owner_handle);
