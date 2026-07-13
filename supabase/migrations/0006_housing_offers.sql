-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.housing_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  state text NOT NULL,
  municipality text NOT NULL,
  city text NOT NULL,
  address text,
  capacity integer NOT NULL,
  max_stay_days integer NOT NULL,
  accepts_children boolean DEFAULT false,
  accepts_adults boolean DEFAULT false,
  accepts_families boolean DEFAULT false,
  has_furniture boolean DEFAULT false,
  has_kitchen boolean DEFAULT false,
  has_bathroom boolean DEFAULT false,
  notes text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.housing_offers DROP CONSTRAINT IF EXISTS housing_offers_capacity_check;
ALTER TABLE public.housing_offers ADD CONSTRAINT housing_offers_capacity_check
  CHECK (capacity > 0);

ALTER TABLE public.housing_offers DROP CONSTRAINT IF EXISTS housing_offers_max_stay_days_check;
ALTER TABLE public.housing_offers ADD CONSTRAINT housing_offers_max_stay_days_check
  CHECK (max_stay_days > 0);

ALTER TABLE public.housing_offers DROP CONSTRAINT IF EXISTS housing_offers_status_check;
ALTER TABLE public.housing_offers ADD CONSTRAINT housing_offers_status_check
  CHECK (status IN ('open','occupied','full','cancelled'));

ALTER TABLE public.housing_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "housing_offers_select" ON public.housing_offers;
CREATE POLICY "housing_offers_select" ON public.housing_offers FOR SELECT USING (status = 'open' OR auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "housing_offers_insert" ON public.housing_offers;
CREATE POLICY "housing_offers_insert" ON public.housing_offers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "housing_offers_update" ON public.housing_offers;
CREATE POLICY "housing_offers_update" ON public.housing_offers FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "housing_offers_delete" ON public.housing_offers;
CREATE POLICY "housing_offers_delete" ON public.housing_offers FOR DELETE USING (auth.uid() = user_id OR is_admin());
