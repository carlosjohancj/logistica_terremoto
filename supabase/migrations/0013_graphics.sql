-- Reconstructed from supabase/seed.sql (git be0cc15), including the storage
-- buckets it seeded for graphics/supplies uploads.

CREATE TABLE IF NOT EXISTS public.graphics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  file text NOT NULL,
  thumbnail text,
  tags text,
  downloads integer DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.graphics DROP CONSTRAINT IF EXISTS graphics_category_check;
ALTER TABLE public.graphics ADD CONSTRAINT graphics_category_check
  CHECK (category IN ('flyer','infografia','banner','logo','manual','otro'));

ALTER TABLE public.graphics DROP CONSTRAINT IF EXISTS graphics_status_check;
ALTER TABLE public.graphics ADD CONSTRAINT graphics_status_check
  CHECK (status IN ('published','draft'));

ALTER TABLE public.graphics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "graphics_select" ON public.graphics;
CREATE POLICY "graphics_select" ON public.graphics FOR SELECT USING (status = 'published' OR is_admin());

DROP POLICY IF EXISTS "graphics_insert" ON public.graphics;
CREATE POLICY "graphics_insert" ON public.graphics FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "graphics_update" ON public.graphics;
CREATE POLICY "graphics_update" ON public.graphics FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "graphics_delete" ON public.graphics;
CREATE POLICY "graphics_delete" ON public.graphics FOR DELETE USING (is_admin());

INSERT INTO storage.buckets (id, name, public) VALUES ('graphics', 'graphics', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('supplies', 'supplies', true) ON CONFLICT DO NOTHING;
