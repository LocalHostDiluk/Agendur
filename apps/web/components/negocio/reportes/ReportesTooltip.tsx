export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string }>;
  label?: string;
  unit?: string;
}

export function ReportesTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-surface border border-border rounded-[var(--radius-sm)] shadow-xs p-2.5 text-xs font-sans min-w-[130px]">
        <p className="text-text-secondary font-medium">{label || item.name}</p>
        <p className="font-mono font-bold text-text-primary mt-1 text-sm tabular-nums">
          {unit === "MXN"
            ? `$${Number(item.value).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`
            : unit === "%"
            ? `${item.value}% ocupación`
            : `${item.value} ${item.value === 1 ? "cita" : "citas"}`}
        </p>
      </div>
    );
  }
  return null;
}
