-- Nutrifit 360: registro de sessões de treino e exercícios.
create table if not exists public.nutrifit360_training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_name text not null check (char_length(trim(session_name)) between 2 and 120),
  training_type text not null default 'musculacao' check (training_type in ('musculacao','cardio','funcional','mobilidade','outro')),
  performed_at date not null default current_date,
  duration_minutes integer not null default 0 check (duration_minutes between 0 and 1440),
  exercises jsonb not null default '[]'::jsonb check (jsonb_typeof(exercises) = 'array' and jsonb_array_length(exercises) <= 50),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists nutrifit360_training_sessions_user_date_idx
  on public.nutrifit360_training_sessions (user_id, performed_at desc, created_at desc);
alter table public.nutrifit360_training_sessions enable row level security;
drop policy if exists "Users can view own training sessions" on public.nutrifit360_training_sessions;
create policy "Users can view own training sessions" on public.nutrifit360_training_sessions for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own training sessions" on public.nutrifit360_training_sessions;
create policy "Users can insert own training sessions" on public.nutrifit360_training_sessions for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own training sessions" on public.nutrifit360_training_sessions;
create policy "Users can update own training sessions" on public.nutrifit360_training_sessions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own training sessions" on public.nutrifit360_training_sessions;
create policy "Users can delete own training sessions" on public.nutrifit360_training_sessions for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.nutrifit360_training_sessions to authenticated;
revoke all on public.nutrifit360_training_sessions from anon;