-- Harden name resolution for the admin-only production creation RPC.
-- Keep the authenticated RPC grant because the admin dashboard calls it;
-- the function independently verifies the JWT email with is_admin_user().
ALTER FUNCTION public.create_production_from_order(uuid)
  SET search_path = pg_catalog, public;
