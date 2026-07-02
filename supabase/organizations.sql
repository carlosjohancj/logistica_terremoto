CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, member_id)
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_admin" ON public.organizations
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "org_select_member" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.organization_members WHERE member_id = auth.uid()
    )
  );

CREATE POLICY "org_insert" ON public.organizations
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "org_update_admin" ON public.organizations
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "org_member_select" ON public.organization_members
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "org_member_select_admin" ON public.organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "org_member_insert_admin" ON public.organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE admin_id = auth.uid()
    )
  );
