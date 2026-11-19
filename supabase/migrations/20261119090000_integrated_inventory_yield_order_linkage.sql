-- Nutrifit integrated inventory: explicit protein yields, order-linked purchases,
-- recipe aliases, raw requirements and transactional production consumption.

create table if not exists public.inventory_yield_rules (
  item_id uuid primary key references public.inventory_items(id) on delete cascade,
  yield_rate numeric(8,5) not null check (yield_rate > 0 and yield_rate <= 1),
  notes text,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.inventory_yield_rules enable row level security;
drop policy if exists admin_inventory_yield_rules on public.inventory_yield_rules;
create policy admin_inventory_yield_rules on public.inventory_yield_rules
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
grant select, insert, update, delete on public.inventory_yield_rules to authenticated;

insert into public.inventory_yield_rules(item_id,yield_rate,notes)
select id,0.5,'Rendimento operacional Nutrifit: 1 kg cru gera 500 g pronto.'
from public.inventory_items
where lower(name) in ('frango','filé de frango','coxa de frango','peito de frango','sobrecoxa de frango')
on conflict(item_id) do update set yield_rate=excluded.yield_rate,notes=excluded.notes,active=true,updated_at=now();

insert into public.inventory_yield_rules(item_id,yield_rate,notes)
select id,0.7,'Rendimento operacional Nutrifit: 2.000 g crus geraram 1.400 g prontos.'
from public.inventory_items
where lower(name) in ('carne bovina','carne moída','patinho','acém','alcatra','costela bovina')
on conflict(item_id) do update set yield_rate=excluded.yield_rate,notes=excluded.notes,active=true,updated_at=now();

create table if not exists public.inventory_recipe_aliases (
  normalized_order_name text primary key,
  recipe_id uuid not null references public.inventory_recipes(id) on delete cascade,
  notes text,
  active boolean not null default true
);
alter table public.inventory_recipe_aliases enable row level security;
drop policy if exists admin_inventory_recipe_aliases on public.inventory_recipe_aliases;
create policy admin_inventory_recipe_aliases on public.inventory_recipe_aliases
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
grant select, insert, update, delete on public.inventory_recipe_aliases to authenticated;

insert into public.inventory_recipe_aliases(normalized_order_name,recipe_id,notes)
values
 ('carne bovina grelhada (maminha ou alcatra) + arroz branco','167bd538-ec1f-4941-8549-7af0df0604d9','Alias do nome exibido no pedido personalizado.'),
 ('carne bovina (maminha ou alcatra) + batata-doce cozida','6c3a7b6c-11d8-42bf-8989-de80987e75ab','Alias do nome exibido no pedido personalizado.')
on conflict(normalized_order_name) do update set recipe_id=excluded.recipe_id,notes=excluded.notes,active=true;

alter table public.inventory_purchases
  add column if not exists order_id uuid references public.customer_orders(id) on delete set null,
  add column if not exists financial_transaction_id uuid references public.financial_transactions(id) on delete set null;

alter table public.order_inventory_requirements
  add column if not exists finished_quantity numeric(14,3) not null default 0,
  add column if not exists yield_rate numeric(8,5) not null default 1;

create table if not exists public.order_inventory_exceptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.customer_orders(id) on delete cascade,
  order_item_snapshot jsonb not null,
  issue text not null,
  created_at timestamptz not null default now(),
  unique(order_id, order_item_snapshot)
);
alter table public.order_inventory_exceptions enable row level security;
drop policy if exists admin_order_inventory_exceptions on public.order_inventory_exceptions;
create policy admin_order_inventory_exceptions on public.order_inventory_exceptions
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
grant select, insert, update, delete on public.order_inventory_exceptions to authenticated;
create index if not exists idx_order_inventory_exceptions_order on public.order_inventory_exceptions(order_id);

create or replace function public.resolve_order_recipe_id(p_order_name text,p_weight text default null)
returns uuid
language plpgsql
stable
set search_path = 'pg_catalog','public'
as $$
declare
  v_recipe_id uuid;
  v_count integer;
  v_name text := lower(trim(coalesce(p_order_name,'')));
  v_weight text := trim(coalesce(p_weight,''));
