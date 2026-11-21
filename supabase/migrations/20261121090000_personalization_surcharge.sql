-- Regra única de adicional para pedidos personalizados da Nutrifit.
-- A configuração é administrável pelo painel autenticado e expõe ao site
-- somente o percentual/estado desta regra específica.

create table if not exists public.business_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id)
);

alter table public.business_settings enable row level security;

drop policy if exists business_settings_admin_access on public.business_settings;
create policy business_settings_admin_access
  on public.business_settings
  for all
  to authenticated
  using (is_admin_user())
  with check (is_admin_user());

drop policy if exists business_settings_public_personalization_read on public.business_settings;
create policy business_settings_public_personalization_read
  on public.business_settings
  for select
  to anon
  using (setting_key = 'personalization_surcharge_percent');

grant select on public.business_settings to anon;
grant select, insert, update, delete on public.business_settings to authenticated;

insert into public.business_settings (setting_key, setting_value)
values ('personalization_surcharge_percent', '{"percent":40,"enabled":true}'::jsonb)
on conflict (setting_key) do nothing;

alter table public.customer_orders
  add column if not exists is_personalized boolean not null default false,
  add column if not exists personalization_percent numeric(5,2) not null default 0,
  add column if not exists personalization_amount numeric(12,2) not null default 0;
