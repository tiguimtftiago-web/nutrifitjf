-- Capture the weighted-average cost at the moment raw materials are consumed.
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

    for recipe_item in
      select ri.item_id,sum(ri.quantity) as ready_per_unit,
             i.name,i.active,i.average_cost,coalesce(yr.yield_rate,1) as yield_rate
      from public.inventory_recipe_items ri
      join public.inventory_items i on i.id=ri.item_id
      left join public.inventory_yield_rules yr on yr.item_id=ri.item_id and yr.active=true
      where ri.recipe_id=new.recipe_id
      group by ri.item_id,i.name,i.active,i.average_cost,yr.yield_rate
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
          (item_id,movement_type,quantity,unit_cost,reason,reference_type,reference_id)
        values
          (recipe_item.item_id,'consumo',v_outstanding,recipe_item.average_cost,
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

notify pgrst, 'reload schema';
