-- Nutrifit 360 food composition library and meal ingredient snapshots.
-- Values are stored per 100 g and include preparation state and source attribution.

create table if not exists public.nutrifit360_foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'outros',
  preparation text not null,
  calories_per_100g numeric(8,2) not null check (calories_per_100g >= 0),
  protein_g_per_100g numeric(8,2) not null check (protein_g_per_100g >= 0),
  carbs_g_per_100g numeric(8,2) not null check (carbs_g_per_100g >= 0),
  fat_g_per_100g numeric(8,2) not null check (fat_g_per_100g >= 0),
  source_name text not null,
  source_url text,
  source_reference text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name, preparation)
);

alter table public.nutrifit360_foods enable row level security;

drop policy if exists "Authenticated users can read active nutrition foods" on public.nutrifit360_foods;
create policy "Authenticated users can read active nutrition foods"
  on public.nutrifit360_foods for select to authenticated using (active = true);

drop policy if exists "Admins manage nutrition foods" on public.nutrifit360_foods;
create policy "Admins manage nutrition foods"
  on public.nutrifit360_foods for all to authenticated
  using (is_admin_user()) with check (is_admin_user());

grant select on public.nutrifit360_foods to authenticated;
grant select, insert, update, delete on public.nutrifit360_meal_entries to authenticated;

alter table public.nutrifit360_meal_entries
  add column if not exists foods jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'nutrifit360_meal_entries_foods_array_check'
  ) then
    alter table public.nutrifit360_meal_entries
      add constraint nutrifit360_meal_entries_foods_array_check
      check (jsonb_typeof(foods) = 'array' and jsonb_array_length(foods) <= 30);
  end if;
end $$;

insert into public.nutrifit360_foods
  (name, category, preparation, calories_per_100g, protein_g_per_100g,
   carbs_g_per_100g, fat_g_per_100g, source_name, source_url, source_reference)
values
  ('Peito de frango sem pele', 'proteina', 'grelhado', 159, 32, 0, 2.5,
   'TACO 4ª edição — NEPA/UNICAMP',
   'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf',
   'Alimento 410; valores por 100 g da parte comestível'),
  ('Batata inglesa', 'carboidrato', 'cozida sem óleo', 52, 1.2, 11.9, 0,
   'TACO 4ª edição — NEPA/UNICAMP',
   'https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf',
   'Alimento 91; valores por 100 g da parte comestível')
on conflict (name, preparation) do update set
  calories_per_100g = excluded.calories_per_100g,
  protein_g_per_100g = excluded.protein_g_per_100g,
  carbs_g_per_100g = excluded.carbs_g_per_100g,
  fat_g_per_100g = excluded.fat_g_per_100g,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  source_reference = excluded.source_reference,
  active = true;
