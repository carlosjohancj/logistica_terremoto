-- No historical migration file was ever committed for this table (unlike
-- the others, which trace back to a deleted supabase/*.sql). Reconstructed
-- from the live schema (PostgREST introspection) only. RLS is inferred from
-- how the app actually queries it — app/api/service-providers/route.ts and
-- components/donate/providers-section.tsx read via the anon client (public
-- directory), while writes go through the service-role client gated by an
-- app-level `role === "admin"` check — so this mirrors the graphics table's
-- public-read/admin-write policy shape rather than replaying a real history.

CREATE TABLE IF NOT EXISTS public.service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  website text,
  donation_link text,
  contact_email text,
  contact_phone text,
  services text[],
  logo_url text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- No CHECK on status: only 'active' has ever been observed in the live data
-- and nothing in the app enforces a closed set, so a guessed constraint
-- here would risk being wrong rather than documenting real intent.

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_providers_select" ON public.service_providers;
CREATE POLICY "service_providers_select" ON public.service_providers FOR SELECT USING (status = 'active' OR is_admin());

DROP POLICY IF EXISTS "service_providers_insert" ON public.service_providers;
CREATE POLICY "service_providers_insert" ON public.service_providers FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "service_providers_update" ON public.service_providers;
CREATE POLICY "service_providers_update" ON public.service_providers FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "service_providers_delete" ON public.service_providers;
CREATE POLICY "service_providers_delete" ON public.service_providers FOR DELETE USING (is_admin());
