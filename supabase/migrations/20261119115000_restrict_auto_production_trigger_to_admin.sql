-- Only an authenticated Nutrifit admin or trusted service-role write may auto-create production plans.
create or replace function public.sync_order_production_batches_trigger()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
begin
  if not public.is_admin_user() and coalesce(auth.role(),'')<>'service_role' then
    return new;
  end if;
  perform public.sync_order_production_batches_internal(new.id);
  return new;
end;
$$;
revoke execute on function public.sync_order_production_batches_trigger() from public,anon,authenticated;
notify pgrst,'reload schema';
