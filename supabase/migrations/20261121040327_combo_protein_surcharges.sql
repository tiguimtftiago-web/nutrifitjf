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

-- Fit 350 g: calculations use 150 g of cooked protein, chicken reference at
-- R$ 20,47/kg with 50% yield, 70% beef yield and 69,3% contribution margin.
update public.catalog_products
set premium_surcharge = 14.89
where name = 'Carne Acebolada com Legumes'
  and category = 'marmita'
  and line = 'Fit';

update public.catalog_products
set premium_surcharge = 16.29
where name in (
  'Patinho com Abóbora',
  'Patinho com Batata-Doce',
  'Patinho com Legumes na Manteiga',
  'Escondidinho de Patinho Fit'
)
  and category = 'marmita'
  and line = 'Fit';

-- Lombo remains at zero until its cooking yield is confirmed.
