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
  to anon, authenticated
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

-- Preserva os campos de personalização no caminho atômico do desconto de boas-vindas do Clube.
create or replace function public.create_customer_order_with_clube_welcome_coupon(
  p_order jsonb,
  p_profile_id uuid,
  p_whatsapp text default null::text,
  p_email text default null::text
)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $function$
declare
  locked_profile_id uuid;
  saved_order public.customer_orders%rowtype;
  clean_phone text := regexp_replace(coalesce(p_whatsapp, ''), '[^0-9]', '', 'g');
  clean_email text := lower(btrim(coalesce(p_email, '')));
begin
  if p_profile_id is null or (clean_phone = '' and clean_email = '') then
    raise exception using errcode = '22023', message = 'Identificação do Clube inválida.';
  end if;

  select cp.id into locked_profile_id
  from public.customer_profiles cp
  where cp.id = p_profile_id
    and cp.nutrifit_club_member = true
    and cp.coupon_used = false
    and (
      (clean_email <> '' and lower(btrim(coalesce(cp.email, ''))) = clean_email)
      or
      (clean_phone <> '' and regexp_replace(coalesce(cp.whatsapp, ''), '[^0-9]', '', 'g') = clean_phone)
    )
  for update;

  if locked_profile_id is null then
    raise exception using errcode = 'P0001', message = 'O benefício de boas-vindas já foi utilizado ou não está disponível.';
  end if;

  insert into public.customer_orders (
    customer_name, whatsapp, email, customer_profile_id,
    items, item_count, subtotal, delivery_fee, total, discount,
    cep, neighborhood, status, acquisition_source, acquisition_campaign,
    acquisition_medium, acquisition_content, notes, street, address_number,
    address_complement, city, state, address_reference,
    is_personalized, personalization_percent, personalization_amount
  ) values (
    p_order->>'customer_name',
    nullif(p_order->>'whatsapp', ''),
    nullif(p_order->>'email', ''),
    locked_profile_id,
    coalesce(p_order->'items', '[]'::jsonb),
    coalesce((p_order->>'item_count')::integer, 0),
    coalesce((p_order->>'subtotal')::numeric, 0),
    coalesce((p_order->>'delivery_fee')::numeric, 0),
    coalesce((p_order->>'total')::numeric, 0),
    coalesce((p_order->>'discount')::numeric, 0),
    nullif(p_order->>'cep', ''),
    nullif(p_order->>'neighborhood', ''),
    coalesce(nullif(p_order->>'status', ''), 'enviado_whatsapp'),
    coalesce(nullif(p_order->>'acquisition_source', ''), 'direct'),
    nullif(p_order->>'acquisition_campaign', ''),
    nullif(p_order->>'acquisition_medium', ''),
    nullif(p_order->>'acquisition_content', ''),
    nullif(p_order->>'notes', ''),
    nullif(p_order->>'street', ''),
    nullif(p_order->>'address_number', ''),
    nullif(p_order->>'address_complement', ''),
    nullif(p_order->>'city', ''),
    nullif(p_order->>'state', ''),
    nullif(p_order->>'address_reference', ''),
    coalesce((p_order->>'is_personalized')::boolean, false),
    coalesce((p_order->>'personalization_percent')::numeric, 0),
    coalesce((p_order->>'personalization_amount')::numeric, 0)
  )
  returning * into saved_order;

  update public.customer_profiles
  set coupon_used = true
  where id = locked_profile_id and coupon_used = false;

  if not found then
    raise exception using errcode = 'P0001', message = 'Não foi possível consumir o benefício do Clube.';
  end if;

  return jsonb_build_object('id', saved_order.id);
end;
$function$;
