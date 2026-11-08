create table if not exists public.nutrifit360_meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  meal_name text not null check (char_length(trim(meal_name)) between 2 and 120),
  meal_type text not null check (meal_type in ('cafe_da_manha','almoco','jantar','lanche','outro')),
  consumed_at date not null default current_date,
  calories numeric(8,2) not null default 0 check (calories >= 0 and calories <= 10000),
  protein_g numeric(8,2) not null default 0 check (protein_g >= 0 and protein_g <= 1000),
  carbs_g numeric(8,2) not null default 0 check (carbs_g >= 0 and carbs_g <= 1000),
  fat_g numeric(8,2) not null default 0 check (fat_g >= 0 and fat_g <= 1000),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists nutrifit360_meal_entries_user_date_idx on public.nutrifit360_meal_entries (user_id, consumed_at desc, created_at desc);
alter table public.nutrifit360_meal_entries enable row level security;
drop policy if exists "Users can read own meal entries" on public.nutrifit360_meal_entries;
create policy "Users can read own meal entries" on public.nutrifit360_meal_entries for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own meal entries" on public.nutrifit360_meal_entries;
create policy "Users can insert own meal entries" on public.nutrifit360_meal_entries for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own meal entries" on public.nutrifit360_meal_entries;
create policy "Users can update own meal entries" on public.nutrifit360_meal_entries for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own meal entries" on public.nutrifit360_meal_entries;
create policy "Users can delete own meal entries" on public.nutrifit360_meal_entries for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.nutrifit360_meal_entries to authenticated;
revoke all on public.nutrifit360_meal_entries from anon;