-- No historical migration file was ever committed for this table either;
-- reconstructed from the live schema only. RLS inferred from usage:
-- app/api/family-aid/route.ts reads via the anon client filtered to
-- status='open' (public appeal cards on the donate page) and writes via the
-- service-role client after checking auth.getUser() at the app layer.
-- No CHECK constraints on status/help_type: the app validates help_type as
-- free text (lib/schemas/family-aid.ts only requires non-empty) and only
-- 'open' has ever been observed for status, so a guessed enum here would
-- risk being wrong rather than documenting real intent.

CREATE TABLE IF NOT EXISTS public.family_aid_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  story text,
  amount_needed numeric,
  help_type text NOT NULL,
  location_state text,
  location_city text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.family_aid_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "family_aid_requests_select" ON public.family_aid_requests;
CREATE POLICY "family_aid_requests_select" ON public.family_aid_requests FOR SELECT USING (status = 'open' OR auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "family_aid_requests_insert" ON public.family_aid_requests;
CREATE POLICY "family_aid_requests_insert" ON public.family_aid_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "family_aid_requests_update" ON public.family_aid_requests;
CREATE POLICY "family_aid_requests_update" ON public.family_aid_requests FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "family_aid_requests_delete" ON public.family_aid_requests;
CREATE POLICY "family_aid_requests_delete" ON public.family_aid_requests FOR DELETE USING (auth.uid() = user_id OR is_admin());