begin
  if v_name='' then return null; end if;

  select recipe_id into v_recipe_id
  from public.inventory_recipe_aliases
  where normalized_order_name=v_name and active=true
  limit 1;
  if v_recipe_id is not null then return v_recipe_id; end if;

  if v_weight<>'' then
    select r.id into v_recipe_id
    from public.inventory_recipes r
    where r.active=true
      and lower(trim(coalesce(r.product_name,r.name)))=v_name || ' — ' || lower(v_weight)
    limit 1;
    if v_recipe_id is not null then return v_recipe_id; end if;
  end if;

  select count(*),min(r.id::text)::uuid
    into v_count,v_recipe_id
  from public.inventory_recipes r
  where r.active=true
    and lower(trim(coalesce(r.product_name,r.name)))=v_name;
  if v_count=1 then return v_recipe_id; end if;
  return null;
end;
$$;

create or replace function public.raw_quantity_for_inventory_item(p_item_id uuid,p_ready_quantity numeric)
returns numeric
language sql
stable
set search_path = 'pg_catalog','public'
as $$
  select case
    when yr.active and yr.yield_rate>0 then round((p_ready_quantity / yr.yield_rate)::numeric,3)
    else round(p_ready_quantity::numeric,3)
  end
  from (select 1) seed
  left join public.inventory_yield_rules yr on yr.item_id=p_item_id;
$$;

