-- Explicitly pin name resolution for remaining SECURITY DEFINER routines.
ALTER FUNCTION public.apply_finished_stock_from_order() SET search_path = pg_catalog, public;
ALTER FUNCTION public.apply_inventory_movement() SET search_path = pg_catalog, public;
ALTER FUNCTION public.bootstrap_catalog_product_recipes() SET search_path = pg_catalog, public;
ALTER FUNCTION public.consume_b2b_form_rate_limit(text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.consume_production_stock() SET search_path = pg_catalog, public;
ALTER FUNCTION public.create_customer_cost_record_for_order() SET search_path = pg_catalog, public;
ALTER FUNCTION public.redeem_clube_nutrifit_welcome_coupon(text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.redeem_nutrifit_coupon(text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.refresh_order_inventory_requirements(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.sync_order_inventory_requirements() SET search_path = pg_catalog, public;
ALTER FUNCTION public.validate_nutrifit_coupon(text, numeric) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_admin_user() SET search_path = pg_catalog, public;
