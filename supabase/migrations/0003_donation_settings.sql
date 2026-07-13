-- Reconstructed from supabase/seed.sql (git be0cc15). Seed rows (bank/paypal/
-- zelle) are omitted since the live table already has its 3 rows and the
-- actual account details shouldn't be hardcoded into a tracked migration.

CREATE TABLE IF NOT EXISTS public.donation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL,
  label text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.donation_settings DROP CONSTRAINT IF EXISTS donation_settings_method_check;
ALTER TABLE public.donation_settings ADD CONSTRAINT donation_settings_method_check
  CHECK (method IN ('bank','paypal','zelle'));

ALTER TABLE public.donation_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donation_settings_public" ON public.donation_settings;
CREATE POLICY "donation_settings_public" ON public.donation_settings FOR SELECT USING (true);
