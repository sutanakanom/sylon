-- Step 9: real per-member ownership. Each member gets their own handle —
-- the slug their personal page lives at (/[handle]) and that new trips
-- and manifests they create are filed under — instead of every plan
-- being hardcoded to the single literal owner_handle "kanom". A member's
-- system-admin capability (managing users in /admin, from ADMIN_EMAILS)
-- stays separate from this: admin still isn't a DB flag, and having a
-- handle is what makes someone a page owner/host, not being an admin.
-- Run once in Supabase SQL Editor.

alter table members add column if not exists handle text unique;

-- Backfill: the existing single host keeps their existing handle so
-- current /kanom links and the existing owner_handle="kanom" rows on
-- trips/manifests keep working without needing to touch those tables.
update members set handle = 'kanom'
  where email = 'sutana.kanom@gmail.com' and handle is null;

create index if not exists members_handle_idx on members (handle);
