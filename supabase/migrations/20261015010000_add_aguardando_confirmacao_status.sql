-- Add fields used by checkout draft capture. Existing orders remain valid.
alter table public.customer_orders
  add column if not exists discount numeric not null default 0,
  add column if not exists notes text;

-- Permit the new pre-confirmation state without changing any existing status values.
alter table public.customer_orders
  drop constraint if exists customer_orders_status_check;

alter table public.customer_orders
  add constraint customer_orders_status_check
  check (status = any (array[
    'aguardando_confirmacao'::text,
    'enviado_whatsapp'::text,
    'confirmado'::text,
    'pago_recebido'::text,
    'em_preparo'::text,
    'saiu_entrega'::text,
    'entregue'::text,
    'cancelado'::text
  ]));

-- Public checkout inserts must never be able to mark orders as confirmed/paid,
-- start production, or trigger delivery/stock side effects.
drop policy if exists orders_insert_public on public.customer_orders;
create policy orders_insert_public
  on public.customer_orders
  for insert
  to anon, authenticated
  with check (
    status = any (array['aguardando_confirmacao'::text, 'enviado_whatsapp'::text])
    and customer_name is not null
    and length(btrim(customer_name)) between 2 and 120
    and whatsapp ~ '^[0-9]{10,15}$'
    and jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) between 1 and 100
    and item_count between 1 and 100
    and subtotal >= 0
    and discount >= 0
    and discount <= subtotal
    and delivery_fee >= 0
    and total >= 0
    and abs(subtotal - discount + delivery_fee - total) <= 0.02
  );
