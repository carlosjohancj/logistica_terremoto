CREATE TABLE IF NOT EXISTS public.route_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  transportista_id UUID REFERENCES public.profiles(id),
  travel_request_id UUID REFERENCES public.travel_requests(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  origin_lat DECIMAL,
  origin_lng DECIMAL,
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  destination_lat DECIMAL,
  destination_lng DECIMAL,
  distance_km DECIMAL,
  "order" INTEGER NOT NULL DEFAULT 1,
  is_full_route BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.route_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "route_segments_select_participant" ON public.route_segments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT transportista_id FROM public.route_segments WHERE id = id
      UNION
      SELECT tr.user_id FROM public.travel_requests tr
      WHERE tr.id = travel_request_id
    )
  );

CREATE POLICY "route_segments_insert" ON public.route_segments
  FOR INSERT WITH CHECK (auth.uid() = transportista_id);
