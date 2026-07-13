-- Reconstructed from supabase/organizations.sql (git 99a3675).

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  contact_email text,
  contact_phone text,
  logo_url text,
  admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, member_id)
);

ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_role_check;
ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_role_check
  CHECK (role IN ('admin', 'member'));

ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_status_check;
ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_status_check
  CHECK (status IN ('active', 'invited'));

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_select_admin" ON public.organizations;
CREATE POLICY "org_select_admin" ON public.organizations
  FOR SELECT USING (admin_id = auth.uid());

DROP POLICY IF EXISTS "org_select_member" ON public.organizations;
CREATE POLICY "org_select_member" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.organization_members WHERE member_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "org_insert" ON public.organizations;
CREATE POLICY "org_insert" ON public.organizations
  FOR INSERT WITH CHECK (admin_id = auth.uid());

DROP POLICY IF EXISTS "org_update_admin" ON public.organizations;
CREATE POLICY "org_update_admin" ON public.organizations
  FOR UPDATE USING (admin_id = auth.uid());

DROP POLICY IF EXISTS "org_member_select" ON public.organization_members;
CREATE POLICY "org_member_select" ON public.organization_members
  FOR SELECT USING (member_id = auth.uid());

DROP POLICY IF EXISTS "org_member_select_admin" ON public.organization_members;
CREATE POLICY "org_member_select_admin" ON public.organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE admin_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "org_member_insert_admin" ON public.organization_members;
CREATE POLICY "org_member_insert_admin" ON public.organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE admin_id = auth.uid()
    )
  );
