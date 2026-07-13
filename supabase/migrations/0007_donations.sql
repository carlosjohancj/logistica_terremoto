-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  donor_name text,
  donor_contact text,
  amount double precision NOT NULL,
  currency text NOT NULL,
  payment_method text NOT NULL,
  target_type text NOT NULL,
  message text,
  confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_amount_check;
ALTER TABLE public.donations ADD CONSTRAINT donations_amount_check
  CHECK (amount >= 0);

ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_currency_check;
ALTER TABLE public.donations ADD CONSTRAINT donations_currency_check
  CHECK (currency IN ('USD','VES','EUR'));

ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_payment_method_check;
ALTER TABLE public.donations ADD CONSTRAINT donations_payment_method_check
  CHECK (payment_method IN ('bank_transfer','paypal','zelle','pago_movil','other'));

ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_target_type_check;
ALTER TABLE public.donations ADD CONSTRAINT donations_target_type_check
  CHECK (target_type IN ('general','transportista','familia','gasolina','hospedaje'));

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donations_select" ON public.donations;
CREATE POLICY "donations_select" ON public.donations FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "donations_insert" ON public.donations;
CREATE POLICY "donations_insert" ON public.donations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "donations_update" ON public.donations;
CREATE POLICY "donations_update" ON public.donations FOR UPDATE USING (auth.uid() = user_id OR is_admin());
