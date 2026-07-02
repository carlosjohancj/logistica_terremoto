ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS volunteer_type TEXT DEFAULT NULL
CHECK (volunteer_type IN ('hospedaje', 'gestion', 'ambos', NULL));
