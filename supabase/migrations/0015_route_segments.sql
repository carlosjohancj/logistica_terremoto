-- Reconstructed from supabase/route-segments.sql (git 7ca28af), plus three
-- columns present in the live schema but absent from that file (added later
-- for the Valhalla routing integration with no historical migration found).

CREATE TABLE IF NOT EXISTS public.route_segments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  transportista_id uuid REFERENCES public.profiles(id),
  travel_request_id uuid REFERENCES public.travel_requests(id) ON DELETE CASCADE,
  origin_city text NOT NULL,
  origin_state text NOT NULL,
  origin_lat decimal,
  origin_lng decimal,
  destination_city text NOT NULL,
  destination_state text NOT NULL,
  destination_lat decimal,
  destination_lng decimal,
  distance_km decimal,
  "order" integer NOT NULL DEFAULT 1,
  is_full_route boolean DEFAULT false,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.route_segments ADD COLUMN IF NOT EXISTS route_geometry jsonb;
ALTER TABLE public.route_segments ADD COLUMN IF NOT EXISTS scheduled_date date;
ALTER TABLE public.route_segments ADD COLUMN IF NOT EXISTS estimated_hours real;

ALTER TABLE public.route_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "route_segments_select_participant" ON public.route_segments;
CREATE POLICY "route_segments_select_participant" ON public.route_segments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT transportista_id FROM public.route_segments WHERE id = id
      UNION
      SELECT tr.user_id FROM public.travel_requests tr
      WHERE tr.id = travel_request_id
    )
  );

DROP POLICY IF EXISTS "route_segments_insert" ON public.route_segments;
CREATE POLICY "route_segments_insert" ON public.route_segments
  FOR INSERT WITH CHECK (auth.uid() = transportista_id);
