export function getBusinessToday(timeZone: string | null | undefined, now = new Date()): string | null {
  if (!timeZone) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(now);
    const part = (type: string) => parts.find((item) => item.type === type)?.value;
    const year = part("year");
    const month = part("month");
    const day = part("day");
    return year && month && day ? `${year}-${month}-${day}` : null;
  } catch {
    return null;
  }
}

/** Fecha de calendario real en formato YYYY-MM-DD: descarta 2026-02-31. */
export function isCalendarDate(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    // Sin este Date.parse, un 9999-99-99 hace lanzar RangeError a toISOString().
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
