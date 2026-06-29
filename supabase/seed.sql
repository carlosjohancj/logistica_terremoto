-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  phone text,
  whatsapp text,
  role text NOT NULL DEFAULT 'damnificado' CHECK (role IN ('damnificado','transportista','anfitrion','donante','admin')),
  languages jsonb DEFAULT '[]'::jsonb,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_insert_system" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
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

-- Estados (Venezuelan states with municipalities and coords)
CREATE TABLE IF NOT EXISTS public.estados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capital text,
  municipios jsonb DEFAULT '[]'::jsonb,
  lat double precision DEFAULT 0,
  lng double precision DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.estados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estados_public" ON public.estados FOR SELECT USING (true);

-- Donation settings
CREATE TABLE IF NOT EXISTS public.donation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL CHECK (method IN ('bank','paypal','zelle')),
  label text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.donation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donation_settings_public" ON public.donation_settings FOR SELECT USING (true);

-- Travel requests
CREATE TABLE IF NOT EXISTS public.travel_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  has_destination boolean DEFAULT false,
  origin_state text NOT NULL,
  origin_municipality text NOT NULL,
  origin_city text NOT NULL,
  destination_state text,
  destination_municipality text,
  destination_city text,
  people_to_move integer NOT NULL CHECK (people_to_move > 0),
  people_to_house integer DEFAULT 0,
  children_count integer DEFAULT 0,
  adults_count integer DEFAULT 0,
  housing_destruction text NOT NULL CHECK (housing_destruction IN ('total','grave','se_puede_reparar','prestada_emergencia')),
  members jsonb DEFAULT '[]'::jsonb,
  registrant_type text NOT NULL CHECK (registrant_type IN ('damnificado','colaborador')),
  registrant_relation text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched_transport','matched_housing','completed','cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.travel_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "travel_requests_select" ON public.travel_requests FOR SELECT USING (status = 'open' OR auth.uid() = user_id OR is_admin());
CREATE POLICY "travel_requests_insert" ON public.travel_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "travel_requests_update" ON public.travel_requests FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "travel_requests_delete" ON public.travel_requests FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Transport offers
CREATE TABLE IF NOT EXISTS public.transport_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('moto','carro','camioneta','camion')),
  capacity integer NOT NULL CHECK (capacity > 0),
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
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','in_transit','completed','cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.transport_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transport_offers_select" ON public.transport_offers FOR SELECT USING (status = 'open' OR auth.uid() = user_id OR is_admin());
CREATE POLICY "transport_offers_insert" ON public.transport_offers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "transport_offers_update" ON public.transport_offers FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "transport_offers_delete" ON public.transport_offers FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Housing offers
CREATE TABLE IF NOT EXISTS public.housing_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  state text NOT NULL,
  municipality text NOT NULL,
  city text NOT NULL,
  address text,
  capacity integer NOT NULL CHECK (capacity > 0),
  max_stay_days integer NOT NULL CHECK (max_stay_days > 0),
  accepts_children boolean DEFAULT false,
  accepts_adults boolean DEFAULT false,
  accepts_families boolean DEFAULT false,
  has_furniture boolean DEFAULT false,
  has_kitchen boolean DEFAULT false,
  has_bathroom boolean DEFAULT false,
  notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','occupied','full','cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.housing_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "housing_offers_select" ON public.housing_offers FOR SELECT USING (status = 'open' OR auth.uid() = user_id OR is_admin());
CREATE POLICY "housing_offers_insert" ON public.housing_offers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "housing_offers_update" ON public.housing_offers FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "housing_offers_delete" ON public.housing_offers FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Donations
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  donor_name text,
  donor_contact text,
  amount double precision NOT NULL CHECK (amount >= 0),
  currency text NOT NULL CHECK (currency IN ('USD','VES','EUR')),
  payment_method text NOT NULL CHECK (payment_method IN ('bank_transfer','paypal','zelle','pago_movil','other')),
  target_type text NOT NULL CHECK (target_type IN ('general','transportista','familia','gasolina','hospedaje')),
  message text,
  confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donations_select" ON public.donations FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "donations_insert" ON public.donations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "donations_update" ON public.donations FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id uuid REFERENCES public.travel_requests(id) ON DELETE CASCADE,
  transport_offer_id uuid REFERENCES public.transport_offers(id) ON DELETE SET NULL,
  housing_offer_id uuid REFERENCES public.housing_offers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select" ON public.matches FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.travel_requests tr WHERE tr.id = travel_request_id AND (tr.user_id = auth.uid() OR is_admin())
  ) OR
  EXISTS (
    SELECT 1 FROM public.transport_offers tof WHERE tof.id = transport_offer_id AND (tof.user_id = auth.uid() OR is_admin())
  ) OR
  EXISTS (
    SELECT 1 FROM public.housing_offers ho WHERE ho.id = housing_offer_id AND (ho.user_id = auth.uid() OR is_admin())
  )
);
CREATE POLICY "matches_insert" ON public.matches FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "matches_update" ON public.matches FOR UPDATE USING (is_admin());
CREATE POLICY "matches_delete" ON public.matches FOR DELETE USING (is_admin());

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  category text NOT NULL CHECK (category IN ('transporte','hospedaje','colaboracion')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id OR is_admin());
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE USING (auth.uid() = from_user_id OR is_admin());
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE USING (is_admin());

-- Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  rif text,
  sector text CHECK (sector IN ('tecnologia','salud','educacion','construccion','comercio','transporte','alimentacion','servicios','otro')),
  state text,
  municipality text,
  city text,
  address text,
  description text,
  contact_name text NOT NULL,
  contact_phone text,
  contact_email text NOT NULL,
  website text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "companies_update" ON public.companies FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "companies_delete" ON public.companies FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  requirements text,
  location_state text NOT NULL,
  location_city text,
  modality text NOT NULL CHECK (modality IN ('presencial','remoto','hibrido')),
  salary_range text,
  contact_email text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','filled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_select" ON public.jobs FOR SELECT USING (status = 'open' OR auth.uid() IS NOT NULL);
CREATE POLICY "jobs_insert" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND (c.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "jobs_update" ON public.jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND (c.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "jobs_delete" ON public.jobs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND (c.user_id = auth.uid() OR is_admin()))
);

-- Supplies
CREATE TABLE IF NOT EXISTS public.supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('offer','request')),
  category text NOT NULL CHECK (category IN ('camas','comida','ropa','medicinas','agua','higiene','electronico','materiales','muebles','otros')),
  title text NOT NULL,
  description text,
  quantity integer DEFAULT 0,
  condition text CHECK (condition IN ('nuevo','usado_bueno','usado_regular','no_aplica')),
  state text NOT NULL,
  municipality text,
  city text,
  address text,
  contact_name text NOT NULL,
  contact_phone text,
  needs_transport boolean DEFAULT false,
  photos text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','completed','cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplies_select" ON public.supplies FOR SELECT USING (true);
CREATE POLICY "supplies_insert" ON public.supplies FOR INSERT WITH CHECK (true);
CREATE POLICY "supplies_update" ON public.supplies FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "supplies_delete" ON public.supplies FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Graphics
CREATE TABLE IF NOT EXISTS public.graphics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('flyer','infografia','banner','logo','manual','otro')),
  file text NOT NULL,
  thumbnail text,
  tags text,
  downloads integer DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.graphics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "graphics_select" ON public.graphics FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "graphics_insert" ON public.graphics FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "graphics_update" ON public.graphics FOR UPDATE USING (is_admin());
CREATE POLICY "graphics_delete" ON public.graphics FOR DELETE USING (is_admin());

-- Seed donation settings
INSERT INTO public.donation_settings (method, label, details, sort_order) VALUES
  ('bank', 'Transferencia Bancaria', '{"bank": "Banco de Venezuela", "account": "0102-XXXX-XXXX-XXXX", "holder": "Fundación Desde Cero", "rif": "J-XXXXXXXX-X"}'::jsonb, 1),
  ('paypal', 'PayPal', '{"email": "donaciones@desdecero.org"}'::jsonb, 2),
  ('zelle', 'Zelle', '{"email": "donaciones@desdecero.org", "holder": "Fundación Desde Cero"}'::jsonb, 3)
ON CONFLICT DO NOTHING;

