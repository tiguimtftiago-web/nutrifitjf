-- Prevent generic catalog recipes from driving production or stock for personalized orders.
-- Personalized orders remain excluded from raw-material planning until their complete
-- component mapping and preparation yields are explicitly validated.
create or replace function public.refresh_order_inventory_requirements(p_order_id uuid)
returns void language plpgsql security definer
set search_path to 'pg_catalog','public'
as $function$
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

  if exists(select 1 from public.customer_order_meal_lines where order_id=p_order_id) then
    delete from public.order_inventory_requirements where order_id=p_order_id;
    delete from public.order_inventory_exceptions where order_id=p_order_id;
    insert into public.order_inventory_exceptions(order_id,order_item_snapshot,issue)
    select p_order_id,
      case when l.order_item_snapshot='{}'::jsonb then jsonb_build_object('name',l.display_name,'quantity',l.quantity) else l.order_item_snapshot end,
      'Pedido com dieta individual: ficha '||l.validation_status||
      '. Cálculo de matéria-prima e início da produção bloqueados até validar gramaturas, vínculos e rendimentos.'||
      case when nullif(trim(coalesce(l.validation_notes,'')),'') is null then '' else ' Pendência: '||trim(l.validation_notes) end
    from public.customer_order_meal_lines l
    where l.order_id=p_order_id
    on conflict(order_id,order_item_snapshot) do update set issue=excluded.issue;
    return;
  end if;

  delete from public.order_inventory_requirements where order_id=p_order_id;
  delete from public.order_inventory_exceptions where order_id=p_order_id;
  if jsonb_typeof(coalesce(order_row.items,'[]'::jsonb))<>'array' then raise exception 'Itens do pedido em formato inválido: %',p_order_id; end if;
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
      where ri.recipe_id=v_recipe_id order by ri.item_id
    loop
      ready_qty:=recipe_item.quantity*order_qty;
      v_yield_rate:=recipe_item.yield_rate;
      raw_qty:=public.raw_quantity_for_inventory_item(recipe_item.item_id,ready_qty);
      insert into public.order_inventory_requirements(order_id,recipe_id,item_id,required_quantity,finished_quantity,yield_rate,consumed_quantity,remaining_quantity)
      values(p_order_id,v_recipe_id,recipe_item.item_id,raw_qty,ready_qty,v_yield_rate,0,raw_qty)
      on conflict(order_id,item_id) do update set recipe_id=excluded.recipe_id,
        required_quantity=public.order_inventory_requirements.required_quantity+excluded.required_quantity,
        finished_quantity=public.order_inventory_requirements.finished_quantity+excluded.finished_quantity,yield_rate=excluded.yield_rate;
    end loop;
  end loop;
  update public.order_inventory_requirements req
  set consumed_quantity=coalesce((
    select sum(m.quantity) from public.inventory_movements m where m.item_id=req.item_id and m.movement_type='consumo'
      and ((m.reference_type in ('order','customer_order') and m.reference_id in (p_order_id::text,coalesce(order_row.order_code,'')))
        or (m.reference_type='production_batch' and exists(select 1 from public.production_batches pb where pb.id::text=m.reference_id and pb.order_id=p_order_id)))
  ),0),
  remaining_quantity=greatest(req.required_quantity-coalesce((
    select sum(m.quantity) from public.inventory_movements m where m.item_id=req.item_id and m.movement_type='consumo'
      and ((m.reference_type in ('order','customer_order') and m.reference_id in (p_order_id::text,coalesce(order_row.order_code,'')))
        or (m.reference_type='production_batch' and exists(select 1 from public.production_batches pb where pb.id::text=m.reference_id and pb.order_id=p_order_id)))
  ),0),0)
  where req.order_id=p_order_id;
end;
$function$;

create or replace function public.save_customer_order_meal_composition(
  p_order_id uuid,p_line_id uuid,p_display_name text,p_quantity integer,p_meal_period text,
  p_components jsonb,p_validation_status text default 'pendente',
  p_validation_notes text default null,p_order_item_snapshot jsonb default '{}'::jsonb
)
returns uuid language plpgsql security invoker
set search_path = 'pg_catalog','public'
as $$
declare
  v_line_id uuid; v_component jsonb; v_item_id uuid; v_recipe_id uuid;
  v_quantity numeric; v_unit text; v_units integer; v_total numeric; v_first_unit text;
