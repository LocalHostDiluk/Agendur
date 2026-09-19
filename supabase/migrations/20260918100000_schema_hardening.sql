-- Endurecimiento de esquema (hallazgos 6.1 y 6.2).

-- 6.1: el Security Advisor de Supabase reporta esta función por search_path mutable.
-- CREATE OR REPLACE conserva los 9 triggers que la usan.
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

-- 6.2: claves foráneas sin índice; el beneficio es el DELETE sobre servicios.
CREATE INDEX IF NOT EXISTS idx_profesional_servicios_servicio_id
  ON public.profesional_servicios(servicio_id);
CREATE INDEX IF NOT EXISTS idx_citas_servicio_id
  ON public.citas(servicio_id);
