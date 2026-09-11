-- ==============================================================================
-- CitaSync: Mitigación de Fuga de PII en Profesionales (PostgREST RLS Hardening)
-- Fecha: 2026-09-08
-- Este script implementa medidas de seguridad para proteger la información sensible (PII) de los profesionales en la base de datos, asegurando que solo se expongan los datos necesarios a través de vistas públicas y restringiendo el acceso directo a las columnas sensibles.
-- Ya fue aplicado en el entorno de producción para cumplir con las mejores prácticas de seguridad y privacidad.
-- ==============================================================================

-- 1. Revocar permisos de lectura de columnas sensibles (email, telefono) a roles públicos
REVOKE SELECT (email, telefono) ON public.profesionales FROM anon, authenticated;

-- 2. Crear vista pública explícita para el catálogo de reservas de clientes
CREATE OR REPLACE VIEW public.profesionales_publicos AS
SELECT 
  id,
  sucursal_id,
  nombre,
  apellido,
  avatar_url,
  activo
FROM public.profesionales
WHERE activo = true;

-- 3. Otorgar permisos de lectura exclusivamente a la vista pública
GRANT SELECT ON public.profesionales_publicos TO anon, authenticated;

