-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.travel_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  has_destination boolean DEFAULT false,
  origin_state text NOT NULL,
  origin_municipality text NOT NULL,
  origin_city text NOT NULL,
  destination_state text,
  destination_municipality text,
  destination_city text,
  people_to_move integer NOT NULL,
  people_to_house integer DEFAULT 0,
  children_count integer DEFAULT 0,
  adults_count integer DEFAULT 0,
  housing_destruction text NOT NULL,
  members jsonb DEFAULT '[]'::jsonb,
  registrant_type text NOT NULL,
  registrant_relation text,
  status text NOT NULL DEFAULT 'open',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.travel_requests DROP CONSTRAINT IF EXISTS travel_requests_people_to_move_check;
ALTER TABLE public.travel_requests ADD CONSTRAINT travel_requests_people_to_move_check
  CHECK (people_to_move > 0);

ALTER TABLE public.travel_requests DROP CONSTRAINT IF EXISTS travel_requests_housing_destruction_check;
ALTER TABLE public.travel_requests ADD CONSTRAINT travel_requests_housing_destruction_check
  CHECK (housing_destruction IN ('total','grave','se_puede_reparar','prestada_emergencia'));

ALTER TABLE public.travel_requests DROP CONSTRAINT IF EXISTS travel_requests_registrant_type_check;
ALTER TABLE public.travel_requests ADD CONSTRAINT travel_requests_registrant_type_check
  CHECK (registrant_type IN ('damnificado','colaborador'));

ALTER TABLE public.travel_requests DROP CONSTRAINT IF EXISTS travel_requests_status_check;
ALTER TABLE public.travel_requests ADD CONSTRAINT travel_requests_status_check
  CHECK (status IN ('open','matched_transport','matched_housing','completed','cancelled'));

ALTER TABLE public.travel_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "travel_requests_select" ON public.travel_requests;
CREATE POLICY "travel_requests_select" ON public.travel_requests FOR SELECT USING (status = 'open' OR auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "travel_requests_insert" ON public.travel_requests;
CREATE POLICY "travel_requests_insert" ON public.travel_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "travel_requests_update" ON public.travel_requests;
CREATE POLICY "travel_requests_update" ON public.travel_requests FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "travel_requests_delete" ON public.travel_requests;
CREATE POLICY "travel_requests_delete" ON public.travel_requests FOR DELETE USING (auth.uid() = user_id OR is_admin());
