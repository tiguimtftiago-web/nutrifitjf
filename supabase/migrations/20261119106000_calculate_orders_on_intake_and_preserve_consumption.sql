-- Calculate requirements as soon as an order enters WhatsApp/admin intake,
-- while creating production batches only after confirmation/payment.
-- Preserve requirements for canceled orders whose stock was already consumed.
create or replace function public.sync_order_inventory_requirements()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog','public'
as $$
begin
  if new.status in ('enviado_whatsapp','confirmado','pago_recebido','em_preparo','saiu_entrega') then
    perform public.refresh_order_inventory_requirements(new.id);
    if new.status in ('confirmado','pago_recebido','em_preparo') then
      perform public.ensure_production_batches_for_order(new.id);
    end if;
  elsif new.status='cancelado' and new.inventory_consumed_at is null then
    delete from public.order_inventory_requirements where order_id=new.id;
    delete from public.order_inventory_exceptions where order_id=new.id;
  end if;
  return new;
end;
$$;
