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
