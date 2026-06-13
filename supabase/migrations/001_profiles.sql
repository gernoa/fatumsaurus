-- ═══════════════════════════════════════════════════════════════════════════
-- 001 — Perfiles de usuario
-- Ejecutar en: Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Tabla de perfiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text        NOT NULL DEFAULT '',
  avatar_type   text        NOT NULL DEFAULT 'initial',  -- 'initial' | 'emoji' | 'image'
  avatar_value  text,                                    -- emoji o URL de imagen
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger para crear perfil automáticamente al registrar un usuario en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    -- Usa el email como nombre provisional (sin el dominio)
    split_part(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Row Level Security ───────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer todos los perfiles
-- (necesario para el ParticipantPicker — ver el nombre de otros usuarios)
CREATE POLICY "perfiles_leer_todos"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Solo puedes editar tu propio perfil
CREATE POLICY "perfiles_editar_propio"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
