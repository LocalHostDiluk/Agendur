-- ==============================================================================
-- Agendur - snapshot para una base Supabase nueva (hasta Oleada 3.5)
-- Multi-tenant RLS, Multi-Sucursal, Horarios a 2 Niveles, Citas y Suscripciones
-- Ejecutar este archivo una sola vez en una base vacía; NO reaplicar después
-- las migraciones ya incorporadas aquí. En bases existentes, usar migraciones.
-- ==============================================================================

-- Habilitar extensión pgcrypto para gen_random_uuid si no está activa
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
SET search_path = public, extensions;

-- ------------------------------------------------------------------------------
-- 1. FUNCIÓN Y DISPARADOR DE ACTUALIZACIÓN (updated_at)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. TABLA: negocios (Entidad Comercial Principal)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.negocios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_comercial TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT NULL,
  giro_comercial TEXT NOT NULL,
  moneda_principal VARCHAR(3) NOT NULL DEFAULT 'MXN',
  pais VARCHAR(2) NOT NULL DEFAULT 'MX'
    CONSTRAINT negocios_pais_formato_check CHECK (pais ~ '^[A-Z]{2}$'),
  zona_horaria VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
  porcentaje_anticipo_default NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (porcentaje_anticipo_default BETWEEN 0 AND 100),
  telefono_cliente_requerido BOOLEAN NOT NULL DEFAULT true,
  email_cliente_requerido BOOLEAN NOT NULL DEFAULT false,
  notas_cliente_habilitadas BOOLEAN NOT NULL DEFAULT true,
  politica_cancelacion TEXT NULL,
  CONSTRAINT negocios_contacto_reserva_requerido_check
    CHECK (telefono_cliente_requerido OR email_cliente_requerido),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_negocios_owner_id ON public.negocios(owner_id);
CREATE INDEX IF NOT EXISTS idx_negocios_slug ON public.negocios(slug);

CREATE TRIGGER tr_negocios_updated_at
  BEFORE UPDATE ON public.negocios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2A. TABLA: perfiles_usuario (Identidad del Administrador)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perfiles_usuario (
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

-- ------------------------------------------------------------------------------
-- 2B. TABLA: consentimientos_usuario (Registro Append-Only)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consentimientos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  documento TEXT NOT NULL CHECK (btrim(documento) <> ''),
  version TEXT NOT NULL CHECK (btrim(version) <> ''),
  aceptado_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consentimientos_usuario_usuario_id
  ON public.consentimientos_usuario(usuario_id);

-- ------------------------------------------------------------------------------
-- 3. TABLA: sucursales (Sedes Comerciales del Negocio)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  es_matriz BOOLEAN NOT NULL DEFAULT false,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  estado_provincia TEXT NOT NULL,
  codigo_postal VARCHAR(10) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  zona_horaria VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sucursales_negocio_id ON public.sucursales(negocio_id);

CREATE TRIGGER tr_sucursales_updated_at
  BEFORE UPDATE ON public.sucursales
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. TABLA: servicios (Catálogo de Servicios del Negocio)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT NULL,
  duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos > 0),
  precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_servicios_negocio_id ON public.servicios(negocio_id);

CREATE TRIGGER tr_servicios_updated_at
  BEFORE UPDATE ON public.servicios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. TABLA: profesionales (Personal / Especialistas por Sucursal)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profesionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id UUID NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NULL,
  telefono VARCHAR(20) NULL,
  avatar_url TEXT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profesionales_sucursal_id ON public.profesionales(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_profesional_servicios_servicio_id
  ON public.profesional_servicios(servicio_id);

CREATE TRIGGER tr_profesionales_updated_at
  BEFORE UPDATE ON public.profesionales
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE VIEW public.profesionales_publicos WITH (security_invoker = true) AS
SELECT id, sucursal_id, nombre, apellido, avatar_url, activo
FROM public.profesionales
WHERE activo = true;

-- ------------------------------------------------------------------------------
-- 6. TABLA: profesional_servicios (Asignación M:N de Servicios)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profesional_servicios (
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES public.servicios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profesional_id, servicio_id)
);