begin
  if not public.is_admin_user() then raise exception 'Acesso administrativo necessário.'; end if;
  if p_order_id is null or nullif(trim(coalesce(p_display_name,'')),'') is null then raise exception 'Pedido e nome da refeição são obrigatórios.'; end if;
  if p_quantity is null or p_quantity < 1 then raise exception 'A quantidade de marmitas deve ser maior que zero.'; end if;
  if p_meal_period not in ('almoco','jantar','outro') then raise exception 'Período de refeição inválido.'; end if;
  if p_validation_status not in ('pendente','validada','bloqueada') then raise exception 'Status de validação inválido.'; end if;
  if jsonb_typeof(coalesce(p_components,'[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_components,'[]'::jsonb)) = 0 then raise exception 'Informe ao menos um componente para a refeição.'; end if;
  if not exists(select 1 from public.customer_orders where id=p_order_id and status <> 'cancelado') then raise exception 'Pedido não encontrado ou cancelado.'; end if;
  for v_component in select value from jsonb_array_elements(p_components)
  loop
    v_item_id := nullif(v_component->>'item_id','')::uuid; v_recipe_id := nullif(v_component->>'recipe_id','')::uuid;
    v_quantity := nullif(v_component->>'quantity_per_portion','')::numeric; v_unit := nullif(trim(coalesce(v_component->>'unit','')),'');
    if v_item_id is not null and v_recipe_id is not null then raise exception 'Cada componente deve apontar para um insumo, uma preparação ou ser manual.'; end if;
    if nullif(trim(coalesce(v_component->>'component_name_snapshot','')),'') is null or v_quantity is null or v_quantity <= 0 or v_unit is null then raise exception 'Todo componente precisa de nome, peso positivo e unidade.'; end if;
    if v_item_id is not null and not exists(select 1 from public.inventory_items where id=v_item_id and active=true) then raise exception 'O insumo selecionado não existe ou está inativo.'; end if;
    if v_recipe_id is not null and not exists(select 1 from public.inventory_recipes where id=v_recipe_id and active=true) then raise exception 'A preparação selecionada não existe ou está inativa.'; end if;
  end loop;
  select count(distinct value->>'unit'),sum((value->>'quantity_per_portion')::numeric),min(value->>'unit')
    into v_units,v_total,v_first_unit from jsonb_array_elements(p_components);
  if p_line_id is null then
    insert into public.customer_order_meal_lines(order_id,meal_period,display_name,quantity,portion_total_quantity,portion_unit,validation_status,validation_notes,composition_snapshot,order_item_snapshot)
    values(p_order_id,p_meal_period,trim(p_display_name),p_quantity,case when v_units=1 then v_total else null end,case when v_units=1 then v_first_unit else 'varios' end,p_validation_status,p_validation_notes,p_components,coalesce(p_order_item_snapshot,'{}'::jsonb))
    returning id into v_line_id;
  else
    update public.customer_order_meal_lines set meal_period=p_meal_period,display_name=trim(p_display_name),quantity=p_quantity,
      portion_total_quantity=case when v_units=1 then v_total else null end,portion_unit=case when v_units=1 then v_first_unit else 'varios' end,
      validation_status=p_validation_status,validation_notes=p_validation_notes,composition_snapshot=p_components,order_item_snapshot=coalesce(p_order_item_snapshot,'{}'::jsonb)
    where id=p_line_id and order_id=p_order_id returning id into v_line_id;
    if v_line_id is null then raise exception 'Ficha não encontrada para este pedido.'; end if;
    delete from public.customer_order_meal_components where meal_line_id=v_line_id;
  end if;
  insert into public.customer_order_meal_components(meal_line_id,sort_order,item_id,recipe_id,component_name_snapshot,quantity_per_portion,total_quantity,unit,notes)
  select v_line_id,(entry.ordinality-1)::integer,nullif(entry.value->>'item_id','')::uuid,nullif(entry.value->>'recipe_id','')::uuid,
    trim(entry.value->>'component_name_snapshot'),(entry.value->>'quantity_per_portion')::numeric,
    (entry.value->>'quantity_per_portion')::numeric*p_quantity,trim(entry.value->>'unit'),nullif(trim(coalesce(entry.value->>'notes','')),'')
  from jsonb_array_elements(p_components) with ordinality as entry(value,ordinality);
  perform public.refresh_order_inventory_requirements(p_order_id);
  return v_line_id;
end;
$$;