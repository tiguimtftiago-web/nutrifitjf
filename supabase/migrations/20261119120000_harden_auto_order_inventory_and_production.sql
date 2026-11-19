-- Consolidate automatic production planning behind one trusted, idempotent function.
-- The function is callable by admin users only; service-role order intake remains trusted.
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
  if not public.is_admin_user() and coalesce(auth.jwt()->>'role','')<>'service_role' then
    raise exception 'Acesso administrativo necessário para sincronizar produção.';
  end if;

  select * into order_row from public.customer_orders where id=p_order_id for update;
  if not found then raise exception 'Pedido não encontrado: %',p_order_id; end if;

  if order_row.status in ('cancelado','cancelada','cancelled') then
    if order_row.inventory_consumed_at is null then
      delete from public.production_batches where order_id=p_order_id and status='planejada';
    end if;
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
    if order_row.inventory_consumed_at is null then
      delete from public.production_batches where order_id=p_order_id and status='planejada';
    end if;
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
          'Produção sincronizada automaticamente com o pedido; consumo cru calculado com rendimento Nutrifit.')
        returning id into planned_id;
      else
        update public.production_batches
        set quantity=planned_qty,
            notes=concat_ws(E'\n',nullif(notes,''),'Quantidade sincronizada automaticamente com o pedido em '||now()::text)
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

  if order_row.inventory_consumed_at is null then
    delete from public.production_batches
    where order_id=p_order_id and status='planejada'
      and not (recipe_id=any(recipe_ids));
  end if;

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
  if not public.is_admin_user() and coalesce(auth.jwt()->>'role','')<>'service_role' then
    return new;
  end if;
  perform public.sync_order_production_batches_internal(new.id);
  return new;
end;
$$;

create or replace function public.sync_order_inventory_requirements()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
begin
  if new.status in ('enviado_whatsapp','confirmado','pago_recebido','em_preparo','saiu_entrega') then
    perform public.refresh_order_inventory_requirements(new.id);
  elsif new.status='cancelado' and new.inventory_consumed_at is null then
    delete from public.order_inventory_requirements where order_id=new.id;
    delete from public.order_inventory_exceptions where order_id=new.id;
  end if;
  return new;
end;
$$;

create or replace function public.consume_order_inventory_on_preparation()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  req record;
  v_order_code text;
begin
  if not public.is_admin_user() and coalesce(auth.jwt()->>'role','')<>'service_role' then
    raise exception 'Acesso administrativo necessário para iniciar a produção.';
  end if;

  if tg_op='UPDATE'
     and old.inventory_consumed_at is not null
     and new.items is distinct from old.items then
    raise exception 'Pedido já teve baixa de estoque. Para alterar itens ou quantidades, registre um ajuste/devolução vinculado ao pedido.';
  end if;

  if new.status<>'em_preparo' or new.inventory_consumed_at is not null then
    return new;
  end if;

  perform public.refresh_order_inventory_requirements(new.id);

  if exists(select 1 from public.order_inventory_exceptions where order_id=new.id) then
    raise exception 'Baixa bloqueada: existem itens sem ficha técnica vinculada. Corrija as composições antes de iniciar a produção.';
  end if;

  if not exists(select 1 from public.order_inventory_requirements where order_id=new.id) then
    raise exception 'Baixa bloqueada: o pedido não possui requisitos de estoque calculados.';
  end if;

  select order_code into v_order_code from public.customer_orders where id=new.id;

  for req in
    select r.item_id,r.remaining_quantity,i.name,i.unit,i.current_quantity,i.average_cost
    from public.order_inventory_requirements r
    join public.inventory_items i on i.id=r.item_id
    where r.order_id=new.id and r.remaining_quantity>0
    order by r.item_id
  loop
    if req.current_quantity<req.remaining_quantity then
      raise exception 'Estoque insuficiente para iniciar o pedido %: % precisa de % % e há % % disponível.',
        coalesce(v_order_code,new.id::text),req.name,req.remaining_quantity,req.unit,req.current_quantity,req.unit;
    end if;

    insert into public.inventory_movements
      (item_id,movement_type,quantity,unit_cost,reason,reference_type,reference_id)
    values
      (req.item_id,'consumo',req.remaining_quantity,req.average_cost,
       format('Baixa automática ao iniciar o preparo do pedido %s. Matéria-prima crua calculada após aplicação do rendimento; quantidade já consumida anteriormente foi conciliada.',
         coalesce(v_order_code,new.id::text)),
       'customer_order',new.id::text);
  end loop;

  update public.customer_orders
  set inventory_consumed_at=now()
  where id=new.id and inventory_consumed_at is null;

  return new;
end;
$$;

revoke execute on function public.sync_order_production_batches_internal(uuid) from public,anon;
grant execute on function public.sync_order_production_batches_internal(uuid) to authenticated;
revoke execute on function public.ensure_production_batches_for_order(uuid) from public,anon,authenticated;
revoke execute on function public.sync_order_production_batches_trigger() from public,anon,authenticated;
revoke execute on function public.consume_order_inventory_on_preparation() from public,anon,authenticated;
revoke execute on function public.sync_order_inventory_requirements() from public,anon,authenticated;

notify pgrst,'reload schema';
