-- ═══════════════════════════════════════════════════════════════════════════
-- 003 — Preferencias de módulos y colores por usuario
-- Ejecutar en: Supabase → SQL Editor (después de 002)
-- ═══════════════════════════════════════════════════════════════════════════

-- Módulos activos/inactivos y orden en el sidebar
CREATE TABLE IF NOT EXISTS public.user_module_preferences (
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_slug text NOT NULL,
  enabled     boolean     NOT NULL DEFAULT true,
  sort_order  integer     NOT NULL DEFAULT 0,
  is_favorite boolean     NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, module_slug)
);

-- Color asignado a cada módulo por usuario
-- El color es el nombre del token de la paleta (ej: 'petroleo', 'teal', 'ambar'...)
-- NULL significa 'sin color' — el módulo se muestra en gris neutro
CREATE TABLE IF NOT EXISTS public.user_module_colors (
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_slug text NOT NULL,
  color_token text,         -- nombre del token (ej: 'petroleo') o NULL para sin color
  PRIMARY KEY (user_id, module_slug)
);

-- ─── Row Level Security ───────────────────────────────────────────────────

ALTER TABLE public.user_module_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_colors      ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo ve y edita sus propias preferencias
CREATE POLICY "module_prefs_propio"
  ON public.user_module_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "module_colors_propio"
  ON public.user_module_colors FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Datos iniciales por defecto ──────────────────────────────────────────
-- Esta función inserta las preferencias de módulos por defecto para un usuario nuevo.
-- Se puede llamar manualmente tras crear un usuario, o se puede conectar al trigger
-- on_auth_user_created si se quiere automatizar.

CREATE OR REPLACE FUNCTION public.init_user_modules(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_module_preferences (user_id, module_slug, enabled, sort_order, is_favorite)
  VALUES
    (p_user_id, 'calendario',   true,  0,  false),
    (p_user_id, 'finanzas',     true,  1,  false),
    (p_user_id, 'hogar',        true,  2,  false),
    (p_user_id, 'comida',       true,  3,  false),
    (p_user_id, 'vehiculos',    true,  4,  false),
    (p_user_id, 'salud',        true,  5,  false),
    (p_user_id, 'bienestar',    true,  6,  false),
    (p_user_id, 'habitos',      true,  7,  false),
    (p_user_id, 'objetivos',    true,  8,  false),
    (p_user_id, 'viajes',       true,  9,  false),
    (p_user_id, 'lugares',      true, 10,  false),
    (p_user_id, 'septimo-arte', true, 11,  false),
    (p_user_id, 'trabajo',      true, 12,  false),
    (p_user_id, 'estudios',     true, 13,  false),
    (p_user_id, 'gifts',        true, 14,  false)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
