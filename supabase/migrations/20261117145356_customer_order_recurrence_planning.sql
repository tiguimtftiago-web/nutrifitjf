create table if not exists public.customer_recurrence_plans (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null unique references public.customer_profiles(id) on delete cascade,
  cycle_type text not null check (cycle_type in ('weekly','fortnightly','monthly','custom')),
  cycle_days integer not null check (cycle_days between 1 and 365),
  planned_quantity integer not null default 0 check (planned_quantity >= 0),
  cycle_anchor_date date not null,
  next_order_date date not null,
  reminder_date date generated always as (next_order_date - 2) stored,
  status text not null default 'active' check (status in ('active','paused','contacted','confirmed','declined')),
  last_contact_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_recurrence_plans_reminder_idx
  on public.customer_recurrence_plans (reminder_date, status);
create index if not exists customer_recurrence_plans_customer_idx
  on public.customer_recurrence_plans (customer_profile_id);

alter table public.customer_recurrence_plans enable row level security;

drop policy if exists "admin manages customer recurrence plans" on public.customer_recurrence_plans;
create policy "admin manages customer recurrence plans"
  on public.customer_recurrence_plans
  for all
  to authenticated
  using ((select public.is_admin_user()))
  with check ((select public.is_admin_user()));

grant select, insert, update, delete on public.customer_recurrence_plans to authenticated;