-- Seed estados
INSERT INTO public.estados (name, capital, municipios, lat, lng) VALUES
  ('Amazonas', 'Puerto Ayacucho', '[{"municipio":"Alto Orinoco","ciudades":["La Esmeralda","Mavaca"]},{"municipio":"Atabapo","ciudades":["San Fernando de Atabapo"]},{"municipio":"Atures","ciudades":["Puerto Ayacucho"]},{"municipio":"Autana","ciudades":["Isla Ratón"]},{"municipio":"Manapiare","ciudades":["San Juan de Manapiare"]},{"municipio":"Maroa","ciudades":["Maroa"]},{"municipio":"Río Negro","ciudades":["San Carlos de Río Negro"]}]'::jsonb, 3.5, -66.5),
  ('Anzoátegui', 'Barcelona', '[{"municipio":"Anaco","ciudades":["Anaco"]},{"municipio":"Aragua","ciudades":["Aragua de Barcelona"]},{"municipio":"Bolívar","ciudades":["Barcelona"]},{"municipio":"Bruzual","ciudades":["Clarines"]},{"municipio":"Cajigal","ciudades":["Onoto"]},{"municipio":"Carvajal","ciudades":["Valle de Guanape"]},{"municipio":"Diego Bautista Urbaneja","ciudades":["Lechería"]},{"municipio":"Freites","ciudades":["Cantaura"]},{"municipio":"Guanipa","ciudades":["San José de Guanipa"]},{"municipio":"Guanta","ciudades":["Guanta"]},{"municipio":"Independencia","ciudades":["Soledad"]},{"municipio":"Libertad","ciudades":["San Mateo"]},{"municipio":"McGregor","ciudades":["El Chaparro"]},{"municipio":"Miranda","ciudades":["Pariaguán"]},{"municipio":"Monagas","ciudades":["Mapire"]},{"municipio":"Peñalver","ciudades":["Puerto Píritu"]},{"municipio":"Píritu","ciudades":["Píritu"]},{"municipio":"San Juan de Capistrano","ciudades":["Boca de Uchire"]},{"municipio":"Santa Ana","ciudades":["Santa Ana"]},{"municipio":"Simón Rodríguez","ciudades":["El Tigre"]},{"municipio":"Sotillo","ciudades":["Puerto La Cruz"]}]'::jsonb, 8.5, -64.5),
  ('Apure', 'San Fernando de Apure', '[{"municipio":"Achaguas","ciudades":["Achaguas"]},{"municipio":"Biruaca","ciudades":["Biruaca"]},{"municipio":"Muñoz","ciudades":["Bruzual"]},{"municipio":"Páez","ciudades":["Guasdualito"]},{"municipio":"Pedro Camejo","ciudades":["San Juan de Payara"]},{"municipio":"Rómulo Gallegos","ciudades":["Elorza"]},{"municipio":"San Fernando","ciudades":["San Fernando de Apure"]}]'::jsonb, 7.0, -68.5),
  ('Aragua', 'Maracay', '[{"municipio":"Bolívar","ciudades":["San Mateo"]},{"municipio":"Camatagua","ciudades":["Camatagua"]},{"municipio":"Francisco Linares Alcántara","ciudades":["Santa Rita"]},{"municipio":"Girardot","ciudades":["Maracay","Choroní"]},{"municipio":"José Ángel Lamas","ciudades":["Santa Cruz"]},{"municipio":"José Félix Ribas","ciudades":["La Victoria"]},{"municipio":"José Rafael Revenga","ciudades":["El Consejo"]},{"municipio":"Libertador","ciudades":["Palo Negro"]},{"municipio":"Mario Briceño Iragorry","ciudades":["El Limón"]},{"municipio":"Ocumare de la Costa de Oro","ciudades":["Ocumare de la Costa"]},{"municipio":"San Casimiro","ciudades":["San Casimiro"]},{"municipio":"San Sebastián","ciudades":["San Sebastián de los Reyes"]},{"municipio":"Santiago Mariño","ciudades":["Turmero"]},{"municipio":"Santos Michelena","ciudades":["Las Tejerías"]},{"municipio":"Sucre","ciudades":["Cagua"]},{"municipio":"Tovar","ciudades":["Colonia Tovar"]},{"municipio":"Urdaneta","ciudades":["Barbacoa"]},{"municipio":"Zamora","ciudades":["Villa de Cura"]}]'::jsonb, 10.2, -67.6),
  ('Barinas', 'Barinas', '[{"municipio":"Alberto Arvelo Torrealba","ciudades":["Sabaneta"]},{"municipio":"Andrés Eloy Blanco","ciudades":["El Cantón"]},{"municipio":"Antonio José de Sucre","ciudades":["Socopó"]},{"municipio":"Arismendi","ciudades":["Arismendi"]},{"municipio":"Barinas","ciudades":["Barinas"]},{"municipio":"Bolívar","ciudades":["Barinitas"]},{"municipio":"Cruz Paredes","ciudades":["Barrancas"]},{"municipio":"Ezequiel Zamora","ciudades":["Santa Bárbara"]},{"municipio":"Obispos","ciudades":["Obispos"]},{"municipio":"Pedraza","ciudades":["Ciudad Bolivia"]},{"municipio":"Rojas","ciudades":["Libertad"]},{"municipio":"Sosa","ciudades":["Ciudad de Nutrias"]}]'::jsonb, 8.5, -70.5),
  ('Bolívar', 'Ciudad Bolívar', '[{"municipio":"Caroní","ciudades":["Ciudad Guayana","Puerto Ordaz","San Félix"]},{"municipio":"Cedeño","ciudades":["Caicara del Orinoco"]},{"municipio":"El Callao","ciudades":["El Callao"]},{"municipio":"Gran Sabana","ciudades":["Santa Elena de Uairén"]},{"municipio":"Heres","ciudades":["Ciudad Bolívar"]},{"municipio":"Piar","ciudades":["Upata"]},{"municipio":"Raúl Leoni","ciudades":["Ciudad Piar"]},{"municipio":"Roscio","ciudades":["Guasipati"]},{"municipio":"Sifontes","ciudades":["Tumeremo"]},{"municipio":"Sucre","ciudades":["Maripa"]},{"municipio":"Padre Pedro Chien","ciudades":["El Palmar"]}]'::jsonb, 6.5, -63.5),
  ('Carabobo', 'Valencia', '[{"municipio":"Bejuma","ciudades":["Bejuma"]},{"municipio":"Carlos Arvelo","ciudades":["Güigüe"]},{"municipio":"Diego Ibarra","ciudades":["Mariara"]},{"municipio":"Guacara","ciudades":["Guacara"]},{"municipio":"Juan José Mora","ciudades":["Morón"]},{"municipio":"Libertador","ciudades":["Tocuyito"]},{"municipio":"Los Guayos","ciudades":["Los Guayos"]},{"municipio":"Miranda","ciudades":["Miranda"]},{"municipio":"Montalbán","ciudades":["Montalbán"]},{"municipio":"Naguanagua","ciudades":["Naguanagua"]},{"municipio":"Puerto Cabello","ciudades":["Puerto Cabello"]},{"municipio":"San Diego","ciudades":["San Diego"]},{"municipio":"San Joaquín","ciudades":["San Joaquín"]},{"municipio":"Valencia","ciudades":["Valencia"]}]'::jsonb, 10.2, -68.0),
  ('Cojedes', 'San Carlos', '[{"municipio":"Anzoátegui","ciudades":["Cojedes"]},{"municipio":"Ezequiel Zamora","ciudades":["San Carlos"]},{"municipio":"Falcón","ciudades":["Tinaquillo"]},{"municipio":"Girardot","ciudades":["El Baúl"]},{"municipio":"Lima Blanco","ciudades":["Macapo"]},{"municipio":"Pao de San Juan Bautista","ciudades":["El Pao"]},{"municipio":"Ricaurte","ciudades":["Libertad"]},{"municipio":"Rómulo Gallegos","ciudades":["Las Vegas"]}]'::jsonb, 9.5, -68.5),
  ('Delta Amacuro', 'Tucupita', '[{"municipio":"Antonio Díaz","ciudades":["Curiapo"]},{"municipio":"Casacoima","ciudades":["Sierra Imataca"]},{"municipio":"Pedernales","ciudades":["Pedernales"]},{"municipio":"Tucupita","ciudades":["Tucupita"]}]'::jsonb, 9.0, -61.5),
  ('Distrito Capital', 'Caracas', '[{"municipio":"Libertador","ciudades":["Caracas","El Junquito","Caricuao","Antímano","El Valle","La Vega","San Juan","Coche","San Pedro","El Paraíso","Santa Rosalía","Altagracia","La Pastora","23 de Enero","Sucre","San Bernardino","San José","San Agustín"]}]'::jsonb, 10.5, -66.9),
  ('Falcón', 'Coro', '[{"municipio":"Acosta","ciudades":["San Juan de los Cayos"]},{"municipio":"Bolívar","ciudades":["San Luis"]},{"municipio":"Buchivacoa","ciudades":["Capatárida"]},{"municipio":"Cacique Manaure","ciudades":["Yaracal"]},{"municipio":"Carirubana","ciudades":["Punto Fijo","Carirubana","Punta Cardón","Judeña"]},{"municipio":"Colina","ciudades":["La Vela de Coro"]},{"municipio":"Dabajuro","ciudades":["Dabajuro"]},{"municipio":"Democracia","ciudades":["Pedregal"]},{"municipio":"Falcón","ciudades":["Pueblo Nuevo"]},{"municipio":"Federación","ciudades":["Churuguara"]},{"municipio":"Jacura","ciudades":["Jacura"]},{"municipio":"Los Taques","ciudades":["Santa Cruz de Los Taques"]},{"municipio":"Mauroa","ciudades":["Mene de Mauroa"]},{"municipio":"Miranda","ciudades":["Coro","Miranda"]},{"municipio":"Monseñor Iturriza","ciudades":["San Francisco de Chichiriviche"]},{"municipio":"Palmasola","ciudades":["Palmasola"]},{"municipio":"Petit","ciudades":["Cabure"]},{"municipio":"Píritu","ciudades":["Píritu"]},{"municipio":"San Francisco","ciudades":["San Francisco de Caparo"]},{"municipio":"Silva","ciudades":["Tucacas"]},{"municipio":"Sucre","ciudades":["La Cruz de Taratara"]},{"municipio":"Tocópero","ciudades":["Tocópero"]},{"municipio":"Unión","ciudades":["Santa Cruz de Bucaral"]},{"municipio":"Urumaco","ciudades":["Urumaco"]},{"municipio":"Zamora","ciudades":["Puerto Cumarebo"]}]'::jsonb, 11.0, -69.5),
  ('Guárico', 'San Juan de los Morros', '[{"municipio":"Camaguán","ciudades":["Camaguán"]},{"municipio":"Chaguaramas","ciudades":["Chaguaramas"]},{"municipio":"El Socorro","ciudades":["El Socorro"]},{"municipio":"Francisco de Miranda","ciudades":["Calabozo"]},{"municipio":"José Félix Ribas","ciudades":["Tucupido"]},{"municipio":"José Tadeo Monagas","ciudades":["Altagracia de Orituco"]},{"municipio":"Juan Germán Roscio","ciudades":["San Juan de los Morros"]},{"municipio":"Julián Mellado","ciudades":["El Sombrero"]},{"municipio":"Las Mercedes","ciudades":["Las Mercedes del Llano"]},{"municipio":"Leonardo Infante","ciudades":["Valle de la Pascua"]},{"municipio":"Ortiz","ciudades":["Ortiz"]},{"municipio":"Pedro Zaraza","ciudades":["Zaraza"]},{"municipio":"San Gerónimo de Guayabal","ciudades":["Guayabal"]},{"municipio":"San José de Guaribe","ciudades":["San José de Guaribe"]},{"municipio":"Santa María de Ipire","ciudades":["Santa María de Ipire"]}]'::jsonb, 8.5, -67.0),
  ('La Guaira', 'La Guaira', '[{"municipio":"La Guaira","ciudades":["La Guaira","Maiquetía","Catia La Mar"]},{"municipio":"Carayaca","ciudades":["Carayaca"]},{"municipio":"Carlos Soublette","ciudades":["Las Tunitas"]},{"municipio":"Caruao","ciudades":["Caruao"]},{"municipio":"El Junko","ciudades":["El Junko"]},{"municipio":"Macuto","ciudades":["Macuto"]},{"municipio":"Naiguatá","ciudades":["Naiguatá"]},{"municipio":"Parroquia Urimare","ciudades":["Carlos Soublette"]},{"municipio":"Vargas","ciudades":["Vargas"]}]'::jsonb, 10.6, -66.9),
  ('Lara', 'Barquisimeto', '[{"municipio":"Andrés Eloy Blanco","ciudades":["Sanare"]},{"municipio":"Crespo","ciudades":["Duaca"]},{"municipio":"Iribarren","ciudades":["Barquisimeto"]},{"municipio":"Jiménez","ciudades":["Quíbor"]},{"municipio":"Morán","ciudades":["El Tocuyo"]},{"municipio":"Palavecino","ciudades":["Cabudare"]},{"municipio":"Simón Planas","ciudades":["Sarare"]},{"municipio":"Torres","ciudades":["Carora"]},{"municipio":"Urdaneta","ciudades":["Siquisique"]}]'::jsonb, 10.0, -69.5),
  ('Mérida', 'Mérida', '[{"municipio":"Alberto Adriani","ciudades":["El Vigía"]},{"municipio":"Andrés Bello","ciudades":["La Azulita"]},{"municipio":"Antonio Pinto Salinas","ciudades":["Santa Cruz de Mora"]},{"municipio":"Aricagua","ciudades":["Aricagua"]},{"municipio":"Arzobispo Chacón","ciudades":["Canaguá"]},{"municipio":"Campo Elías","ciudades":["Ejido"]},{"municipio":"Caracciolo Parra Olmedo","ciudades":["Tucaní"]},{"municipio":"Cardenal Quintero","ciudades":["Santo Domingo"]},{"municipio":"Guaraque","ciudades":["Guaraque"]},{"municipio":"Julio César Salas","ciudades":["Arapuey"]},{"municipio":"Justo Briceño","ciudades":["Torondoy"]},{"municipio":"Libertador","ciudades":["Mérida"]},{"municipio":"Miranda","ciudades":["Timotes"]},{"municipio":"Obispo Ramos de Lora","ciudades":["Santa Elena de Arenales"]},{"municipio":"Padre Noguera","ciudades":["Santa María de Caparo"]},{"municipio":"Pueblo Llano","ciudades":["Pueblo Llano"]},{"municipio":"Rangel","ciudades":["Mucuchíes"]},{"municipio":"Rivas Dávila","ciudades":["Bailadores"]},{"municipio":"Santos Marquina","ciudades":["Tabay"]},{"municipio":"Sucre","ciudades":["Lagunillas"]},{"municipio":"Tovar","ciudades":["Tovar"]},{"municipio":"Tulio Febres Cordero","ciudades":["Nueva Bolivia"]},{"municipio":"Zea","ciudades":["Zea"]}]'::jsonb, 8.5, -71.2),
  ('Miranda', 'Los Teques', '[{"municipio":"Acevedo","ciudades":["Caucagua"]},{"municipio":"Andrés Bello","ciudades":["San José de Barlovento"]},{"municipio":"Baruta","ciudades":["Baruta","El Cafetal","Las Minas","Prados del Este","Santa Fe"]},{"municipio":"Brión","ciudades":["Higuerote"]},{"municipio":"Buroz","ciudades":["Mamporal"]},{"municipio":"Carrizal","ciudades":["Carrizal"]},{"municipio":"Chacao","ciudades":["Chacao"]},{"municipio":"Cristóbal Rojas","ciudades":["Charallave"]},{"municipio":"El Hatillo","ciudades":["El Hatillo"]},{"municipio":"Guaicaipuro","ciudades":["Los Teques"]},{"municipio":"Independencia","ciudades":["Santa Teresa del Tuy"]},{"municipio":"Lander","ciudades":["Ocumare del Tuy"]},{"municipio":"Los Salias","ciudades":["San Antonio de los Altos"]},{"municipio":"Páez","ciudades":["Río Chico"]},{"municipio":"Paz Castillo","ciudades":["Santa Lucía"]},{"municipio":"Pedro Gual","ciudades":["Cúpira"]},{"municipio":"Plaza","ciudades":["Guarenas"]},{"municipio":"Simón Bolívar","ciudades":["San Francisco de Yare"]},{"municipio":"Sucre","ciudades":["Petare","Caucagüita","Filas de Mariche","La Dolorita","Leoncio Martínez","Los Dos Caminos"]},{"municipio":"Urdaneta","ciudades":["Cúa"]},{"municipio":"Zamora","ciudades":["Guatire"]}]'::jsonb, 10.2, -66.6),
  ('Monagas', 'Maturín', '[{"municipio":"Acosta","ciudades":["San Antonio de Capayacuar"]},{"municipio":"Aguasay","ciudades":["Aguasay"]},{"municipio":"Bolívar","ciudades":["Caripito"]},{"municipio":"Caripe","ciudades":["Caripe"]},{"municipio":"Cedeño","ciudades":["Caicara de Maturín"]},{"municipio":"Ezequiel Zamora","ciudades":["Punta de Mata"]},{"municipio":"Libertador","ciudades":["Temblador"]},{"municipio":"Maturín","ciudades":["Maturín"]},{"municipio":"Piar","ciudades":["Aragua de Maturín"]},{"municipio":"Punceres","ciudades":["Quiriquire"]},{"municipio":"Santa Bárbara","ciudades":["Santa Bárbara"]},{"municipio":"Sotillo","ciudades":["Barrancas del Orinoco"]},{"municipio":"Uracoa","ciudades":["Uracoa"]}]'::jsonb, 9.5, -63.0),
  ('Nueva Esparta', 'La Asunción', '[{"municipio":"Antolín del Campo","ciudades":["La Plaza de Paraguachí"]},{"municipio":"Arismendi","ciudades":["La Asunción"]},{"municipio":"Díaz","ciudades":["San Juan Bautista"]},{"municipio":"García","ciudades":["El Valle del Espíritu Santo"]},{"municipio":"Gómez","ciudades":["Santa Ana"]},{"municipio":"Maneiro","ciudades":["Pampatar"]},{"municipio":"Marcano","ciudades":["Juan Griego"]},{"municipio":"Mariño","ciudades":["Porlamar"]},{"municipio":"Península de Macanao","ciudades":["Boca de Río"]},{"municipio":"Tubores","ciudades":["Punta de Piedras"]},{"municipio":"Villalba","ciudades":["San Pedro de Coche"]}]'::jsonb, 11.0, -64.0),
  ('Portuguesa', 'Guanare', '[{"municipio":"Agua Blanca","ciudades":["Agua Blanca"]},{"municipio":"Araure","ciudades":["Araure","Acarigua"]},{"municipio":"Esteller","ciudades":["Píritu"]},{"municipio":"Guanare","ciudades":["Guanare"]},{"municipio":"Guanarito","ciudades":["Guanarito"]},{"municipio":"Monseñor José Vicente de Unda","ciudades":["Paraíso de Chabasquén"]},{"municipio":"Ospino","ciudades":["Ospino"]},{"municipio":"Páez","ciudades":["Acarigua"]},{"municipio":"Papelón","ciudades":["Papelón"]},{"municipio":"San Genaro de Boconoíto","ciudades":["Boconoíto"]},{"municipio":"San Rafael de Onoto","ciudades":["San Rafael de Onoto"]},{"municipio":"Santa Rosalía","ciudades":["El Playón"]},{"municipio":"Sucre","ciudades":["Biscucuy"]},{"municipio":"Turén","ciudades":["Villa Bruzual"]}]'::jsonb, 9.0, -69.0),
  ('Sucre', 'Cumaná', '[{"municipio":"Andrés Eloy Blanco","ciudades":["Casanay"]},{"municipio":"Andrés Mata","ciudades":["San José de Aerocual"]},{"municipio":"Arismendi","ciudades":["Río Caribe"]},{"municipio":"Benítez","ciudades":["El Pilar"]},{"municipio":"Bermúdez","ciudades":["Carúpano"]},{"municipio":"Bolívar","ciudades":["Marigüitar"]},{"municipio":"Cajigal","ciudades":["Yaguaraparo"]},{"municipio":"Cruz Salmerón Acosta","ciudades":["Araya"]},{"municipio":"Libertador","ciudades":["Tunapuy"]},{"municipio":"Mariño","ciudades":["Irapa"]},{"municipio":"Maturín","ciudades":["Santa María"]},{"municipio":"Mejía","ciudades":["San Antonio del Golfo"]},{"municipio":"Montes","ciudades":["Cumanacoa"]},{"municipio":"Ribero","ciudades":["Cariaco"]},{"municipio":"Sucre","ciudades":["Cumaná"]},{"municipio":"Valdez","ciudades":["Güiria"]}]'::jsonb, 10.5, -63.5),
  ('Táchira', 'San Cristóbal', '[{"municipio":"Andrés Bello","ciudades":["Cordero"]},{"municipio":"Antonio Rómulo Costa","ciudades":["Las Mesas"]},{"municipio":"Ayacucho","ciudades":["Colón"]},{"municipio":"Bolívar","ciudades":["San Antonio del Táchira"]},{"municipio":"Cárdenas","ciudades":["Táriba"]},{"municipio":"Córdoba","ciudades":["Santa Ana del Táchira"]},{"municipio":"Fernández Feo","ciudades":["San Lorenzo"]},{"municipio":"Francisco de Miranda","ciudades":["San José de Bolívar"]},{"municipio":"García de Hevia","ciudades":["La Fría"]},{"municipio":"Guásimos","ciudades":["Palmira"]},{"municipio":"Independencia","ciudades":["Capacho Viejo"]},{"municipio":"Jaureguí","ciudades":["La Grita"]},{"municipio":"José María Vargas","ciudades":["El Cobre"]},{"municipio":"Junín","ciudades":["Rubio"]},{"municipio":"Libertad","ciudades":["Capacho Nuevo"]},{"municipio":"Libertador","ciudades":["Abejales"]},{"municipio":"Lobatera","ciudades":["Lobatera"]},{"municipio":"Michelena","ciudades":["Michelena"]},{"municipio":"Panamericano","ciudades":["Coloncito"]},{"municipio":"Pedro María Ureña","ciudades":["Ureña"]},{"municipio":"Rafael Urdaneta","ciudades":["Delicias"]},{"municipio":"Samuel Darío Maldonado","ciudades":["La Tendida"]},{"municipio":"San Cristóbal","ciudades":["San Cristóbal"]},{"municipio":"San Judas Tadeo","ciudades":["Umuquena"]},{"municipio":"Seboruco","ciudades":["Seboruco"]},{"municipio":"Simón Rodríguez","ciudades":["San Simón"]},{"municipio":"Sucre","ciudades":["Queniquea"]},{"municipio":"Torbes","ciudades":["San Josecito"]},{"municipio":"Uribante","ciudades":["Pregonero"]}]'::jsonb, 7.5, -72.0),
  ('Trujillo', 'Trujillo', '[{"municipio":"Andrés Bello","ciudades":["Santa Isabel"]},{"municipio":"Boconó","ciudades":["Boconó"]},{"municipio":"Bolívar","ciudades":["Sabana Grande"]},{"municipio":"Candelaria","ciudades":["Chejendé"]},{"municipio":"Carache","ciudades":["Carache"]},{"municipio":"Escuque","ciudades":["Escuque"]},{"municipio":"José Felipe Márquez Cañizales","ciudades":["El Paradero"]},{"municipio":"Juan Vicente Campo Elías","ciudades":["Campo Elías"]},{"municipio":"La Ceiba","ciudades":["Santa Apolonia"]},{"municipio":"Miranda","ciudades":["El Dividive"]},{"municipio":"Monte Carmelo","ciudades":["Monte Carmelo"]},{"municipio":"Motatán","ciudades":["Motatán"]},{"municipio":"Pampán","ciudades":["Pampán"]},{"municipio":"Pampanito","ciudades":["Pampanito"]},{"municipio":"Rafael Rangel","ciudades":["Betijoque"]},{"municipio":"San Rafael de Carvajal","ciudades":["Carvajal"]},{"municipio":"Sucre","ciudades":["Sabana de Mendoza"]},{"municipio":"Trujillo","ciudades":["Trujillo"]},{"municipio":"Urdaneta","ciudades":["La Quebrada"]},{"municipio":"Valera","ciudades":["Valera"]}]'::jsonb, 9.5, -70.5),
  ('Yaracuy', 'San Felipe', '[{"municipio":"Arístides Bastidas","ciudades":["San Pablo"]},{"municipio":"Bolívar","ciudades":["Aroa"]},{"municipio":"Bruzual","ciudades":["Chivacoa"]},{"municipio":"Cocorote","ciudades":["Cocorote"]},{"municipio":"Independencia","ciudades":["Independencia"]},{"municipio":"José Antonio Páez","ciudades":["Sabana de Parra"]},{"municipio":"La Trinidad","ciudades":["Boraure"]},{"municipio":"Manuel Monge","ciudades":["Yumare"]},{"municipio":"Nirgua","ciudades":["Nirgua"]},{"municipio":"Peña","ciudades":["Yaritagua"]},{"municipio":"San Felipe","ciudades":["San Felipe"]},{"municipio":"Sucre","ciudades":["Guama"]},{"municipio":"Urachiche","ciudades":["Urachiche"]},{"municipio":"Veroes","ciudades":["Farriar"]}]'::jsonb, 10.3, -68.5),
  ('Zulia', 'Maracaibo', '[{"municipio":"Almirante Padilla","ciudades":["El Toro"]},{"municipio":"Baralt","ciudades":["San Timoteo"]},{"municipio":"Cabimas","ciudades":["Cabimas"]},{"municipio":"Catatumbo","ciudades":["Encontrados"]},{"municipio":"Colón","ciudades":["San Carlos del Zulia"]},{"municipio":"Francisco Javier Pulgar","ciudades":["Pueblo Nuevo"]},{"municipio":"Jesús Enrique Lossada","ciudades":["La Concepción"]},{"municipio":"Jesús María Semprún","ciudades":["Casigua El Cubo"]},{"municipio":"La Cañada de Urdaneta","ciudades":["Concepción"]},{"municipio":"Lagunillas","ciudades":["Ciudad Ojeda"]},{"municipio":"Machiques de Perijá","ciudades":["Machiques"]},{"municipio":"Mara","ciudades":["San Rafael del Moján"]},{"municipio":"Maracaibo","ciudades":["Maracaibo"]},{"municipio":"Miranda","ciudades":["Los Puertos de Altagracia"]},{"municipio":"Páez","ciudades":["Sinamaica"]},{"municipio":"Rosario de Perijá","ciudades":["La Villa del Rosario"]},{"municipio":"San Francisco","ciudades":["San Francisco"]},{"municipio":"Santa Rita","ciudades":["Santa Rita"]},{"municipio":"Simón Bolívar","ciudades":["Tía Juana"]},{"municipio":"Sucre","ciudades":["Bobures"]},{"municipio":"Valmore Rodríguez","ciudades":["Bachaquero"]}]'::jsonb, 10.5, -72.0)
ON CONFLICT DO NOTHING;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('graphics', 'graphics', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('supplies', 'supplies', true) ON CONFLICT DO NOTHING;
