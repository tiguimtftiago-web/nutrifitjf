-- Production batches refresh order requirements through their AFTER trigger.
-- Avoid calling the internal SECURITY DEFINER recalculation function directly from the invoker RPC.
create or replace function public.create_production_from_order(p_order_id uuid)
returns integer
language plpgsql
security invoker
set search_path = 'pg_catalog','public'
as $$
declare
  order_row public.customer_orders%rowtype;
  order_item jsonb;
  v_recipe_id uuid;
  v_qty numeric;
  missing_items text[]:=array[]::text[];
  grouped_recipe record;
  created_count integer:=0;
begin
  if not public.is_admin_user() then raise exception 'Acesso administrativo necessário'; end if;

  select * into order_row
  from public.customer_orders
  where id=p_order_id and status in ('confirmado','pago_recebido','em_preparo');
  if not found then raise exception 'O pedido não existe ou precisa estar confirmado, pago ou em preparo'; end if;

  if jsonb_typeof(coalesce(order_row.items,'[]'::jsonb))<>'array' then
    raise exception 'Os itens do pedido estão em formato inválido';
  end if;

  for order_item in select value from jsonb_array_elements(coalesce(order_row.items,'[]'::jsonb))
  loop
    v_qty:=greatest(coalesce(nullif(order_item->>'quantity','')::numeric,1),0);
    if v_qty<=0 then continue; end if;
    v_recipe_id:=public.resolve_order_recipe_id(order_item->>'name',order_item->>'weight');

    if v_recipe_id is null then
      missing_items:=array_append(missing_items,coalesce(order_item->>'name','Item sem nome')||
        case when nullif(order_item->>'weight','') is not null then ' — '||order_item->>'weight' else '' end);
    elsif not exists(select 1 from public.inventory_recipe_items where recipe_id=v_recipe_id) then
      missing_items:=array_append(missing_items,coalesce(order_item->>'name','Item')||' (ficha sem insumos)');
    end if;
  end loop;

  if coalesce(array_length(missing_items,1),0)>0 then
    raise exception 'Produção bloqueada. Vincule fichas técnicas para: %',
      array_to_string(array(select distinct unnest(missing_items)),'; ');
  end if;

  for grouped_recipe in
    select public.resolve_order_recipe_id(item.value->>'name',item.value->>'weight') as recipe_id,
           sum(greatest(coalesce(nullif(item.value->>'quantity','')::numeric,1),0)) as total_quantity
    from jsonb_array_elements(coalesce(order_row.items,'[]'::jsonb)) item(value)
    where greatest(coalesce(nullif(item.value->>'quantity','')::numeric,1),0)>0
    group by public.resolve_order_recipe_id(item.value->>'name',item.value->>'weight')
  loop
    if not exists(select 1 from public.production_batches where order_id=p_order_id and recipe_id=grouped_recipe.recipe_id) then
      insert into public.production_batches(order_id,recipe_id,quantity,status,notes)
      values(p_order_id,grouped_recipe.recipe_id,grouped_recipe.total_quantity,'planejada',
        'Gerada automaticamente do pedido; consumo em matéria-prima calculado pelas regras de rendimento Nutrifit.');
      created_count:=created_count+1;
    end if;
  end loop;

  -- AFTER INSERT on production_batches refreshes the requirements and exceptions.
  return created_count;
end;
$$;

notify pgrst, 'reload schema';
