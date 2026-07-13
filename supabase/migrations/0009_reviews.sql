-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  comment text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_check
  CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_category_check;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_category_check
  CHECK (category IN ('transporte','hospedaje','colaboracion'));

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id OR is_admin());

DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "reviews_update" ON public.reviews;
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE USING (auth.uid() = from_user_id OR is_admin());

DROP POLICY IF EXISTS "reviews_delete" ON public.reviews;
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE USING (is_admin());
