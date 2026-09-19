-- Hallazgo 8.1: permiso muerto con superficie de abuso.
-- Toda escritura en `citas` del servidor usa service_role (reserva-service.ts y
-- app/api/negocio/citas). Ningún cliente de navegador inserta citas, así que esta
-- política sólo permitía que cualquiera con la clave anónima creara citas por
-- /rest/v1/citas saltándose el rate limit, el consentimiento de privacidad y el
-- chequeo de disponibilidad — bastaba para ocupar la agenda entera de un negocio.
DROP POLICY IF EXISTS "Público puede crear reservas de citas" ON public.citas;
