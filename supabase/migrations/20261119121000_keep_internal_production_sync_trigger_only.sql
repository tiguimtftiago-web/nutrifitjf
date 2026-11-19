-- Keep the internal SECURITY DEFINER synchronizer trigger-only.
-- The admin RPC performs the same idempotent batch sync as SECURITY INVOKER.
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
  completed_qty numeric;
  planned_id uuid;
  planned_qty numeric;
  recipe_ids uuid[]:=array[]::uuid[];
  changed_count integer:=0;
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
    recipe_ids:=array_append(recipe_ids,grouped_recipe.recipe_id);
    select coalesce(sum(quantity),0) into completed_qty
    from public.production_batches
    where order_id=p_order_id and recipe_id=grouped_recipe.recipe_id and status='concluida';

    planned_id:=null;
    select id into planned_id
    from public.production_batches
    where order_id=p_order_id and recipe_id=grouped_recipe.recipe_id and status='planejada'
    order by created_at limit 1 for update;

    planned_qty:=greatest(grouped_recipe.total_quantity-completed_qty,0);
    if planned_qty>0 then
      if planned_id is null then
        insert into public.production_batches(order_id,recipe_id,quantity,status,notes)
        values(p_order_id,grouped_recipe.recipe_id,planned_qty,'planejada',
          'Produção sincronizada com o pedido; consumo cru calculado com rendimento Nutrifit.')
        returning id into planned_id;
        changed_count:=changed_count+1;
      else
        update public.production_batches
        set quantity=planned_qty,
            notes=concat_ws(E'\n',nullif(notes,''),'Quantidade sincronizada com o pedido em '||now()::text)
        where id=planned_id and quantity is distinct from planned_qty;
        if found then changed_count:=changed_count+1; end if;
      end if;
      delete from public.production_batches
      where order_id=p_order_id and recipe_id=grouped_recipe.recipe_id
        and status='planejada' and id is distinct from planned_id;
    else
      delete from public.production_batches
      where order_id=p_order_id and recipe_id=grouped_recipe.recipe_id and status='planejada';
    end if;
  end loop;

  if coalesce(array_length(recipe_ids,1),0)=0 then
    raise exception 'Produção bloqueada: o pedido não possui itens com ficha técnica vinculada.';
  end if;

  if order_row.inventory_consumed_at is null then
    delete from public.production_batches
    where order_id=p_order_id and status='planejada'
      and not (recipe_id=any(recipe_ids));
  end if;

  return changed_count;
end;
$$;

revoke execute on function public.sync_order_production_batches_internal(uuid) from public,anon,authenticated;
grant execute on function public.create_production_from_order(uuid) to authenticated;
notify pgrst,'reload schema';
