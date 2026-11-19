-- Guardrails for the inventory ledger: only positive, known movements are accepted.
alter table public.inventory_movements
  add constraint inventory_movements_quantity_positive
  check (quantity > 0) not valid;
alter table public.inventory_movements
  validate constraint inventory_movements_quantity_positive;

alter table public.inventory_movements
  add constraint inventory_movements_type_allowed
  check (movement_type in ('entrada','consumo','perda','ajuste','devolucao')) not valid;
alter table public.inventory_movements
  validate constraint inventory_movements_type_allowed;

create index if not exists idx_customer_order_cost_items_inventory_item_id
  on public.customer_order_cost_items(inventory_item_id);

create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
declare
  old_qty numeric;
  old_avg numeric;
  new_qty numeric;
  item_active boolean;
begin
  if new.quantity is null or new.quantity<=0 then
    raise exception 'A quantidade da movimentação deve ser maior que zero.';
  end if;
  if new.movement_type not in ('entrada','consumo','perda','ajuste','devolucao') then
    raise exception 'Tipo de movimentação inválido: %',new.movement_type;
  end if;

  select current_quantity,average_cost,active
    into old_qty,old_avg,item_active
  from public.inventory_items
  where id=new.item_id
  for update;

  if not found then raise exception 'Insumo não encontrado: %',new.item_id; end if;
  if not item_active then raise exception 'Insumo inativo: %',new.item_id; end if;

  if new.movement_type in ('entrada','devolucao','ajuste') then
    new_qty:=old_qty+new.quantity;
    if new.movement_type='entrada' and new.unit_cost is not null then
      update public.inventory_items
      set current_quantity=new_qty,
          average_cost=case when new_qty>0
            then ((old_qty*old_avg)+(new.quantity*new.unit_cost))/new_qty
            else new.unit_cost end
      where id=new.item_id;
    else
      update public.inventory_items set current_quantity=new_qty where id=new.item_id;
    end if;
  else
    if old_qty<new.quantity then
      raise exception 'Estoque insuficiente para o item %: disponível %, solicitado %.',
        new.item_id,old_qty,new.quantity;
    end if;
    update public.inventory_items
    set current_quantity=old_qty-new.quantity
    where id=new.item_id;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_inventory_movement_mutation()
returns trigger
language plpgsql
set search_path = 'pg_catalog','public'
as $$
begin
  raise exception 'Movimentações de estoque são imutáveis. Para corrigir, registre uma movimentação inversa de ajuste/estorno com justificativa.';
end;
$$;

drop trigger if exists trg_prevent_inventory_movement_mutation on public.inventory_movements;
create trigger trg_prevent_inventory_movement_mutation
before update or delete on public.inventory_movements
for each row execute function public.prevent_inventory_movement_mutation();

revoke execute on function public.prevent_inventory_movement_mutation() from public,anon,authenticated;
notify pgrst,'reload schema';
