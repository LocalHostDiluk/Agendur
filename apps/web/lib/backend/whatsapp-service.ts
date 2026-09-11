export interface WhatsAppNotification {
  telefono: string;
  mensaje: string;
  negocioNombre: string;
}

export async function enviarNotificacionWhatsApp(
  payload: WhatsAppNotification,
): Promise<{ enviado: boolean; idMensaje: string }> {
  console.log(
    `[WhatsApp Backend Service] Enviando mensaje a ${payload.telefono}: "${payload.mensaje}"`,
  );
  return {
    enviado: true,
    idMensaje: `wa_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };
}
