-- Cover foreign keys used by the integrated inventory and composition workflow.
create index if not exists idx_inventory_purchases_order_id
  on public.inventory_purchases(order_id);
create index if not exists idx_inventory_purchases_financial_transaction_id
  on public.inventory_purchases(financial_transaction_id);
create index if not exists idx_inventory_recipe_aliases_recipe_id
  on public.inventory_recipe_aliases(recipe_id);
create index if not exists idx_customer_order_meal_components_item_id
  on public.customer_order_meal_components(item_id);
create index if not exists idx_customer_order_meal_components_recipe_id
  on public.customer_order_meal_components(recipe_id);
create index if not exists idx_customer_order_meal_lines_source_composition_id
  on public.customer_order_meal_lines(source_composition_id);
create index if not exists idx_customer_orders_marketing_partner_id
  on public.customer_orders(marketing_partner_id);
create index if not exists idx_meal_composition_components_item_id
  on public.meal_composition_components(item_id);
create index if not exists idx_meal_composition_components_recipe_id
  on public.meal_composition_components(recipe_id);
create index if not exists idx_meal_compositions_source_order_id
  on public.meal_compositions(source_order_id);
