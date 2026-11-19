-- Automatically create production plans for mapped order lines and debit raw stock
-- once an order enters preparation. Reconcile prior manual consumption first.
alter table public.customer_orders
  add column if not exists inventory_consumed_at timestamptz;

update public.customer_orders o
set inventory_consumed_at=(
  select min(m.created_at)
  from public.inventory_movements m
  where m.movement_type='consumo'
    and m.reference_type in ('order','customer_order')
    and m.reference_id in (o.id::text,coalesce(o.order_code,''))
)
where o.inventory_consumed_at is null
  and exists(
    select 1 from public.inventory_movements m
    where m.movement_type='consumo'
      and m.reference_type in ('order','customer_order')
      and m.reference_id in (o.id::text,coalesce(o.order_code,''))
  );

create or replace function public.ensure_production_batches_for_order(p_order_id uuid)
returns integer
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  order_row public.customer_orders%rowtype;
  grouped_recipe record;
  created_count integer:=0;
begin
  select * into order_row from public.customer_orders where id=p_order_id;
  if not found then return 0; end if;
  if order_row.status not in ('confirmado','pago_recebido','em_preparo') then return 0; end if;

  for grouped_recipe in
    select public.resolve_order_recipe_id(item.value->>'name',item.value->>'weight') as recipe_id,
           sum(greatest(coalesce(nullif(item.value->>'quantity','')::numeric,1),0)) as total_quantity
    from jsonb_array_elements(coalesce(order_row.items,'[]'::jsonb)) item(value)
    where greatest(coalesce(nullif(item.value->>'quantity','')::numeric,1),0)>0
    group by public.resolve_order_recipe_id(item.value->>'name',item.value->>'weight')
  loop
    if grouped_recipe.recipe_id is null then continue; end if;
    if not exists(select 1 from public.inventory_recipe_items where recipe_id=grouped_recipe.recipe_id) then continue; end if;

    if not exists(
      select 1 from public.production_batches pb
      where pb.order_id=p_order_id and pb.recipe_id=grouped_recipe.recipe_id
    ) then
      insert into public.production_batches(order_id,recipe_id,quantity,status,notes)
      values(p_order_id,grouped_recipe.recipe_id,grouped_recipe.total_quantity,'planejada',
        'Plano de produção criado automaticamente na entrada/atualização do pedido; baixa de matéria-prima ao iniciar o preparo.');
      created_count:=created_count+1;
    end if;
  end loop;
  return created_count;
end;
$$;

create or replace function public.sync_order_inventory_requirements()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
begin
  if new.status in ('confirmado','pago_recebido','em_preparo','saiu_entrega') then
    perform public.refresh_order_inventory_requirements(new.id);
    if new.status in ('confirmado','pago_recebido','em_preparo') then
      perform public.ensure_production_batches_for_order(new.id);
    end if;
  elsif new.status='cancelado' then
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
  if tg_op='UPDATE'
     and old.inventory_consumed_at is not null
     and new.items is distinct from old.items then
    raise exception 'Pedido já teve baixa de estoque. Para alterar itens ou quantidades, registre um ajuste/devolução vinculado ao pedido.';
  end if;

  if new.status<>'em_preparo' or new.inventory_consumed_at is not null then
    return new;
  end if;

  perform public.refresh_order_inventory_requirements(new.id);
  perform public.ensure_production_batches_for_order(new.id);

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

drop trigger if exists trg_consume_order_inventory_on_preparation on public.customer_orders;
create trigger trg_consume_order_inventory_on_preparation
after insert or update of status,items on public.customer_orders
for each row execute function public.consume_order_inventory_on_preparation();

revoke execute on function public.ensure_production_batches_for_order(uuid) from public, anon, authenticated;
revoke execute on function public.consume_order_inventory_on_preparation() from public, anon, authenticated;

notify pgrst, 'reload schema';
