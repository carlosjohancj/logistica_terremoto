CREATE TABLE IF NOT EXISTS public.city_coords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  UNIQUE(city, state)
);

ALTER TABLE public.city_coords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "city_coords_select_all" ON public.city_coords
  FOR SELECT USING (true);

CREATE POLICY "city_coords_insert_all" ON public.city_coords
  FOR INSERT WITH CHECK (true);
