import { getBusinessToday } from "@/lib/utils/business-date";

export function getTodayString(tz?: string | null): string {
  const bizToday = getBusinessToday(tz);
  if (bizToday) return bizToday;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseYMD(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysYMD(ymd: string, days: number): string {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + days);
  return formatYMD(d);
}

export function getMondayOfDate(ymd: string): string {
  const d = parseYMD(ymd);
  const day = d.getDay(); // 0: Dom, 1: Lun, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatYMD(d);
}

export function getSundayOfDate(ymd: string): string {
  const monday = getMondayOfDate(ymd);
  return addDaysYMD(monday, 6);
}

