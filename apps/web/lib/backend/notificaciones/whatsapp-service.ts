export interface WhatsAppNotification {
  telefono: string;
  mensaje: string;
  negocioNombre: string;
}

/**
 * Stub de envío de notificaciones. Registra sólo el negocio destinatario:
 * el teléfono y el mensaje son PII del cliente y los logs son legibles por terceros.
 */
export async function enviarNotificacionWhatsApp(
  payload: WhatsAppNotification,
): Promise<{ enviado: boolean; idMensaje: string }> {
  console.log(
    `[WhatsApp Backend Service] Notificación encolada para ${payload.negocioNombre}`,
  );
  return {
    enviado: true,
    idMensaje: `wa_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };
}
