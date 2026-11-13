-- Consolidate overlapping SELECT access for nutrition foods without changing access semantics.
DROP POLICY "Admins manage nutrition foods" ON public.nutrifit360_foods;
DROP POLICY "Authenticated users can read active nutrition foods" ON public.nutrifit360_foods;

CREATE POLICY "Admins insert nutrition foods" ON public.nutrifit360_foods
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user());
CREATE POLICY "Admins update nutrition foods" ON public.nutrifit360_foods
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());
CREATE POLICY "Admins delete nutrition foods" ON public.nutrifit360_foods
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (public.is_admin_user());
CREATE POLICY "Authenticated users read nutrition foods" ON public.nutrifit360_foods
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (active = true OR public.is_admin_user());
