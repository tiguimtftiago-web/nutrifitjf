create or replace function public.refresh_order_inventory_requirements_after_batch()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
begin
  if new.order_id is not null then
    perform public.refresh_order_inventory_requirements(new.order_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_refresh_order_inventory_requirements_after_batch on public.production_batches;
create trigger trg_refresh_order_inventory_requirements_after_batch
after insert or update of status,stock_consumed on public.production_batches
for each row
execute function public.refresh_order_inventory_requirements_after_batch();
