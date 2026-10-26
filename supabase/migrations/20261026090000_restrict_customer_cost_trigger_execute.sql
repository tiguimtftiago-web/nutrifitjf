-- Restrict direct API execution of the SECURITY DEFINER trigger function.
-- The function is attached to public.customer_orders by the
-- customer_orders_create_cost_record AFTER INSERT trigger. PostgreSQL checks
-- EXECUTE privilege when the trigger is created; revoking direct RPC access
-- does not remove or disable the trigger.
--
-- Keep the existing service_role grant and function owner privileges unchanged.
REVOKE EXECUTE ON FUNCTION public.create_customer_cost_record_for_order()
  FROM PUBLIC, anon, authenticated;

-- All table references in the function are schema-qualified. Put pg_catalog
-- first to avoid resolving built-in functions through the exposed public schema.
ALTER FUNCTION public.create_customer_cost_record_for_order()
  SET search_path = pg_catalog, public;
