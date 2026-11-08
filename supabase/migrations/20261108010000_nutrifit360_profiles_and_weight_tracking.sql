-- Nutrifit 360: private member profile and weight history.
-- Every row is scoped to auth.uid(); no access is granted to anonymous visitors.
create table if not exists public.nutrifit360_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  primary_goal text not null default 'bem_estar'
    check (primary_goal in ('emagrecimento','hipertrofia','condicionamento','bem_estar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrifit360_weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg >= 20 and weight_kg <= 500),
  measured_at date not null default current_date,
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists nutrifit360_weight_user_date_idx
  on public.nutrifit360_weight_entries (user_id, measured_at desc);

alter table public.nutrifit360_profiles enable row level security;
alter table public.nutrifit360_weight_entries enable row level security;

drop policy if exists nutrifit360_profiles_select_own on public.nutrifit360_profiles;
create policy nutrifit360_profiles_select_own on public.nutrifit360_profiles
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists nutrifit360_profiles_insert_own on public.nutrifit360_profiles;
create policy nutrifit360_profiles_insert_own on public.nutrifit360_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists nutrifit360_profiles_update_own on public.nutrifit360_profiles;
create policy nutrifit360_profiles_update_own on public.nutrifit360_profiles
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists nutrifit360_weight_select_own on public.nutrifit360_weight_entries;
create policy nutrifit360_weight_select_own on public.nutrifit360_weight_entries
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists nutrifit360_weight_insert_own on public.nutrifit360_weight_entries;
create policy nutrifit360_weight_insert_own on public.nutrifit360_weight_entries
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists nutrifit360_weight_update_own on public.nutrifit360_weight_entries;
create policy nutrifit360_weight_update_own on public.nutrifit360_weight_entries
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists nutrifit360_weight_delete_own on public.nutrifit360_weight_entries;
create policy nutrifit360_weight_delete_own on public.nutrifit360_weight_entries
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.nutrifit360_profiles from anon;
revoke all on public.nutrifit360_weight_entries from anon;
grant select, insert, update on public.nutrifit360_profiles to authenticated;
grant select, insert, update, delete on public.nutrifit360_weight_entries to authenticated;
