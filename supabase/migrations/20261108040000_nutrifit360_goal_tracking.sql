create table if not exists public.nutrifit360_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 120),
  goal_type text not null check (goal_type in ('weight','workouts','custom')),
  starting_value numeric(10,2),
  target_value numeric(10,2),
  unit text not null default '',
  target_date date,
  status text not null default 'active' check (status in ('active','completed','paused')),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_values_nonnegative check ((starting_value is null or starting_value >= 0) and (target_value is null or target_value >= 0)),
  constraint goals_required_targets check (
    (goal_type = 'weight' and starting_value is not null and target_value is not null and starting_value > 0 and target_value > 0)
    or (goal_type = 'workouts' and target_value is not null and target_value between 1 and 14)
    or goal_type = 'custom'
  )
);
create index if not exists nutrifit360_goals_user_status_created_idx on public.nutrifit360_goals(user_id, status, created_at desc);
alter table public.nutrifit360_goals enable row level security;
drop policy if exists "Users can view own goals" on public.nutrifit360_goals;
create policy "Users can view own goals" on public.nutrifit360_goals for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create own goals" on public.nutrifit360_goals;
create policy "Users can create own goals" on public.nutrifit360_goals for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own goals" on public.nutrifit360_goals;
create policy "Users can update own goals" on public.nutrifit360_goals for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own goals" on public.nutrifit360_goals;
create policy "Users can delete own goals" on public.nutrifit360_goals for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.nutrifit360_goals to authenticated;
revoke all on public.nutrifit360_goals from anon;