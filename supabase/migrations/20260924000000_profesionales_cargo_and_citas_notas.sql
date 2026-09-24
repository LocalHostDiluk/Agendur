-- Migración: DS-06 / OP-01 - Agregar profesionales.cargo y citas.notas_internas
-- Fecha: 2026-09-24

-- 1. Agregar columna cargo a public.profesionales
ALTER TABLE public.profesionales
  ADD COLUMN IF NOT EXISTS cargo TEXT DEFAULT 'Especialista';

-- 2. Agregar columna notas_internas a public.citas
ALTER TABLE public.citas
  ADD COLUMN IF NOT EXISTS notas_internas TEXT NULL;

-- 3. Actualizar la vista public.profesionales_publicos para incluir cargo (sin exponer email ni telefono)
CREATE OR REPLACE VIEW public.profesionales_publicos WITH (security_invoker = true) AS
SELECT id, sucursal_id, nombre, apellido, avatar_url, activo, cargo
FROM public.profesionales
WHERE activo = true;

-- Asegurar permisos de la vista
REVOKE ALL PRIVILEGES ON TABLE public.profesionales_publicos FROM PUBLIC;
GRANT SELECT ON TABLE public.profesionales_publicos TO anon, authenticated;
