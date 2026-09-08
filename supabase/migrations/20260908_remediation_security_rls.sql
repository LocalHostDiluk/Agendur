-- ==============================================================================
-- CitaSync: Migración Incremental de Seguridad (RLS y Storage)
-- Seguro de ejecutar sobre bases de datos existentes (Idempotente)
-- ==============================================================================

-- 1. POLÍTICA DE CITAS PÚBLICAS ENDURECIDA
DROP POLICY IF EXISTS "Público puede crear reservas de citas" ON public.citas;

CREATE POLICY "Público puede crear reservas de citas"
  ON public.citas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    citas.estado = 'pendiente_pago'
    AND citas.monto_anticipo_pagado = 0
    AND EXISTS (
      SELECT 1 FROM public.sucursales s
      WHERE s.id = citas.sucursal_id
        AND s.negocio_id = citas.negocio_id
        AND s.activa = true
    )
  );

-- 2. ASEGURAR EXISTENCIA DE BUCKETS DE STORAGE
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos-negocios', 'logos-negocios', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars-profesionales', 'avatars-profesionales', true)
ON CONFLICT (id) DO NOTHING;

-- 3. POLÍTICAS DE LECTURA DE STORAGE (Idempotentes)
DROP POLICY IF EXISTS "Lectura pública de logos" ON storage.objects;
CREATE POLICY "Lectura pública de logos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'logos-negocios');

DROP POLICY IF EXISTS "Lectura pública de avatars" ON storage.objects;
CREATE POLICY "Lectura pública de avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars-profesionales');

-- 4. SUBIDA (INSERT) DE ARCHIVOS AISLADA POR NEGOCIO
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir logos" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden subir logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos-negocios'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.negocios WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuarios autenticados pueden subir avatars" ON storage.objects;
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

-- 5. ACTUALIZACIÓN (UPDATE) DE ARCHIVOS
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar/eliminar logos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar logos" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden actualizar logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos-negocios'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.negocios WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar/eliminar avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar avatars" ON storage.objects;
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

-- 6. ELIMINACIÓN (DELETE) DE ARCHIVOS
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar logos" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden eliminar logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos-negocios'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.negocios WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar avatars" ON storage.objects;
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
