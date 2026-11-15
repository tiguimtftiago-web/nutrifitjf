-- Removes the temporary duplicate table. The canonical delivery source is
-- public.delivery_neighborhood_fees, which is used by the site and both order endpoints.
drop table if exists public.delivery_zone_neighborhoods;
