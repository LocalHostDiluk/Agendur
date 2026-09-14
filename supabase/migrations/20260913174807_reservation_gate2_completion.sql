
-- La consulta de solapamientos aborta sin modificar el esquema si hay citas activas en conflicto.
BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.citas a
    JOIN public.citas b ON a.id < b.id
      AND a.profesional_id = b.profesional_id
      AND a.fecha = b.fecha
      AND a.hora_inicio < b.hora_fin
      AND b.hora_inicio < a.hora_fin
    WHERE a.estado IN ('pendiente_pago', 'confirmada')
      AND b.estado IN ('pendiente_pago', 'confirmada')
  ) THEN
    RAISE EXCEPTION 'Existen citas activas solapadas; resolverlas antes de aplicar esta migración';
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;

ALTER TABLE public.citas
  ALTER COLUMN cliente_telefono DROP NOT NULL,
  ALTER COLUMN cliente_email DROP NOT NULL,
  ADD COLUMN privacidad_aceptada_en TIMESTAMPTZ,
  ADD COLUMN politica_cancelacion_aceptada_en TIMESTAMPTZ,
  ADD CONSTRAINT citas_contacto_requerido_check
    CHECK (NULLIF(BTRIM(cliente_telefono), '') IS NOT NULL
      OR NULLIF(BTRIM(cliente_email), '') IS NOT NULL),
  ADD CONSTRAINT citas_horario_valido_check
    CHECK (hora_fin > hora_inicio),
  ADD CONSTRAINT citas_profesional_horario_excl
    EXCLUDE USING gist (
      profesional_id WITH =,
      (tsrange(fecha + hora_inicio, fecha + hora_fin, '[)')) WITH &&
    ) WHERE (estado IN ('pendiente_pago', 'confirmada'));

COMMIT;
