-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  quantity integer DEFAULT 0,
  condition text,
  state text NOT NULL,
  municipality text,
  city text,
  address text,
  contact_name text NOT NULL,
  contact_phone text,
  needs_transport boolean DEFAULT false,
  photos text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.supplies DROP CONSTRAINT IF EXISTS supplies_type_check;
ALTER TABLE public.supplies ADD CONSTRAINT supplies_type_check
  CHECK (type IN ('offer','request'));

ALTER TABLE public.supplies DROP CONSTRAINT IF EXISTS supplies_category_check;
ALTER TABLE public.supplies ADD CONSTRAINT supplies_category_check
  CHECK (category IN ('camas','comida','ropa','medicinas','agua','higiene','electronico','materiales','muebles','otros'));

ALTER TABLE public.supplies DROP CONSTRAINT IF EXISTS supplies_condition_check;
ALTER TABLE public.supplies ADD CONSTRAINT supplies_condition_check
  CHECK (condition IN ('nuevo','usado_bueno','usado_regular','no_aplica') OR condition IS NULL);

ALTER TABLE public.supplies DROP CONSTRAINT IF EXISTS supplies_status_check;
ALTER TABLE public.supplies ADD CONSTRAINT supplies_status_check
  CHECK (status IN ('open','matched','completed','cancelled'));

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "supplies_select" ON public.supplies;
CREATE POLICY "supplies_select" ON public.supplies FOR SELECT USING (true);

DROP POLICY IF EXISTS "supplies_insert" ON public.supplies;
CREATE POLICY "supplies_insert" ON public.supplies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "supplies_update" ON public.supplies;
CREATE POLICY "supplies_update" ON public.supplies FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "supplies_delete" ON public.supplies;
CREATE POLICY "supplies_delete" ON public.supplies FOR DELETE USING (auth.uid() = user_id OR is_admin());
