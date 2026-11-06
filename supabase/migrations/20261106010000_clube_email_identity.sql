-- Allow Clube Nutrifit registration with either WhatsApp or e-mail.
-- Existing WhatsApp registrations remain valid and keep their unique constraint.
alter table public.customer_profiles
  alter column whatsapp drop not null;

alter table public.customer_profiles
  drop constraint if exists customer_profiles_whatsapp_check;

alter table public.customer_profiles
  add constraint customer_profiles_contact_check
  check (
    (whatsapp is not null and char_length(regexp_replace(whatsapp, '[^0-9]', '', 'g')) between 10 and 15)
    or
    (whatsapp is null and email is not null and char_length(btrim(email)) between 5 and 254)
  );

create unique index if not exists customer_profiles_email_normalized_unique
  on public.customer_profiles (lower(btrim(email)))
  where email is not null and btrim(email) <> '';

create or replace function public.redeem_clube_nutrifit_welcome_coupon_by_identity(
  p_whatsapp text default null,
  p_email text default null
)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  updated_count integer;
  clean_phone text := regexp_replace(coalesce(p_whatsapp, ''), '[^0-9]', '', 'g');
  clean_email text := lower(btrim(coalesce(p_email, '')));
begin
  if clean_email <> '' then
    update public.customer_profiles
    set coupon_used = true,
        last_order_at = now(),
        order_count = coalesce(order_count, 0) + 1
    where lower(btrim(email)) = clean_email
      and nutrifit_club_member = true
      and coupon_used = false;
  elsif clean_phone <> '' then
    update public.customer_profiles
    set coupon_used = true,
        last_order_at = now(),
        order_count = coalesce(order_count, 0) + 1
    where whatsapp = clean_phone
      and nutrifit_club_member = true
      and coupon_used = false;
  end if;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$function$;

revoke all on function public.redeem_clube_nutrifit_welcome_coupon_by_identity(text, text) from public, anon, authenticated;
grant execute on function public.redeem_clube_nutrifit_welcome_coupon_by_identity(text, text) to service_role;
