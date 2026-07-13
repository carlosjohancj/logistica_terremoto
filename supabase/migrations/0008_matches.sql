-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id uuid REFERENCES public.travel_requests(id) ON DELETE CASCADE,
  transport_offer_id uuid REFERENCES public.transport_offers(id) ON DELETE SET NULL,
  housing_offer_id uuid REFERENCES public.housing_offers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Present in the live schema but not in the original seed.sql — added later
-- ad hoc, no historical migration found for it.
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE public.matches ADD CONSTRAINT matches_status_check
  CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled'));

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select" ON public.matches;
CREATE POLICY "matches_select" ON public.matches FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.travel_requests tr WHERE tr.id = travel_request_id AND (tr.user_id = auth.uid() OR is_admin())
  ) OR
  EXISTS (
    SELECT 1 FROM public.transport_offers tof WHERE tof.id = transport_offer_id AND (tof.user_id = auth.uid() OR is_admin())
  ) OR
  EXISTS (
    SELECT 1 FROM public.housing_offers ho WHERE ho.id = housing_offer_id AND (ho.user_id = auth.uid() OR is_admin())
  )
);

DROP POLICY IF EXISTS "matches_insert" ON public.matches;
CREATE POLICY "matches_insert" ON public.matches FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "matches_update" ON public.matches;
CREATE POLICY "matches_update" ON public.matches FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "matches_delete" ON public.matches;
CREATE POLICY "matches_delete" ON public.matches FOR DELETE USING (is_admin());
