alter table public.customer_reviews
  add column if not exists whatsapp_notification_status text not null default 'not_sent'
    check (whatsapp_notification_status in ('not_sent','sent','failed','not_configured')),
  add column if not exists whatsapp_message_id text,
  add column if not exists whatsapp_notification_error text,
  add column if not exists whatsapp_sent_at timestamptz;

comment on column public.customer_reviews.whatsapp_notification_status is
  'Status of the administrative WhatsApp notification for this review.';