create or replace function public.refresh_order_inventory_requirements(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  order_row public.customer_orders%rowtype;
  order_item jsonb;
  recipe_id uuid;
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

    recipe_id:=public.resolve_order_recipe_id(order_item->>'name',order_item->>'weight');
    if recipe_id is null then
      insert into public.order_inventory_exceptions(order_id,order_item_snapshot,issue)
      values(p_order_id,order_item,'Produto do pedido sem ficha técnica vinculada ou com correspondência ambígua.')
      on conflict(order_id,order_item_snapshot) do update set issue=excluded.issue;
      continue;
    end if;

    for recipe_item in
      select ri.item_id,ri.quantity,coalesce(yr.yield_rate,1) as yield_rate
      from public.inventory_recipe_items ri
      left join public.inventory_yield_rules yr on yr.item_id=ri.item_id and yr.active=true
      where ri.recipe_id=recipe_id
      order by ri.item_id
    loop
      ready_qty:=recipe_item.quantity*order_qty;
      v_yield_rate:=recipe_item.yield_rate;
      raw_qty:=public.raw_quantity_for_inventory_item(recipe_item.item_id,ready_qty);

      insert into public.order_inventory_requirements
        (order_id,recipe_id,item_id,required_quantity,finished_quantity,yield_rate)
      values(p_order_id,recipe_id,recipe_item.item_id,raw_qty,ready_qty,v_yield_rate)
      on conflict(order_id,item_id) do update
        set recipe_id=excluded.recipe_id,
            required_quantity=public.order_inventory_requirements.required_quantity+excluded.required_quantity,
            finished_quantity=public.order_inventory_requirements.finished_quantity+excluded.finished_quantity,
            yield_rate=excluded.yield_rate;
    end loop;
  end loop;
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
  elsif new.status='cancelado' then
    delete from public.order_inventory_requirements where order_id=new.id;
    delete from public.order_inventory_exceptions where order_id=new.id;
  end if;
  return new;
end;
$$;

create or replace function public.create_production_from_order(p_order_id uuid)
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

  perform public.refresh_order_inventory_requirements(p_order_id);
  return created_count;
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
  ready_qty numeric;
  raw_qty numeric;
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

      ready_qty:=recipe_item.ready_per_unit*new.quantity;
      raw_qty:=public.raw_quantity_for_inventory_item(recipe_item.item_id,ready_qty);

      insert into public.production_batch_items(batch_id,item_id,quantity_used)
      values(new.id,recipe_item.item_id,raw_qty);

      if not exists(
        select 1 from public.inventory_movements m
        where m.item_id=recipe_item.item_id
          and m.movement_type='consumo'
          and m.reference_type='production_batch'
          and m.reference_id=new.id::text
      ) then
        insert into public.inventory_movements
          (item_id,movement_type,quantity,reason,reference_type,reference_id)
        values
          (recipe_item.item_id,'consumo',raw_qty,
           format('Consumo de matéria-prima para produção concluída. Produção pronta prevista: %s; matéria-prima baixada: %s; rendimento aplicado: %s%%.',
             ready_qty,raw_qty,recipe_item.yield_rate*100),
           'production_batch',new.id::text);
      end if;
    end loop;

    new.stock_consumed:=true;
  end if;
  return new;
end;
$$;

drop function if exists public.register_inventory_purchase(uuid,numeric,numeric,uuid,boolean,text);
create or replace function public.register_inventory_purchase(
  p_item_id uuid,
  p_quantity numeric,
  p_unit_cost numeric,
  p_supplier_id uuid default null,
  p_is_promotion boolean default false,
  p_notes text default null,
  p_order_id uuid default null,
  p_invoice_number text default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  v_item public.inventory_items%rowtype;
  v_supplier_name text;
  v_purchase_id uuid;
  v_total numeric;
  v_new_quantity numeric;
  v_new_average numeric;
begin
  if not public.is_admin_user() then raise exception 'Acesso administrativo necessário'; end if;
  if p_quantity<=0 then raise exception 'Quantidade da compra deve ser maior que zero'; end if;
  if p_unit_cost<0 then raise exception 'Custo unitário inválido'; end if;

  select * into v_item from public.inventory_items where id=p_item_id for update;
  if not found then raise exception 'Insumo não encontrado'; end if;
  if p_order_id is not null and not exists(select 1 from public.customer_orders where id=p_order_id) then
    raise exception 'Pedido vinculado não encontrado';
  end if;
  if p_supplier_id is not null then select name into v_supplier_name from public.suppliers where id=p_supplier_id; end if;

  v_total:=p_quantity*p_unit_cost;
  insert into public.inventory_purchases(supplier_id,total_cost,status,notes,order_id,invoice_number)
  values(p_supplier_id,v_total,'recebida',p_notes,p_order_id,nullif(trim(p_invoice_number),''))
  returning id into v_purchase_id;

  insert into public.inventory_purchase_items(purchase_id,item_id,quantity,unit_cost,is_promotion)
  values(v_purchase_id,p_item_id,p_quantity,p_unit_cost,p_is_promotion);

  insert into public.inventory_movements
    (item_id,movement_type,quantity,unit_cost,reason,reference_type,reference_id,created_by)
  values
    (p_item_id,'entrada',p_quantity,p_unit_cost,
     case when p_is_promotion then 'Compra em promoção' else 'Compra de estoque' end,
     'purchase',v_purchase_id::text,auth.uid());

  select current_quantity,average_cost into v_new_quantity,v_new_average
  from public.inventory_items where id=p_item_id;

  if p_supplier_id is not null then
    update public.inventory_items set supplier=coalesce(v_supplier_name,supplier) where id=p_item_id;
  end if;

  return jsonb_build_object('purchase_id',v_purchase_id,'item_id',p_item_id,'quantity',p_quantity,
    'unit_cost',p_unit_cost,'total_cost',v_total,'new_quantity',v_new_quantity,
    'new_average_cost',v_new_average,'is_promotion',p_is_promotion,'order_id',p_order_id,
    'invoice_number',nullif(trim(p_invoice_number),''));
end;
$$;

create or replace function public.create_financial_transaction_for_inventory_purchase()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  v_transaction_id uuid;
begin
  if new.financial_transaction_id is not null then return new; end if;

  insert into public.financial_transactions
    (type,category,description,amount,status,order_id,supplier_id,notes)
  values
    ('despesa','compras de insumos',
     'Compra de insumos' || case when new.invoice_number is not null then ' — Nota '||new.invoice_number else '' end,
     new.total_cost,'pendente',new.order_id,new.supplier_id,
     concat_ws(E'\n',new.notes,'Compra recebida no estoque; situação financeira pendente de confirmação de pagamento.'))
  returning id into v_transaction_id;

  update public.inventory_purchases set financial_transaction_id=v_transaction_id where id=new.id;
  return new;
end;
$$;

drop trigger if exists trg_financial_transaction_for_inventory_purchase on public.inventory_purchases;
create trigger trg_financial_transaction_for_inventory_purchase
after insert on public.inventory_purchases
for each row execute function public.create_financial_transaction_for_inventory_purchase();
