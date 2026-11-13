-- Cache auth.uid() once per statement in Nutrifit360 row policies.
DROP POLICY "Users can create own goals" ON public.nutrifit360_goals;
CREATE POLICY "Users can create own goals" ON public.nutrifit360_goals
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can delete own goals" ON public.nutrifit360_goals;
CREATE POLICY "Users can delete own goals" ON public.nutrifit360_goals
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can update own goals" ON public.nutrifit360_goals;
CREATE POLICY "Users can update own goals" ON public.nutrifit360_goals
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can view own goals" ON public.nutrifit360_goals;
CREATE POLICY "Users can view own goals" ON public.nutrifit360_goals
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY "Users can delete own meal entries" ON public.nutrifit360_meal_entries;
CREATE POLICY "Users can delete own meal entries" ON public.nutrifit360_meal_entries
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can insert own meal entries" ON public.nutrifit360_meal_entries;
CREATE POLICY "Users can insert own meal entries" ON public.nutrifit360_meal_entries
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can read own meal entries" ON public.nutrifit360_meal_entries;
CREATE POLICY "Users can read own meal entries" ON public.nutrifit360_meal_entries
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can update own meal entries" ON public.nutrifit360_meal_entries;
CREATE POLICY "Users can update own meal entries" ON public.nutrifit360_meal_entries
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY "Users can delete own training sessions" ON public.nutrifit360_training_sessions;
CREATE POLICY "Users can delete own training sessions" ON public.nutrifit360_training_sessions
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can insert own training sessions" ON public.nutrifit360_training_sessions;
CREATE POLICY "Users can insert own training sessions" ON public.nutrifit360_training_sessions
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can update own training sessions" ON public.nutrifit360_training_sessions;
CREATE POLICY "Users can update own training sessions" ON public.nutrifit360_training_sessions
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY "Users can view own training sessions" ON public.nutrifit360_training_sessions;
CREATE POLICY "Users can view own training sessions" ON public.nutrifit360_training_sessions
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
