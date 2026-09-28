-- Soft-delete for trips and manifests. A deleted item is hidden
-- everywhere (personal page, detail page, handle checks) immediately,
-- but the row itself stays in the database — nothing is destroyed, and
-- there's no UI undo yet, just this column to restore from by hand.
-- Run once in the Supabase SQL Editor.

alter table trips add column if not exists deleted_at timestamptz;
alter table manifests add column if not exists deleted_at timestamptz;
