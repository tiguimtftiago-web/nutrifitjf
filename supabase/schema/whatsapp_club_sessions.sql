-- Internal state for the official Meta WhatsApp Club registration flow.
-- Run with an administrative database role. This table is intentionally not accessible
-- to anon/authenticated clients; the Edge Function accesses it using service_role.
create table if not exists public.whatsapp_club_sessions (
  phone text primary key,
  display_name text,
  step text not null default 'idle'
    check (step in ('idle','awaiting_registration_consent','awaiting_name','awaiting_email','awaiting_marketing_consent','completed','stopped')),
  customer_name text,
  email text,
  registration_consent boolean not null default false,
  marketing_consent boolean not null default false,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  last_message_id text
);
alter table public.whatsapp_club_sessions enable row level security;
revoke all on public.whatsapp_club_sessions from anon, authenticated;
grant all on public.whatsapp_club_sessions to service_role;
