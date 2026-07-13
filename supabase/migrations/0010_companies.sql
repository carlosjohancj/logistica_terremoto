-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  rif text,
  sector text,
  state text,
  municipality text,
  city text,
  address text,
  description text,
  contact_name text NOT NULL,
  contact_phone text,
  contact_email text NOT NULL,
  website text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_sector_check;
ALTER TABLE public.companies ADD CONSTRAINT companies_sector_check
  CHECK (sector IN ('tecnologia','salud','educacion','construccion','comercio','transporte','alimentacion','servicios','otro') OR sector IS NULL);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_select" ON public.companies;
CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "companies_insert" ON public.companies;
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "companies_update" ON public.companies;
CREATE POLICY "companies_update" ON public.companies FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "companies_delete" ON public.companies;
CREATE POLICY "companies_delete" ON public.companies FOR DELETE USING (auth.uid() = user_id OR is_admin());
