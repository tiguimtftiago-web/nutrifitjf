-- Restrict exposed SECURITY DEFINER functions to the intended callers.
revoke execute on function public.create_financial_transaction_for_inventory_purchase() from public, anon, authenticated;
revoke execute on function public.refresh_order_inventory_requirements_after_batch() from public, anon, authenticated;
revoke execute on function public.refresh_order_inventory_requirements(uuid) from public, anon, authenticated;
revoke execute on function public.sync_order_inventory_requirements() from public, anon, authenticated;
revoke execute on function public.consume_production_stock() from public, anon, authenticated;

revoke execute on function public.register_inventory_purchase(uuid,numeric,numeric,uuid,boolean,text,uuid,text) from public, anon;
grant execute on function public.register_inventory_purchase(uuid,numeric,numeric,uuid,boolean,text,uuid,text) to authenticated;

revoke execute on function public.create_production_from_order(uuid) from public, anon;
grant execute on function public.create_production_from_order(uuid) to authenticated;

notify pgrst, 'reload schema';
