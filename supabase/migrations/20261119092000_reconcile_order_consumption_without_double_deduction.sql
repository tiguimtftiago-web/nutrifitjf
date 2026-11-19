-- Reconcile order-level consumption with existing manual movements and completed batches.
alter table public.order_inventory_requirements
  add column if not exists consumed_quantity numeric(14,3) not null default 0,
  add column if not exists remaining_quantity numeric(14,3) not null default 0;

create or replace function public.refresh_order_inventory_requirements(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  order_row public.customer_orders%rowtype;
  order_item jsonb;
  v_recipe_id uuid;
  recipe_item record;
  order_qty numeric;
  ready_qty numeric;
  raw_qty numeric;
  v_yield_rate numeric;
begin
  select * into order_row from public.customer_orders where id=p_order_id;
  if not found then raise exception 'Pedido não encontrado: %',p_order_id; end if;

  delete from public.order_inventory_requirements where order_id=p_order_id;
  delete from public.order_inventory_exceptions where order_id=p_order_id;

  if jsonb_typeof(coalesce(order_row.items,'[]'::jsonb))<>'array' then
    raise exception 'Itens do pedido em formato inválido: %',p_order_id;
  end if;

  for order_item in select value from jsonb_array_elements(coalesce(order_row.items,'[]'::jsonb))
  loop
    order_qty:=greatest(coalesce(nullif(order_item->>'quantity','')::numeric,1),0);
    if order_qty<=0 then continue; end if;

    v_recipe_id:=public.resolve_order_recipe_id(order_item->>'name',order_item->>'weight');
    if v_recipe_id is null then
      insert into public.order_inventory_exceptions(order_id,order_item_snapshot,issue)
      values(p_order_id,order_item,'Produto do pedido sem ficha técnica vinculada ou com correspondência ambígua.')
      on conflict(order_id,order_item_snapshot) do update set issue=excluded.issue;
      continue;
    end if;

    for recipe_item in
      select ri.item_id,ri.quantity,coalesce(yr.yield_rate,1) as yield_rate
      from public.inventory_recipe_items ri
      left join public.inventory_yield_rules yr on yr.item_id=ri.item_id and yr.active=true
      where ri.recipe_id=v_recipe_id
      order by ri.item_id
    loop
      ready_qty:=recipe_item.quantity*order_qty;
      v_yield_rate:=recipe_item.yield_rate;
      raw_qty:=public.raw_quantity_for_inventory_item(recipe_item.item_id,ready_qty);

      insert into public.order_inventory_requirements
        (order_id,recipe_id,item_id,required_quantity,finished_quantity,yield_rate,consumed_quantity,remaining_quantity)
      values(p_order_id,v_recipe_id,recipe_item.item_id,raw_qty,ready_qty,v_yield_rate,0,raw_qty)
      on conflict(order_id,item_id) do update
        set recipe_id=excluded.recipe_id,
            required_quantity=public.order_inventory_requirements.required_quantity+excluded.required_quantity,
            finished_quantity=public.order_inventory_requirements.finished_quantity+excluded.finished_quantity,
            yield_rate=excluded.yield_rate;
    end loop;
  end loop;

  update public.order_inventory_requirements req
  set consumed_quantity=coalesce((
        select sum(m.quantity)
        from public.inventory_movements m
        where m.item_id=req.item_id
          and m.movement_type='consumo'
          and (
            (m.reference_type in ('order','customer_order') and m.reference_id=p_order_id::text)
            or
            (m.reference_type='production_batch' and exists(
              select 1 from public.production_batches pb
              where pb.id::text=m.reference_id and pb.order_id=p_order_id
            ))
          )
      ),0),
      remaining_quantity=greatest(req.required_quantity-coalesce((
        select sum(m.quantity)
        from public.inventory_movements m
        where m.item_id=req.item_id
          and m.movement_type='consumo'
          and (
            (m.reference_type in ('order','customer_order') and m.reference_id=p_order_id::text)
            or
            (m.reference_type='production_batch' and exists(
              select 1 from public.production_batches pb
              where pb.id::text=m.reference_id and pb.order_id=p_order_id
            ))
          )
      ),0),0)
  where req.order_id=p_order_id;
end;
$$;

create or replace function public.consume_production_stock()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  recipe_row public.inventory_recipes%rowtype;
  recipe_item record;
  v_ready_qty numeric;
  v_raw_qty numeric;
  v_order_target_raw numeric;
  v_already_consumed numeric;
  v_outstanding numeric;
  ingredient_count integer;
begin
  if new.status='concluida' and not coalesce(new.stock_consumed,false) then
    if new.quantity is null or new.quantity<=0 then
      raise exception 'Produção não pode ser concluída: quantidade deve ser maior que zero.';
    end if;
    if new.recipe_id is null then
      raise exception 'Produção não pode ser concluída sem ficha técnica vinculada.';
    end if;

    select * into recipe_row from public.inventory_recipes where id=new.recipe_id for share;
    if not found or not recipe_row.active then
      raise exception 'Produção não pode ser concluída: ficha técnica inexistente ou inativa.';
    end if;

    select count(*) into ingredient_count from public.inventory_recipe_items where recipe_id=new.recipe_id;
    if ingredient_count=0 then raise exception 'Produção não pode ser concluída: ficha técnica sem insumos.'; end if;

    -- Preserve the raw-ingredient usage per batch for auditability.
    for recipe_item in
      select ri.item_id,sum(ri.quantity) as ready_per_unit,
             i.name,i.active,coalesce(yr.yield_rate,1) as yield_rate
      from public.inventory_recipe_items ri
      join public.inventory_items i on i.id=ri.item_id
      left join public.inventory_yield_rules yr on yr.item_id=ri.item_id and yr.active=true
      where ri.recipe_id=new.recipe_id
      group by ri.item_id,i.name,i.active,yr.yield_rate
      order by ri.item_id
    loop
      if recipe_item.ready_per_unit is null or recipe_item.ready_per_unit<=0 then
        raise exception 'Produção bloqueada: quantidade inválida do insumo %.',recipe_item.name;
      end if;
      if not recipe_item.active then
        raise exception 'Produção bloqueada: insumo "%" está desativado.',recipe_item.name;
      end if;

      v_ready_qty:=recipe_item.ready_per_unit*new.quantity;
      v_raw_qty:=public.raw_quantity_for_inventory_item(recipe_item.item_id,v_ready_qty);

      insert into public.production_batch_items(batch_id,item_id,quantity_used)
      values(new.id,recipe_item.item_id,v_raw_qty);

      if new.order_id is null then
        v_order_target_raw:=v_raw_qty;
        v_already_consumed:=0;
      else
        -- Cumulative target for every batch of this order already completed,
        -- including the batch being updated. This allows pre-existing manual
        -- order consumption to be reconciled without deducting it twice.
        select coalesce(sum(pb_required.raw_qty),0)
          into v_order_target_raw
        from (
          select ri.item_id,
                 sum(ri.quantity*pb.quantity) as ready_qty,
                 public.raw_quantity_for_inventory_item(
                   ri.item_id,sum(ri.quantity*pb.quantity)
                 ) as raw_qty
          from public.production_batches pb
          join public.inventory_recipe_items ri on ri.recipe_id=pb.recipe_id
          where pb.order_id=new.order_id
            and (pb.status='concluida' or pb.id=new.id)
            and ri.item_id=recipe_item.item_id
          group by ri.item_id
        ) pb_required;

        select coalesce(sum(m.quantity),0)
          into v_already_consumed
        from public.inventory_movements m
        where m.item_id=recipe_item.item_id
          and m.movement_type='consumo'
          and (
            (m.reference_type in ('order','customer_order') and m.reference_id=new.order_id::text)
            or
            (m.reference_type='production_batch' and exists(
              select 1 from public.production_batches pb2
              where pb2.id::text=m.reference_id and pb2.order_id=new.order_id
            ))
          );
      end if;

      v_outstanding:=greatest(v_order_target_raw-v_already_consumed,0);
      if v_outstanding>0 then
        insert into public.inventory_movements
          (item_id,movement_type,quantity,reason,reference_type,reference_id)
        values
          (recipe_item.item_id,'consumo',v_outstanding,
           case when new.order_id is null then
             format('Consumo de matéria-prima da produção concluída. Peso pronto previsto: %s; matéria-prima baixada: %s; rendimento aplicado: %s%%.',
               v_ready_qty,v_outstanding,recipe_item.yield_rate*100)
           else
             format('Consumo consolidado do pedido %s. Peso pronto acumulado previsto: %s; matéria-prima total prevista: %s; baixa adicional após conciliação de consumos anteriores: %s; rendimento: %s%%.',
               coalesce((select order_code from public.customer_orders where id=new.order_id),new.order_id::text),
               v_ready_qty,v_order_target_raw,v_outstanding,recipe_item.yield_rate*100)
           end,
           case when new.order_id is null then 'production_batch' else 'customer_order' end,
           case when new.order_id is null then new.id::text else new.order_id::text end);
      end if;
    end loop;

    new.stock_consumed:=true;
  end if;
  return new;
end;
$$;
