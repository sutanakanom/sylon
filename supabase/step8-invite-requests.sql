-- Step 8: "Ask for an invite" — the personal-page redesign adds a request
-- form for visitors who want in. This just records the request and emails
-- the admin(s); the admin still sends the actual invite from /admin.
-- Run once in Supabase SQL Editor.

create table if not exists invite_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  reason text,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table invite_requests enable row level security;
-- No public policies: only ever touched from server-side code using the
-- service-role key (the request form, and the admin panel).
