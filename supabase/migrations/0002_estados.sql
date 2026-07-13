-- Reconstructed from supabase/seed.sql (git be0cc15). Reference data:
-- Venezuela's 24 states with municipios/ciudades as jsonb. Seed rows are
-- intentionally omitted here since the live table already has all 24 rows;
-- re-seeding is a no-op via ON CONFLICT DO NOTHING but the literal is huge,
-- so it's kept out of version control to keep this migration reviewable.

CREATE TABLE IF NOT EXISTS public.estados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capital text,
  municipios jsonb DEFAULT '[]'::jsonb,
  lat double precision DEFAULT 0,
  lng double precision DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.estados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "estados_public" ON public.estados;
CREATE POLICY "estados_public" ON public.estados FOR SELECT USING (true);
