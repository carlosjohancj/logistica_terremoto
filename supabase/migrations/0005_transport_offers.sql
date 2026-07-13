-- Reconstructed from supabase/seed.sql (git be0cc15).

CREATE TABLE IF NOT EXISTS public.transport_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  vehicle_type text NOT NULL,
  capacity integer NOT NULL,
  origin_state text NOT NULL,
  origin_municipality text NOT NULL,
  origin_city text NOT NULL,
  destination_state text NOT NULL,
  destination_municipality text NOT NULL,
  destination_city text NOT NULL,
  available_from timestamptz,
  available_until timestamptz,
  flexible_date boolean DEFAULT false,
  needs_gas_donation boolean DEFAULT false,
  gas_donation_amount double precision,
  accepts_passengers boolean DEFAULT false,
  accepts_cargo boolean DEFAULT false,
  notes text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.transport_offers DROP CONSTRAINT IF EXISTS transport_offers_vehicle_type_check;
ALTER TABLE public.transport_offers ADD CONSTRAINT transport_offers_vehicle_type_check
  CHECK (vehicle_type IN ('moto','carro','camioneta','camion'));

ALTER TABLE public.transport_offers DROP CONSTRAINT IF EXISTS transport_offers_capacity_check;
ALTER TABLE public.transport_offers ADD CONSTRAINT transport_offers_capacity_check
  CHECK (capacity > 0);

ALTER TABLE public.transport_offers DROP CONSTRAINT IF EXISTS transport_offers_status_check;
ALTER TABLE public.transport_offers ADD CONSTRAINT transport_offers_status_check
  CHECK (status IN ('open','matched','in_transit','completed','cancelled'));

ALTER TABLE public.transport_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transport_offers_select" ON public.transport_offers;
CREATE POLICY "transport_offers_select" ON public.transport_offers FOR SELECT USING (status = 'open' OR auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "transport_offers_insert" ON public.transport_offers;
CREATE POLICY "transport_offers_insert" ON public.transport_offers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "transport_offers_update" ON public.transport_offers;
CREATE POLICY "transport_offers_update" ON public.transport_offers FOR UPDATE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "transport_offers_delete" ON public.transport_offers;
CREATE POLICY "transport_offers_delete" ON public.transport_offers FOR DELETE USING (auth.uid() = user_id OR is_admin());
