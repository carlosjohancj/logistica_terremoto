-- Reconstructed from supabase/city-coords.sql (git 7ca28af).
-- Populated by re-geocoding estados' cities against Nominatim; see the
-- geocode script run alongside this migration set. Live table is currently
-- empty and needs that data uploaded separately from this DDL.

CREATE TABLE IF NOT EXISTS public.city_coords (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  city text NOT NULL,
  state text NOT NULL,
  lat decimal NOT NULL,
  lng decimal NOT NULL,
  UNIQUE(city, state)
);

ALTER TABLE public.city_coords ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "city_coords_select_all" ON public.city_coords;
CREATE POLICY "city_coords_select_all" ON public.city_coords FOR SELECT USING (true);

DROP POLICY IF EXISTS "city_coords_insert_all" ON public.city_coords;
CREATE POLICY "city_coords_insert_all" ON public.city_coords FOR INSERT WITH CHECK (true);
