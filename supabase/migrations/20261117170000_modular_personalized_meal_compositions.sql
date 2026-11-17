-- Modular personalized meal compositions and immutable order snapshots.
-- Additive migration: existing orders, recipes, inventory and production batches are untouched.

create table if not exists public.meal_compositions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  category text not null default 'personalizada',
  default_yield_quantity numeric(12,3),
  default_yield_unit text not null default 'g',
  active boolean not null default true,
  validated boolean not null default false,
  source_order_id uuid references public.customer_orders(id) on delete set null,
  notes text,
  created_by uuid
);

create table if not exists public.meal_composition_components (
  id uuid primary key default gen_random_uuid(),
  composition_id uuid not null references public.meal_compositions(id) on delete cascade,
  sort_order integer not null default 0,
  recipe_id uuid references public.inventory_recipes(id) on delete restrict,
  item_id uuid references public.inventory_items(id) on delete restrict,
  component_name_snapshot text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit text not null,
  notes text,
  constraint meal_composition_component_source_check
    check ((recipe_id is not null and item_id is null) or (recipe_id is null and item_id is not null))
);

create table if not exists public.customer_order_meal_lines (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid not null references public.customer_orders(id) on delete restrict,
  source_composition_id uuid references public.meal_compositions(id) on delete set null,
  line_key text,
  meal_period text not null default 'outro' check (meal_period in ('almoco','jantar','outro')),
  display_name text not null,
  quantity integer not null check (quantity > 0),
  portion_total_quantity numeric(12,3),
  portion_unit text not null default 'g',
  validation_status text not null default 'pendente' check (validation_status in ('pendente','validada','bloqueada','produzida')),
  validation_notes text,
  composition_snapshot jsonb not null default '[]'::jsonb,
  order_item_snapshot jsonb not null default '{}'::jsonb
);

create table if not exists public.customer_order_meal_components (
  id uuid primary key default gen_random_uuid(),
  meal_line_id uuid not null references public.customer_order_meal_lines(id) on delete restrict,
  sort_order integer not null default 0,
  recipe_id uuid references public.inventory_recipes(id) on delete set null,
  item_id uuid references public.inventory_items(id) on delete set null,
  component_name_snapshot text not null,
  quantity_per_portion numeric(12,3) not null check (quantity_per_portion > 0),
  total_quantity numeric(14,3) not null check (total_quantity > 0),
  unit text not null,
  source_yield_quantity numeric(12,3),
  source_yield_unit text,
  notes text,
  constraint customer_order_meal_component_source_check
    check (recipe_id is not null or item_id is not null)
);

create index if not exists idx_meal_compositions_active on public.meal_compositions(active, name);
create index if not exists idx_meal_composition_components_composition on public.meal_composition_components(composition_id, sort_order);
create index if not exists idx_customer_order_meal_lines_order on public.customer_order_meal_lines(order_id);
create index if not exists idx_customer_order_meal_lines_status on public.customer_order_meal_lines(validation_status);
create index if not exists idx_customer_order_meal_components_line on public.customer_order_meal_components(meal_line_id, sort_order);

alter table public.meal_compositions enable row level security;
alter table public.meal_composition_components enable row level security;
alter table public.customer_order_meal_lines enable row level security;
alter table public.customer_order_meal_components enable row level security;

drop policy if exists admin_meal_compositions on public.meal_compositions;
create policy admin_meal_compositions on public.meal_compositions
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists admin_meal_composition_components on public.meal_composition_components;
create policy admin_meal_composition_components on public.meal_composition_components
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists admin_customer_order_meal_lines on public.customer_order_meal_lines;
create policy admin_customer_order_meal_lines on public.customer_order_meal_lines
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists admin_customer_order_meal_components on public.customer_order_meal_components;
create policy admin_customer_order_meal_components on public.customer_order_meal_components
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

grant select, insert, update, delete on public.meal_compositions to authenticated;
grant select, insert, update, delete on public.meal_composition_components to authenticated;
grant select, insert, update, delete on public.customer_order_meal_lines to authenticated;
grant select, insert, update, delete on public.customer_order_meal_components to authenticated;
