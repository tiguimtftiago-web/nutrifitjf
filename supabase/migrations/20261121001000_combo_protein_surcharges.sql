alter table public.catalog_products
  add column if not exists premium_surcharge numeric(10,2) not null default 0;

alter table public.catalog_products
  drop constraint if exists catalog_products_premium_surcharge_nonnegative;

alter table public.catalog_products
  add constraint catalog_products_premium_surcharge_nonnegative
  check (premium_surcharge >= 0);

-- Preserve the existing public behavior: tilapia had a R$ 6,00 surcharge.
update public.catalog_products
set premium_surcharge = 6.00
where name = 'Tilápia Fit com Arroz Branco e Legumes'
  and category = 'marmita'
  and line = 'Fit';
