-- Puerta 1: identidad del administrador y defaults regionales del negocio.

ALTER TABLE public.negocios
  ADD COLUMN pais VARCHAR(2) NOT NULL DEFAULT 'MX',
  ADD COLUMN zona_horaria VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
  ADD CONSTRAINT negocios_pais_formato_check CHECK (pais ~ '^[A-Z]{2}$');

CREATE TABLE public.perfiles_usuario (
  usuario_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombres TEXT NOT NULL CHECK (btrim(nombres) <> ''),
  apellidos TEXT NOT NULL CHECK (btrim(apellidos) <> ''),
  telefono TEXT NULL CHECK (
    telefono IS NULL OR telefono ~ '^\+[1-9][0-9]{1,14}$'
  ),
  locale TEXT NOT NULL DEFAULT 'es-MX' CHECK (btrim(locale) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_perfiles_usuario_updated_at
  BEFORE UPDATE ON public.perfiles_usuario
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.consentimientos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  documento TEXT NOT NULL CHECK (btrim(documento) <> ''),
  version TEXT NOT NULL CHECK (btrim(version) <> ''),
  aceptado_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consentimientos_usuario_usuario_id
  ON public.consentimientos_usuario(usuario_id);

ALTER TABLE public.perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consentimientos_usuario ENABLE ROW LEVEL SECURITY;

-- Los grants son explícitos porque las tablas nuevas ya no se exponen
-- automáticamente en todos los proyectos de Supabase.
REVOKE ALL PRIVILEGES ON TABLE public.perfiles_usuario
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON TABLE public.consentimientos_usuario
  FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON TABLE public.perfiles_usuario TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.perfiles_usuario TO service_role;
GRANT SELECT, INSERT ON TABLE public.consentimientos_usuario
  TO authenticated, service_role;

CREATE POLICY "Usuario puede consultar su perfil"
  ON public.perfiles_usuario
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = usuario_id);

CREATE POLICY "Usuario puede crear su perfil"
  ON public.perfiles_usuario
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = usuario_id);

CREATE POLICY "Usuario puede actualizar su perfil"
  ON public.perfiles_usuario
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = usuario_id)
  WITH CHECK ((SELECT auth.uid()) = usuario_id);

CREATE POLICY "Usuario puede consultar sus consentimientos"
  ON public.consentimientos_usuario
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = usuario_id);

CREATE POLICY "Usuario puede registrar sus consentimientos"
  ON public.consentimientos_usuario
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = usuario_id);

-- Guard de validación: también sirve como consulta de comprobación en staging.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.negocios n
    LEFT JOIN pg_timezone_names() tz ON tz.name = n.zona_horaria
    WHERE n.pais IS NULL
       OR n.pais !~ '^[A-Z]{2}$'
       OR n.zona_horaria IS NULL
       OR tz.name IS NULL
  ) THEN
    RAISE EXCEPTION 'identity_data: negocio con país o zona horaria inválidos';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'negocios'
      AND column_name IN ('pais', 'zona_horaria')
      AND (is_nullable <> 'NO' OR column_default IS NULL)
  ) OR (
    SELECT count(*)
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'negocios'
      AND column_name IN ('pais', 'zona_horaria')
  ) <> 2 THEN
    RAISE EXCEPTION 'identity_data: defaults regionales incompletos';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.perfiles_usuario p
    LEFT JOIN auth.users u ON u.id = p.usuario_id
    WHERE u.id IS NULL
  ) OR EXISTS (
    SELECT 1
    FROM public.consentimientos_usuario c
    LEFT JOIN auth.users u ON u.id = c.usuario_id
    WHERE u.id IS NULL
  ) THEN
    RAISE EXCEPTION 'identity_data: identidad huérfana';
  END IF;

  IF (
    SELECT count(*)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('perfiles_usuario', 'consentimientos_usuario')
      AND c.relrowsecurity
  ) <> 2 THEN
    RAISE EXCEPTION 'identity_data: RLS no está habilitado';
  END IF;

  IF NOT (
    has_table_privilege('authenticated', 'public.perfiles_usuario', 'SELECT')
    AND has_table_privilege('authenticated', 'public.perfiles_usuario', 'INSERT')
    AND has_table_privilege('authenticated', 'public.perfiles_usuario', 'UPDATE')
    AND NOT has_table_privilege('authenticated', 'public.perfiles_usuario', 'DELETE')
    AND has_table_privilege('service_role', 'public.perfiles_usuario', 'SELECT')
    AND has_table_privilege('service_role', 'public.perfiles_usuario', 'INSERT')
    AND has_table_privilege('service_role', 'public.perfiles_usuario', 'UPDATE')
    AND has_table_privilege('service_role', 'public.perfiles_usuario', 'DELETE')
    AND has_table_privilege('authenticated', 'public.consentimientos_usuario', 'SELECT')
    AND has_table_privilege('authenticated', 'public.consentimientos_usuario', 'INSERT')
    AND NOT has_table_privilege('authenticated', 'public.consentimientos_usuario', 'UPDATE')
    AND NOT has_table_privilege('authenticated', 'public.consentimientos_usuario', 'DELETE')
    AND has_table_privilege('service_role', 'public.consentimientos_usuario', 'SELECT')
    AND has_table_privilege('service_role', 'public.consentimientos_usuario', 'INSERT')
    AND NOT has_table_privilege('service_role', 'public.consentimientos_usuario', 'UPDATE')
    AND NOT has_table_privilege('service_role', 'public.consentimientos_usuario', 'DELETE')
    AND NOT has_table_privilege('anon', 'public.perfiles_usuario', 'SELECT')
    AND NOT has_table_privilege('anon', 'public.consentimientos_usuario', 'SELECT')
  ) THEN
    RAISE EXCEPTION 'identity_data: grants inesperados';
  END IF;

  IF (
    SELECT count(*)
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('perfiles_usuario', 'consentimientos_usuario')
      AND policyname IN (
        'Usuario puede consultar su perfil',
        'Usuario puede crear su perfil',
        'Usuario puede actualizar su perfil',
        'Usuario puede consultar sus consentimientos',
        'Usuario puede registrar sus consentimientos'
      )
  ) <> 5 THEN
    RAISE EXCEPTION 'identity_data: políticas RLS incompletas';
  END IF;
END;
$$;
