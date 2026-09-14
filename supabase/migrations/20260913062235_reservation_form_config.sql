
-- Hereda las políticas RLS y privilegios de public.negocios ya existentes.
ALTER TABLE public.negocios
  ADD COLUMN telefono_cliente_requerido BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN email_cliente_requerido BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN notas_cliente_habilitadas BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN politica_cancelacion TEXT NULL,
  ADD CONSTRAINT negocios_contacto_reserva_requerido_check
    CHECK (telefono_cliente_requerido OR email_cliente_requerido);
