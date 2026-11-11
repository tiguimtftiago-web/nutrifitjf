-- Remove database-level capabilities that bypass row-level security or are not needed
-- by the public API. In particular, TRUNCATE is not governed by RLS and could
-- otherwise affect every row in a table when used by a role with this grant.
-- This migration changes privileges only; it does not read, update, or delete data.

REVOKE TRUNCATE, REFERENCES, TRIGGER
  ON ALL TABLES IN SCHEMA public
  FROM anon, authenticated;

-- Keep future tables created by the application migration owner from inheriting
-- these unnecessary privileges. The migration role owns these tables and can
-- update its own default ACL.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;

-- Default privileges owned by the Supabase-managed supabase_admin role are
-- intentionally left unchanged: this migration role cannot alter that role's
-- defaults. Existing public tables are still covered by the REVOKE above.
