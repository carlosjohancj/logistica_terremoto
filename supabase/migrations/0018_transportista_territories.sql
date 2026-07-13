-- Reconstructed from sql/transportista-territories.sql (git cd0b5d1).
-- Allows transportistas to define circular zones of operation on a map,
-- used for filtering available travel requests by geographic coverage.

CREATE TABLE IF NOT EXISTS public.transportista_territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  center_lat double precision NOT NULL,
  center_lng double precision NOT NULL,
  radius_km double precision NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transportista_territories_user_id ON public.transportista_territories(user_id);

ALTER TABLE public.transportista_territories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own territories" ON public.transportista_territories;
CREATE POLICY "Users can view their own territories"
  ON public.transportista_territories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own territories" ON public.transportista_territories;
CREATE POLICY "Users can insert their own territories"
  ON public.transportista_territories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own territories" ON public.transportista_territories;
CREATE POLICY "Users can delete their own territories"
  ON public.transportista_territories FOR DELETE
  USING (auth.uid() = user_id);
