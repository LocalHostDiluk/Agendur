/**
 * Convierte un string de hora ("HH:MM" o "HH:MM:SS") a minutos desde la medianoche.
 */
export function timeToMinutes(time: string): number {
  const parts = time.split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

/**
 * Convierte minutos desde la medianoche a string de hora "HH:MM".
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Obtiene el día de la semana (0: Domingo a 6: Sábado) a partir de una fecha "YYYY-MM-DD"
 * de forma independiente de la zona horaria local.
 */
export function getDiaSemana(fechaStr: string): number {
  const [year, month, day] = fechaStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCDay();
}

export type Ventana = { inicio: number; fin: number };

export function intersectarVentanas(a: Ventana[], b: Ventana[]): Ventana[] {
  return a.flatMap((primera) =>
    b.flatMap((segunda) => {
      const inicio = Math.max(primera.inicio, segunda.inicio);
      const fin = Math.min(primera.fin, segunda.fin);
      return inicio < fin ? [{ inicio, fin }] : [];
    }),
  );
}

export function resolverExcepciones(
  excepciones: Array<Record<string, unknown>> | null,
  campoInicio: string,
  campoFin: string,
): Ventana[] | null {
  if (!excepciones?.length) return null;
  if (excepciones.some((excepcion) => excepcion.cerrado === true)) return [];

  return excepciones.map((excepcion) => ({
    inicio: timeToMinutes(String(excepcion[campoInicio])),
    fin: timeToMinutes(String(excepcion[campoFin])),
  }));
}

/** Calcula slots completos, incluyendo el buffer, dentro de las ventanas disponibles. */
export function calcularFranjasDisponibles(
  ventanas: Ventana[],
  citasMin: Ventana[],
  duracionMin: number,
  bufferMin: number,
): string[] {
  const ocupacionMin = duracionMin + bufferMin;
  const franjasDisponibles = new Set<string>();
  const pasoMin = Math.min(30, duracionMin); // Granularidad de saltos
  for (const ventana of ventanas) {
    for (
      let inicio = ventana.inicio;
      inicio + ocupacionMin <= ventana.fin &&
      inicio + ocupacionMin < 24 * 60;
      inicio += pasoMin
    ) {
      const fin = inicio + ocupacionMin;

      const solapada = citasMin.some(
        (c) => inicio < c.fin && fin > c.inicio,
      );

      if (!solapada) {
        franjasDisponibles.add(minutesToTime(inicio));
      }
    }
  }
  return Array.from(franjasDisponibles);
}