-- ------------------------------------------------------------------------------
-- 7. TABLA: horarios_sucursal (Apertura General del Local por Día)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.horarios_sucursal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id UUID NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0: Domingo, 1: Lunes, ...
  hora_apertura TIME NOT NULL,
  hora_cierre TIME NOT NULL,
  es_laborable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sucursal_id, dia_semana)
);

CREATE INDEX IF NOT EXISTS idx_horarios_sucursal ON public.horarios_sucursal(sucursal_id, dia_semana);

CREATE TRIGGER tr_horarios_sucursal_updated_at
  BEFORE UPDATE ON public.horarios_sucursal
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 8. TABLA: horarios_profesional (Turno del Especialista por Día)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.horarios_profesional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  es_laborable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profesional_id, dia_semana)
);

CREATE INDEX IF NOT EXISTS idx_horarios_profesional ON public.horarios_profesional(profesional_id, dia_semana);

CREATE TRIGGER tr_horarios_profesional_updated_at
  BEFORE UPDATE ON public.horarios_profesional
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 9. TABLA: citas (Reservaciones Atomizadas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE,
  sucursal_id UUID NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES public.servicios(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES public.profesionales(id) ON DELETE CASCADE,
  cliente_nombre TEXT NOT NULL,
  cliente_apellido TEXT NOT NULL,
  cliente_telefono VARCHAR(20) NULL,
  cliente_email TEXT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('pendiente_pago', 'confirmada', 'completada', 'cancelada', 'no_asistio')),
  precio_total NUMERIC(10,2) NOT NULL CHECK (precio_total >= 0),
  monto_anticipo_pagado NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (monto_anticipo_pagado >= 0),
  metodo_pago_anticipo VARCHAR(30) NULL,
  notas_cliente TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  privacidad_aceptada_en TIMESTAMPTZ NULL,
  politica_cancelacion_aceptada_en TIMESTAMPTZ NULL,
  CONSTRAINT citas_contacto_requerido_check CHECK (
    NULLIF(BTRIM(cliente_telefono), '') IS NOT NULL
    OR NULLIF(BTRIM(cliente_email), '') IS NOT NULL
  ),
  CONSTRAINT citas_horario_valido_check CHECK (hora_fin > hora_inicio),
  CONSTRAINT citas_profesional_horario_excl EXCLUDE USING gist (
    profesional_id WITH =,
    (tsrange(fecha + hora_inicio, fecha + hora_fin, '[)')) WITH &&
  ) WHERE (estado IN ('pendiente_pago', 'confirmada'))
);

CREATE INDEX IF NOT EXISTS idx_citas_negocio_fecha ON public.citas(negocio_id, fecha);
CREATE INDEX IF NOT EXISTS idx_citas_sucursal_fecha ON public.citas(sucursal_id, fecha);
CREATE INDEX IF NOT EXISTS idx_citas_profesional_fecha ON public.citas(profesional_id, fecha);
CREATE INDEX IF NOT EXISTS idx_citas_servicio_id ON public.citas(servicio_id);

