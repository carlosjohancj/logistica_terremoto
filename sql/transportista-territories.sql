-- Transportista Territories
-- Allows transportistas to define circular zones of operation on a map.
-- Used for filtering available travel requests by geographic coverage.

CREATE TABLE IF NOT EXISTS transportista_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering by user
CREATE INDEX IF NOT EXISTS idx_transportista_territories_user_id ON transportista_territories(user_id);

-- Enable RLS
ALTER TABLE transportista_territories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own territories"
  ON transportista_territories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own territories"
  ON transportista_territories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own territories"
  ON transportista_territories FOR DELETE
  USING (auth.uid() = user_id);
