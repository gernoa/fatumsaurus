-- ──────────────────────────────────────────────────────────────────────────────
-- 009 — Garantías idempotentes de columnas críticas
-- Ejecutar en Supabase SQL Editor si tienes dudas de qué migraciones se han
-- aplicado. Es seguro ejecutarlo aunque ya esté todo al día.
-- ──────────────────────────────────────────────────────────────────────────────

-- partner_id en profiles (migración 004)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- salud_bonos: tabla de bonos de especialista (migración 005/007)
CREATE TABLE IF NOT EXISTS salud_bonos (
  id                   uuid primary key default gen_random_uuid(),
  especialista_id      uuid references salud_especialistas(id) on delete cascade not null,
  user_id              uuid references profiles(id) not null,
  sesiones_contratadas int            not null,
  precio_total         numeric(10,2)  not null,
  fecha_pago           date           not null,
  pagado_via           text           not null default 'personal',
  compartido           boolean        not null default true,
  activo               boolean        not null default true,
  gasto_id             uuid,
  created_at           timestamptz    default now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'salud_bonos') THEN
    ALTER TABLE salud_bonos ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'salud_bonos' AND policyname = 'bonos propios'
  ) THEN
    EXECUTE 'CREATE POLICY "bonos propios" ON salud_bonos FOR ALL USING (user_id = auth.uid())';
  END IF;
END $$;

-- compartido en gastos (migración 006)
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS compartido boolean NOT NULL DEFAULT false;

-- hora y realizada en salud_sesiones (migración 008)
ALTER TABLE salud_sesiones ADD COLUMN IF NOT EXISTS hora      time;
ALTER TABLE salud_sesiones ADD COLUMN IF NOT EXISTS realizada boolean NOT NULL DEFAULT false;

-- Marcar sesiones existentes como realizadas (ya ocurrieron antes de esta migración)
UPDATE salud_sesiones SET realizada = true WHERE realizada = false;

-- FK salud_bonos → gastos (por si no se añadió en 006)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'salud_bonos_gasto_id_fkey'
  ) THEN
    ALTER TABLE salud_bonos
      ADD CONSTRAINT salud_bonos_gasto_id_fkey
      FOREIGN KEY (gasto_id) REFERENCES gastos(id) ON DELETE SET NULL;
  END IF;
END $$;
