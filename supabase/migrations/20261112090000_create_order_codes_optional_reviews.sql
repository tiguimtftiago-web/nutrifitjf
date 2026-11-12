alter table public.customer_orders
  add column if not exists order_code text
  default ('NF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)));

update public.customer_orders
set order_code = 'NF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
where order_code is null;

alter table public.customer_orders
  alter column order_code set not null;

create unique index if not exists customer_orders_order_code_key
  on public.customer_orders (order_code);

alter table public.customer_reviews
  alter column order_id drop not null;

alter table public.customer_reviews
  add column if not exists purchase_verified boolean not null default false;
