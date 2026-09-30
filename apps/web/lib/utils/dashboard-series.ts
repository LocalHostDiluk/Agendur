import type { Cita } from "@/lib/types";

export function getDashboardDailySeries(citas: Cita[], rangoCitas: "30d" | "mes") {
  const series = [];
  const now = new Date();
  const days = rangoCitas === "30d" ? 30 : now.getDate();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const count = citas.filter((c) => c.fecha === dateStr).length;
    const label = d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
    series.push({
      date: dateStr,
      label,
      citas: count,
    });
  }
  return series;
}

export function getDashboardMonthlySeries(citas: Cita[]) {
  const series = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const prefix = `${yyyy}-${mm}`;
    const monthLabel = d.toLocaleDateString("es-MX", { month: "short" });
    const total = citas
      .filter(
        (c) =>
          c.fecha?.startsWith(prefix) &&
          (c.estado === "confirmada" || c.estado === "completada"),
      )
      .reduce((sum, c) => sum + (c.precio_total ?? 0), 0);
    series.push({
      month: prefix,
      label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      ingresos: total,
    });
  }
  return series;
}
