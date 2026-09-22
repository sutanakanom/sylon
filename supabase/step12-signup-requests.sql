-- Step 12: public "Sign up" CTA on the landing page — visitors leave an
-- email address, an admin reviews it in /admin and approves (which sends
-- an invite code the same way invite_requests approval does) or declines.
-- Run once in Supabase SQL Editor.

create table if not exists signup_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table signup_requests enable row level security;
-- No public policies: only ever touched from server-side code using the
-- service-role key (the sign-up form, and the admin panel).
