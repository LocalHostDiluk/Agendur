
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

