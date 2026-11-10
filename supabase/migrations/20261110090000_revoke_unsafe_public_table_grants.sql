-- Remove database-level capabilities that bypass row-level security or are not needed
-- by the public API. In particular, TRUNCATE is not governed by RLS and could
-- otherwise affect every row in a table when used by a role with this grant.
-- This migration changes privileges only; it does not read, update, or delete data.

REVOKE TRUNCATE, REFERENCES, TRIGGER
  ON ALL TABLES IN SCHEMA public
  FROM anon, authenticated;

-- Keep future public tables from inheriting these unnecessary privileges.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;
