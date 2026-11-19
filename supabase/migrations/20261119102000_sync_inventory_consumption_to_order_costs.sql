-- Link order-specific inventory consumption to the existing customer order cost ledger.
alter table public.customer_order_cost_items
  add column if not exists inventory_item_id uuid references public.inventory_items(id) on delete set null;

create unique index if not exists idx_customer_order_cost_items_inventory_item
  on public.customer_order_cost_items(cost_record_id,inventory_item_id,category)
  where inventory_item_id is not null;

create or replace function public.sync_order_cost_from_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  v_order_id uuid;
  v_cost_record_id uuid;
  v_item_name text;
  v_unit text;
  v_unit_price numeric;
  v_is_estimate boolean;
begin
  if new.movement_type<>'consumo'
     or new.reference_type not in ('order','customer_order')
     or nullif(new.reference_id,'') is null then
    return new;
  end if;

  select o.id into v_order_id
  from public.customer_orders o
  where o.id::text=new.reference_id or o.order_code=new.reference_id
  limit 1;
  if v_order_id is null then return new; end if;

  select id into v_cost_record_id
  from public.customer_order_costs
  where order_id=v_order_id
  limit 1;
  if v_cost_record_id is null then return new; end if;

  select i.name,i.unit,
         coalesce(new.unit_cost,i.average_cost),
         (new.unit_cost is null)
  into v_item_name,v_unit,v_unit_price,v_is_estimate
  from public.inventory_items i
  where i.id=new.item_id;

  if v_item_name is null or v_unit_price is null or v_unit_price<=0 then
    return new;
  end if;

  insert into public.customer_order_cost_items
    (cost_record_id,inventory_item_id,category,item_name,quantity,unit,unit_price,total_cost,is_estimate,notes,sort_order)
  values
    (v_cost_record_id,new.item_id,'insumo',v_item_name,new.quantity,v_unit,
     v_unit_price,new.quantity*v_unit_price,v_is_estimate,
     concat_ws(E'\n','Sincronizado da movimentação de estoque '||new.id::text,new.reason),
     coalesce((select max(sort_order)+1 from public.customer_order_cost_items where cost_record_id=v_cost_record_id),1))
  on conflict (cost_record_id,inventory_item_id,category) where inventory_item_id is not null
  do update set
    quantity=public.customer_order_cost_items.quantity+excluded.quantity,
    unit_price=case
      when public.customer_order_cost_items.quantity+excluded.quantity>0
      then ((public.customer_order_cost_items.quantity*public.customer_order_cost_items.unit_price)+excluded.total_cost)
           /(public.customer_order_cost_items.quantity+excluded.quantity)
      else excluded.unit_price end,
    total_cost=public.customer_order_cost_items.total_cost+excluded.total_cost,
    is_estimate=public.customer_order_cost_items.is_estimate or excluded.is_estimate,
    notes=concat_ws(E'\n',public.customer_order_cost_items.notes,excluded.notes);

  return new;
end;
$$;

drop trigger if exists trg_sync_order_cost_from_inventory_movement on public.inventory_movements;
create trigger trg_sync_order_cost_from_inventory_movement
after insert on public.inventory_movements
for each row execute function public.sync_order_cost_from_inventory_movement();

revoke execute on function public.sync_order_cost_from_inventory_movement() from public, anon, authenticated;

-- Backfill all existing order-linked consumption movements into the cost ledger.
with movement_costs as (
  select
    c.id as cost_record_id,
    m.item_id as inventory_item_id,
    i.name as item_name,
    i.unit,
    sum(m.quantity) as quantity,
    sum(m.quantity*coalesce(m.unit_cost,i.average_cost)) as total_cost,
    sum(m.quantity*coalesce(m.unit_cost,i.average_cost))/nullif(sum(m.quantity),0) as unit_price,
    bool_or(m.unit_cost is null) as is_estimate,
    string_agg('Movimentação '||m.id::text||': '||coalesce(m.reason,''),E'\n' order by m.created_at) as notes
  from public.inventory_movements m
  join public.inventory_items i on i.id=m.item_id
  join public.customer_orders o on (o.id::text=m.reference_id or o.order_code=m.reference_id)
  join public.customer_order_costs c on c.order_id=o.id
  where m.movement_type='consumo'
    and m.reference_type in ('order','customer_order')
    and nullif(m.reference_id,'') is not null
  group by c.id,m.item_id,i.name,i.unit
  having sum(m.quantity*coalesce(m.unit_cost,i.average_cost))>0
)
insert into public.customer_order_cost_items
  (cost_record_id,inventory_item_id,category,item_name,quantity,unit,unit_price,total_cost,is_estimate,notes,sort_order)
select
  mc.cost_record_id,mc.inventory_item_id,'insumo',mc.item_name,mc.quantity,mc.unit,
  mc.unit_price,mc.total_cost,mc.is_estimate,mc.notes,
  coalesce((select max(ci.sort_order)+1 from public.customer_order_cost_items ci where ci.cost_record_id=mc.cost_record_id),1)
from movement_costs mc
on conflict (cost_record_id,inventory_item_id,category) where inventory_item_id is not null
do update set
  quantity=excluded.quantity,
  unit_price=excluded.unit_price,
  total_cost=excluded.total_cost,
  is_estimate=excluded.is_estimate,
  notes=excluded.notes;

notify pgrst, 'reload schema';
