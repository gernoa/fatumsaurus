-- ═══════════════════════════════════════════════════════════════════════════
-- 002 — Grupos de conveniencia
-- Ejecutar en: Supabase → SQL Editor (después de 001)
-- ═══════════════════════════════════════════════════════════════════════════

-- Grupos (atajos opcionales para seleccionar participantes rápido)
CREATE TABLE IF NOT EXISTS public.groups (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  created_by  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Miembros de cada grupo
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id  uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────

ALTER TABLE public.groups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Ver grupos: solo los que tú has creado
CREATE POLICY "grupos_leer_propios"
  ON public.groups FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Crear grupo: cualquier usuario autenticado
CREATE POLICY "grupos_crear"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Editar/borrar grupo: solo el creador
CREATE POLICY "grupos_editar_propios"
  ON public.groups FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "grupos_borrar_propios"
  ON public.groups FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Miembros: ver los de los grupos que ves (creados por ti)
CREATE POLICY "group_members_leer"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_gestionar"
  ON public.group_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_id AND created_by = auth.uid()
    )
  );
