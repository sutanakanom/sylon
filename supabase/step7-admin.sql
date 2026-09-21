-- Step 7: admin-managed users. Adds a "deactivated" flag members can be
-- switched off with (blocks sign-in without deleting their history).
-- Who counts as "admin" is not a DB flag — it's the ADMIN_EMAILS env var
-- (comma-separated emails) checked in lib/admin.ts, since v1 only ever
-- has one admin (Kanom) and this avoids a chicken-and-egg bootstrap
-- problem of needing an admin to grant the first admin. Run once in
-- Supabase SQL Editor.

alter table members add column if not exists deactivated boolean not null default false;
