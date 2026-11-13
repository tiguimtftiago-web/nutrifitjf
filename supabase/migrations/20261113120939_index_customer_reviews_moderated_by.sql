-- Index the moderator foreign key to support FK checks and moderator lookups.
CREATE INDEX IF NOT EXISTS customer_reviews_moderated_by_idx
  ON public.customer_reviews (moderated_by);
