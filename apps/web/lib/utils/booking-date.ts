export const DIAS_ABREV = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const MESES_LARGOS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function formatDateReadable(fechaStr: string): string {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = DIAS_ABREV[date.getUTCDay()];
  const monthName = MESES_LARGOS[date.getUTCMonth()];
  return `${dow}, ${d} de ${monthName} de ${y}`;
}

export function formatDateShort(fechaStr: string): string {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = DIAS_ABREV[date.getUTCDay()];
  const monthName = MESES_LARGOS[date.getUTCMonth()].slice(0, 3);
  return `${dow} ${d} ${monthName}`;
}

export function getNext3Days(
  fechaStr: string,
): Array<{ dateStr: string; label: string }> {
  if (!fechaStr) return [];
  const [y, m, d] = fechaStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const results: Array<{ dateStr: string; label: string }> = [];

  for (let i = 1; i <= 3; i++) {
    const next = new Date(base);
    next.setUTCDate(base.getUTCDate() + i);
    const ny = next.getUTCFullYear();
    const nm = (next.getUTCMonth() + 1).toString().padStart(2, "0");
    const nd = next.getUTCDate().toString().padStart(2, "0");
    const dow = DIAS_ABREV[next.getUTCDay()];
    results.push({
      dateStr: `${ny}-${nm}-${nd}`,
      label: `${dow} ${nd}`,
    });
  }
  return results;
}
