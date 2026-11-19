-- Fix PL/pgSQL variable/column ambiguity in the order requirements recalculation.
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
        (order_id,recipe_id,item_id,required_quantity,finished_quantity,yield_rate)
      values(p_order_id,v_recipe_id,recipe_item.item_id,raw_qty,ready_qty,v_yield_rate)
      on conflict(order_id,item_id) do update
        set recipe_id=excluded.recipe_id,
            required_quantity=public.order_inventory_requirements.required_quantity+excluded.required_quantity,
            finished_quantity=public.order_inventory_requirements.finished_quantity+excluded.finished_quantity,
            yield_rate=excluded.yield_rate;
    end loop;
  end loop;
end;
$$;
