-- Idempotencia de webhooks de Stripe (hallazgo 2.3).
-- Stripe reintenta el mismo event.id tras un timeout o un 5xx; sin este registro
-- un reintento vuelve a aplicar el efecto del evento.
-- Sólo service_role escribe y lee: ningún rol de la Data API tiene acceso.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.stripe_webhook_events FROM anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.stripe_webhook_events TO service_role;

-- El webhook busca la suscripción por subscription_external_id en tres ramas.
CREATE INDEX IF NOT EXISTS idx_suscripciones_subscription_external_id
  ON public.suscripciones(subscription_external_id);
