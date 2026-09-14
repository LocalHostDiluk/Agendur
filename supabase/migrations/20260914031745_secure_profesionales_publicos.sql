-- Oleada 3.5: el REVOKE de columnas previo no anuló el SELECT de tabla de anon.
BEGIN;

REVOKE SELECT ON TABLE public.profesionales FROM PUBLIC, anon;
GRANT SELECT (id, sucursal_id, nombre, apellido, avatar_url, activo)
  ON TABLE public.profesionales TO anon;

DROP POLICY "Público puede ver profesionales activos" ON public.profesionales;
CREATE POLICY "Público puede ver profesionales activos"
  ON public.profesionales FOR SELECT TO anon USING (activo = true);

ALTER VIEW public.profesionales_publicos SET (security_invoker = true);
REVOKE ALL PRIVILEGES ON TABLE public.profesionales_publicos
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.profesionales_publicos TO anon, authenticated;

DO $$
BEGIN
  IF has_column_privilege('anon', 'public.profesionales', 'email', 'SELECT')
    OR has_column_privilege('anon', 'public.profesionales', 'telefono', 'SELECT')
  THEN
    RAISE EXCEPTION 'El rol anon todavía puede leer PII de profesionales';
  END IF;
END $$;

COMMIT;