CREATE TRIGGER tr_citas_updated_at
  BEFORE UPDATE ON public.citas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 10. TABLA: suscripciones (SaaS Billing: Manual Directo & Pasarelas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id UUID NOT NULL REFERENCES public.negocios(id) ON DELETE CASCADE UNIQUE,
  plan_nombre VARCHAR(50) NOT NULL DEFAULT 'emprendedor',
  intervalo VARCHAR(20) NOT NULL DEFAULT 'mensual' CHECK (intervalo IN ('mensual', 'anual')),
  limite_sucursales INTEGER NOT NULL DEFAULT 1,
  limite_profesionales INTEGER NOT NULL DEFAULT 3,
  estado VARCHAR(20) NOT NULL DEFAULT 'trialing' CHECK (estado IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  pasarela VARCHAR(30) NOT NULL DEFAULT 'manual', -- 'manual', 'transferencia', 'efectivo', 'stripe', 'mercadopago', 'conekta'
  customer_external_id TEXT NULL,
  subscription_external_id TEXT NULL,
  trial_ends_at TIMESTAMPTZ NULL,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  notas_admin TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suscripciones_negocio ON public.suscripciones(negocio_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_subscription_external_id
  ON public.suscripciones(subscription_external_id);

CREATE TRIGGER tr_suscripciones_updated_at
  BEFORE UPDATE ON public.suscripciones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 10A. TABLA: stripe_webhook_events (Idempotencia de webhooks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consentimientos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesional_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_sucursal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_profesional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Grants explícitos para exposición controlada mediante Supabase Data API.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.negocios, public.sucursales, public.servicios, public.profesionales,
  public.profesional_servicios, public.horarios_sucursal,
  public.horarios_profesional, public.citas
  TO authenticated, service_role;
GRANT SELECT ON TABLE public.suscripciones TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.suscripciones TO service_role;
-- Idempotencia de webhooks Stripe: sólo service_role, nunca expuesta por la Data API.
REVOKE ALL PRIVILEGES ON TABLE public.stripe_webhook_events FROM anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.stripe_webhook_events TO service_role;
GRANT SELECT ON TABLE
  public.negocios, public.sucursales, public.servicios,
  public.profesional_servicios, public.horarios_sucursal,
  public.horarios_profesional TO anon;
GRANT INSERT ON TABLE public.citas TO anon;

-- El rol anon no recibe SELECT de tabla: solo columnas públicas.
REVOKE SELECT ON TABLE public.profesionales FROM PUBLIC, anon;
GRANT SELECT (id, sucursal_id, nombre, apellido, avatar_url, activo)
  ON TABLE public.profesionales TO anon;
REVOKE ALL PRIVILEGES ON TABLE public.profesionales_publicos
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.profesionales_publicos TO anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE public.perfiles_usuario
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON TABLE public.consentimientos_usuario
  FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON TABLE public.perfiles_usuario TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.perfiles_usuario TO service_role;
GRANT SELECT, INSERT ON TABLE public.consentimientos_usuario
  TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- Políticas para: negocios
-- ------------------------------------------------------------------------------
-- El dueño puede ver y editar su negocio
CREATE POLICY "Dueño puede gestionar su negocio"
  ON public.negocios
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Cualquier visitante puede consultar datos públicos del negocio por slug
CREATE POLICY "Público puede ver negocios activos"
  ON public.negocios
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- Políticas para: perfiles_usuario
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- Políticas para: consentimientos_usuario
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- Políticas para: sucursales
-- ------------------------------------------------------------------------------
CREATE POLICY "Dueño puede gestionar sucursales de su negocio"
  ON public.sucursales
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negocios n
      WHERE n.id = sucursales.negocio_id AND n.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negocios n
      WHERE n.id = sucursales.negocio_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Público puede ver sucursales activas"
  ON public.sucursales
  FOR SELECT
  TO anon, authenticated
  USING (activa = true);

-- ------------------------------------------------------------------------------
-- Políticas para: servicios
-- ------------------------------------------------------------------------------
CREATE POLICY "Dueño puede gestionar servicios de su negocio"
  ON public.servicios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negocios n
      WHERE n.id = servicios.negocio_id AND n.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negocios n
      WHERE n.id = servicios.negocio_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Público puede ver servicios activos"
  ON public.servicios
  FOR SELECT
  TO anon, authenticated
  USING (activo = true);

-- ------------------------------------------------------------------------------
-- Políticas para: profesionales
-- ------------------------------------------------------------------------------
CREATE POLICY "Dueño puede gestionar profesionales de sus sucursales"
  ON public.profesionales
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sucursales s
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE s.id = profesionales.sucursal_id AND n.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sucursales s
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE s.id = profesionales.sucursal_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Público puede ver profesionales activos"
  ON public.profesionales
  FOR SELECT
  TO anon
  USING (activo = true);

-- ------------------------------------------------------------------------------
-- Políticas para: profesional_servicios
-- ------------------------------------------------------------------------------
CREATE POLICY "Dueño puede gestionar asignaciones de servicios"
  ON public.profesional_servicios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profesionales p
      JOIN public.sucursales s ON s.id = p.sucursal_id
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE p.id = profesional_servicios.profesional_id AND n.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profesionales p
      JOIN public.sucursales s ON s.id = p.sucursal_id
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE p.id = profesional_servicios.profesional_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Público puede ver asignaciones de servicios"
  ON public.profesional_servicios
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- Políticas para: horarios_sucursal & horarios_profesional
-- ------------------------------------------------------------------------------
CREATE POLICY "Dueño gestiona horarios de sucursales"
  ON public.horarios_sucursal
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sucursales s
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE s.id = horarios_sucursal.sucursal_id AND n.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sucursales s
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE s.id = horarios_sucursal.sucursal_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Público puede ver horarios de sucursales"
  ON public.horarios_sucursal
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Dueño gestiona horarios de profesionales"
  ON public.horarios_profesional
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profesionales p
      JOIN public.sucursales s ON s.id = p.sucursal_id
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE p.id = horarios_profesional.profesional_id AND n.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profesionales p
      JOIN public.sucursales s ON s.id = p.sucursal_id
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE p.id = horarios_profesional.profesional_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Público puede ver horarios de profesionales"
  ON public.horarios_profesional
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- Políticas para: citas
-- ------------------------------------------------------------------------------
-- El dueño puede ver y gestionar todas las citas de su negocio
CREATE POLICY "Dueño puede gestionar citas de su negocio"
  ON public.citas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negocios n
      WHERE n.id = citas.negocio_id AND n.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negocios n
      WHERE n.id = citas.negocio_id AND n.owner_id = auth.uid()
    )
  );

-- Sin política de INSERT para anon/authenticated (hallazgo 8.1): las reservas
-- públicas se crean desde el servidor con service_role, que ignora RLS. Una
-- política pública sólo permitiría crear citas por la Data API saltándose el
-- rate limit, el consentimiento y el chequeo de disponibilidad.

-- ------------------------------------------------------------------------------
-- Políticas para: suscripciones
-- ------------------------------------------------------------------------------
CREATE POLICY "Dueño puede consultar su propia suscripción"
  ON public.suscripciones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.negocios n
      WHERE n.id = suscripciones.negocio_id AND n.owner_id = auth.uid()
    )
  );

