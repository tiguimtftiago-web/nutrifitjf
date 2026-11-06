create or replace function public.create_customer_order_with_clube_welcome_coupon(
  p_order jsonb,
  p_profile_id uuid,
  p_whatsapp text default null,
  p_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
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

  select cp.id
    into locked_profile_id
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
    address_complement, city, state, address_reference
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
    nullif(p_order->>'address_reference', '')
  )
  returning * into saved_order;

  update public.customer_profiles
  set coupon_used = true
  where id = locked_profile_id
    and coupon_used = false;

  if not found then
    raise exception using errcode = 'P0001', message = 'Não foi possível consumir o benefício do Clube.';
  end if;

  return jsonb_build_object('id', saved_order.id);
end;
$function$;

revoke all on function public.create_customer_order_with_clube_welcome_coupon(jsonb, uuid, text, text) from public, anon, authenticated;
grant execute on function public.create_customer_order_with_clube_welcome_coupon(jsonb, uuid, text, text) to service_role;
