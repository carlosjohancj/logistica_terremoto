-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  requirements text,
  location_state text NOT NULL,
  location_city text,
  modality text NOT NULL,
  salary_range text,
  contact_email text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_modality_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_modality_check
  CHECK (modality IN ('presencial','remoto','hibrido'));

ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('open','closed','filled'));

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select" ON public.jobs;
CREATE POLICY "jobs_select" ON public.jobs FOR SELECT USING (status = 'open' OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "jobs_insert" ON public.jobs;
CREATE POLICY "jobs_insert" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND (c.user_id = auth.uid() OR is_admin()))
);

DROP POLICY IF EXISTS "jobs_update" ON public.jobs;
CREATE POLICY "jobs_update" ON public.jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND (c.user_id = auth.uid() OR is_admin()))
);

DROP POLICY IF EXISTS "jobs_delete" ON public.jobs;
CREATE POLICY "jobs_delete" ON public.jobs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND (c.user_id = auth.uid() OR is_admin()))
);