-- ==============================================================================
-- 12. STORAGE BUCKETS (logos-negocios y avatars-profesionales)
-- ==============================================================================

-- Inserción de buckets públicos si no existen en storage.buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos-negocios', 'logos-negocios', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars-profesionales', 'avatars-profesionales', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para lectura pública de imágenes
CREATE POLICY "Lectura pública de logos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'logos-negocios');

CREATE POLICY "Lectura pública de avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars-profesionales');

-- Políticas de subida autenticada a Storage
CREATE POLICY "Usuarios autenticados pueden subir logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos-negocios'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.negocios WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios autenticados pueden subir avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars-profesionales'
    AND (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM public.sucursales s
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE n.owner_id = auth.uid()
    )
  );

-- Políticas de actualización autenticada en Storage
CREATE POLICY "Usuarios autenticados pueden actualizar logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos-negocios'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.negocios WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios autenticados pueden actualizar avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars-profesionales'
    AND (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM public.sucursales s
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE n.owner_id = auth.uid()
    )
  );

-- Políticas de eliminación autenticada en Storage
CREATE POLICY "Usuarios autenticados pueden eliminar logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos-negocios'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.negocios WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios autenticados pueden eliminar avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars-profesionales'
    AND (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM public.sucursales s
      JOIN public.negocios n ON n.id = s.negocio_id
      WHERE n.owner_id = auth.uid()
    )
  );

RESET search_path;
