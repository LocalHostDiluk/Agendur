/**
 * Generadores de eventos de calendario (.ics y Google Calendar) para citas confirmadas en Agendur.
 */

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  duracionMinutos: number;
}

/**
 * Convierte fecha YYYY-MM-DD y hora HH:MM a formato UTC/Compacto ISO para calendarios (YYYYMMDDTHHMMSS).
 */
function toCalendarDateTime(fecha: string, hora: string): string {
  const cleanFecha = fecha.replace(/-/g, "");
  const [h, m] = hora.split(":");
  const cleanHora = `${(h || "00").padStart(2, "0")}${(m || "00").padStart(2, "0")}00`;
  return `${cleanFecha}T${cleanHora}`;
}

/**
 * Calcula la hora fin a partir de la hora de inicio y duración en minutos.
 */
function addMinutesToTime(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = (h || 0) * 60 + (m || 0) + minutos;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
}

/**
 * Genera la URL para agregar el evento directamente a Google Calendar.
 */
export function getGoogleCalendarUrl(event: CalendarEventData): string {
  const horaFin = addMinutesToTime(event.horaInicio, event.duracionMinutos);
  const startDt = toCalendarDateTime(event.fecha, event.horaInicio);
  const endDt = toCalendarDateTime(event.fecha, horaFin);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startDt}/${endDt}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Genera y descarga un archivo .ics estándar compatible con Apple Calendar, Outlook y dispositivos móviles.
 */
export function downloadIcsFile(event: CalendarEventData): void {
  const horaFin = addMinutesToTime(event.horaInicio, event.duracionMinutos);
  const startDt = toCalendarDateTime(event.fecha, event.horaInicio);
  const endDt = toCalendarDateTime(event.fecha, horaFin);
  const nowDt =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agendur//Reservas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:reserva-${Date.now()}@agendur.app`,
    `DTSTAMP:${nowDt}`,
    `DTSTART:${startDt}`,
    `DTEND:${endDt}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location.replace(/,/g, "\\,")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `reserva-${event.fecha}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
