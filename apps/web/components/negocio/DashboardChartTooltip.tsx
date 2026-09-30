interface DashboardChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
  unit?: string;
}

export function DashboardChartTooltip({
  active,
  payload,
  label,
  unit,
}: DashboardChartTooltipProps) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-surface border border-border rounded-md shadow-xs p-2.5 text-xs font-sans min-w-[120px]">
        <p className="text-text-secondary font-medium">{label}</p>
        <p className="font-mono font-bold text-text-primary mt-1 text-sm tabular-nums">
          {unit === "MXN"
            ? `$${Number(val).toLocaleString("es-MX")} MXN`
            : `${val} ${val === 1 ? "cita" : "citas"}`}
        </p>
      </div>
    );
  }
  return null;
}
