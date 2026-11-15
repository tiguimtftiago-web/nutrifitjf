-- pg_net is non-relocatable. Recreate it in the extensions schema instead
-- of using ALTER EXTENSION SET SCHEMA.
-- This aborts safely if there are pending HTTP requests in the pg_net queue.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM net.http_request_queue) THEN
    RAISE EXCEPTION 'Cannot recreate pg_net while HTTP requests are pending.';
  END IF;
END
$$;

-- The existing response buffer is transient (pg_net TTL) and contained only
-- successful responses when this migration was prepared.
DROP EXTENSION pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;
