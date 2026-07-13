-- Reconstructed from supabase/seed.sql (git be0cc15), which is not tracked in
-- this repo (supabase/ is gitignored except this migrations/ folder). This is
-- the foundational table: auth.users -> profiles via a signup trigger.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  phone text,
  whatsapp text,
  role text NOT NULL DEFAULT 'damnificado',
  languages jsonb DEFAULT '[]'::jsonb,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  volunteer_type text,
  age integer
);

-- Superset of the roles ever introduced across the app's history (originally
-- only damnificado/transportista/anfitrion/donante/admin; voluntario and
-- organizacion were added later without ever updating this constraint,
-- which caused registration to fail with profiles_role_check violations).
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('damnificado','transportista','anfitrion','donante','voluntario','organizacion','admin'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_volunteer_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_volunteer_type_check
  CHECK (volunteer_type IN ('hospedaje', 'gestion', 'ambos') OR volunteer_type IS NULL);

-- is_admin() must come after the table it queries — LANGUAGE sql functions
-- are validated against the catalog at CREATE time, unlike plpgsql.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "profiles_insert_system" ON public.profiles;
CREATE POLICY "profiles_insert_system" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE USING (is_admin());

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'damnificado')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
