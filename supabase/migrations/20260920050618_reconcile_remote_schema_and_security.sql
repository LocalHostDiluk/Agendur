BEGIN;

-- Stripe webhooks are handled only by the server-side service role.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.stripe_webhook_events
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON TABLE public.stripe_webhook_events
  TO service_role;

CREATE INDEX IF NOT EXISTS idx_suscripciones_subscription_external_id
  ON public.suscripciones(subscription_external_id);
CREATE INDEX IF NOT EXISTS idx_profesional_servicios_servicio_id
  ON public.profesional_servicios(servicio_id);
CREATE INDEX IF NOT EXISTS idx_citas_servicio_id
  ON public.citas(servicio_id);

-- Preserve the function body and its existing triggers; only fix its lookup path.
ALTER FUNCTION public.handle_updated_at()
  SET search_path = '';

-- This SECURITY DEFINER function is for the database event trigger, not the API.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated, service_role;

-- All appointment creation already goes through the validated server API.
DROP POLICY IF EXISTS "Público puede crear reservas de citas"
  ON public.citas;
REVOKE ALL PRIVILEGES ON TABLE public.citas FROM anon;

COMMIT;
