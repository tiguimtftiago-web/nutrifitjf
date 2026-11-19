-- Automatically create/synchronize planned production as an order is confirmed or edited.
create or replace function public.sync_order_production_batches_internal(p_order_id uuid)
returns integer
language plpgsql
security definer
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
  planned_count integer:=0;
begin
  select * into order_row from public.customer_orders where id=p_order_id for update;
  if not found then raise exception 'Pedido não encontrado: %',p_order_id; end if;

  if order_row.status in ('cancelado','cancelada','cancelled') then
    delete from public.production_batches where order_id=p_order_id and status='planejada';
    return 0;
  end if;
  if order_row.status not in ('confirmado','pago_recebido','em_preparo') then
    return 0;
  end if;
  if jsonb_typeof(coalesce(order_row.items,'[]'::jsonb))<>'array' then
    raise exception 'Itens do pedido em formato inválido: %',p_order_id;
  end if;

  perform public.refresh_order_inventory_requirements(p_order_id);

  for order_item in select value from jsonb_array_elements(coalesce(order_row.items,'[]'::jsonb))
  loop
    v_qty:=greatest(coalesce(nullif(order_item->>'quantity','')::numeric,1),0);
    if v_qty<=0 then continue; end if;
    v_recipe_id:=public.resolve_order_recipe_id(order_item->>'name',order_item->>'weight');
    if v_recipe_id is null then
      missing_items:=array_append(missing_items,coalesce(order_item->>'name','Item sem nome'));
    elsif not exists(select 1 from public.inventory_recipe_items where recipe_id=v_recipe_id) then
      missing_items:=array_append(missing_items,coalesce(order_item->>'name','Item')||' (ficha sem insumos)');
    end if;
  end loop;

  if coalesce(array_length(missing_items,1),0)>0
     or exists(select 1 from public.order_inventory_exceptions where order_id=p_order_id) then
    delete from public.production_batches where order_id=p_order_id and status='planejada';
    return 0;
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
          'Gerada/sincronizada automaticamente do pedido; consumo de matéria-prima calculado pelas regras de rendimento Nutrifit.')
        returning id into planned_id;
      else
        update public.production_batches
        set quantity=planned_qty
        where id=planned_id and quantity is distinct from planned_qty;
      end if;
      delete from public.production_batches
      where order_id=p_order_id and recipe_id=grouped_recipe.recipe_id
        and status='planejada' and id is distinct from planned_id;
      planned_count:=planned_count+1;
    else
      delete from public.production_batches
      where order_id=p_order_id and recipe_id=grouped_recipe.recipe_id and status='planejada';
    end if;
  end loop;

  delete from public.production_batches
  where order_id=p_order_id and status='planejada'
    and not (recipe_id=any(recipe_ids));

  return planned_count;
end;
$$;

create or replace function public.sync_order_production_batches_trigger()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
begin
  perform public.sync_order_production_batches_internal(new.id);
  return new;
end;
$$;

drop trigger if exists trg_sync_order_production_batches on public.customer_orders;
create trigger trg_sync_order_production_batches
after insert or update of status,items on public.customer_orders
for each row execute function public.sync_order_production_batches_trigger();

create or replace function public.create_production_from_order(p_order_id uuid)
returns integer
language plpgsql
security invoker
set search_path = 'pg_catalog','public'
as $$
begin
  if not public.is_admin_user() then raise exception 'Acesso administrativo necessário'; end if;
  return public.sync_order_production_batches_internal(p_order_id);
end;
$$;

revoke execute on function public.sync_order_production_batches_internal(uuid) from public,anon,authenticated;
revoke execute on function public.sync_order_production_batches_trigger() from public,anon,authenticated;
revoke execute on function public.create_production_from_order(uuid) from public,anon;
grant execute on function public.create_production_from_order(uuid) to authenticated;

notify pgrst,'reload schema';
