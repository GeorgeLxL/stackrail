-- StrantaDigital — contact messages schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Keep the table locked down with Row Level Security.
alter table public.contacts enable row level security;

-- No anon/authenticated policies are created on purpose:
--   * Inserts come from the contact API route using the SERVICE ROLE key,
--     which bypasses RLS. The anon key cannot read or write this table.
--   * The admin panel reads messages through the service role on the server
--     after the user has authenticated, so end users never query directly.
-- This means contact submissions can never be read by the public.

-- Helpful index for the admin list (newest first).
create index if not exists contacts_created_at_idx
  on public.contacts (created_at desc);

-- Admin users for the private panel (custom auth, not Supabase Auth).
-- Seeded with `npm run seed` — see scripts/seed.mjs.
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- RLS on with no public policies: only the service-role key (used by the
-- seed script and the server-side login check) can read or write this table.
alter table public.users enable row level security;

-- Team members. When at least one row exists, the landing page shows an
-- "About us" section. Managed from the admin panel (service role).
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  bio         text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.team_members enable row level security;
create index if not exists team_members_sort_idx
  on public.team_members (sort_order, created_at);

-- Editable site settings (singleton row). Holds the public contact details.
-- The landing page falls back to built-in defaults when a value is null.
create table if not exists public.site_settings (
  id               smallint primary key default 1,
  contact_email    text,
  contact_telegram text,
  updated_at       timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);
alter table public.site_settings enable row level security;
