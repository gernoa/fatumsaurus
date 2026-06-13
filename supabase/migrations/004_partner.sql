-- Añadir partner_id a profiles
-- Cada usuario puede designar a otro usuario como su pareja para vistas conjuntas

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
