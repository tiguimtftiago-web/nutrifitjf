-- These RPCs enforce admin access and all affected tables have admin RLS policies.
-- Run as the authenticated admin instead of elevating privileges with SECURITY DEFINER.
alter function public.register_inventory_purchase(uuid,numeric,numeric,uuid,boolean,text,uuid,text) security invoker;
alter function public.create_production_from_order(uuid) security invoker;
notify pgrst, 'reload schema';
