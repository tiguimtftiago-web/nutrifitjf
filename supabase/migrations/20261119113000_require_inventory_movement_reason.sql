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
  if nullif(trim(coalesce(new.reason,'')),'') is null then
    raise exception 'Informe o motivo da movimentação para manter o histórico auditável.';
  end if;

  select current_quantity,average_cost,active into old_qty,old_avg,item_active
  from public.inventory_items where id=new.item_id for update;
  if not found then raise exception 'Insumo não encontrado: %',new.item_id; end if;
  if not item_active then raise exception 'Insumo inativo: %',new.item_id; end if;

  if new.movement_type in ('entrada','devolucao','ajuste') then
    new_qty:=old_qty+new.quantity;
    if new.movement_type='entrada' and new.unit_cost is not null then
      update public.inventory_items
      set current_quantity=new_qty,
          average_cost=case when new_qty>0 then ((old_qty*old_avg)+(new.quantity*new.unit_cost))/new_qty else new.unit_cost end
      where id=new.item_id;
    else
      update public.inventory_items set current_quantity=new_qty where id=new.item_id;
    end if;
  else
    if old_qty<new.quantity then
      raise exception 'Estoque insuficiente para o item %: disponível %, solicitado %.',new.item_id,old_qty,new.quantity;
    end if;
    update public.inventory_items set current_quantity=old_qty-new.quantity where id=new.item_id;
  end if;
  return new;
end;
$$;
notify pgrst,'reload schema';
