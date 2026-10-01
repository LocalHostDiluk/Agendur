import type { Cita } from "@/lib/types";
import { getEstadoBadgeProps } from "@/lib/utils/agendas-status";

interface AgendasMesCitaProps {
  c: Cita;
}

export function AgendasMesCita({ c }: AgendasMesCitaProps) {
  const badgeInfo = getEstadoBadgeProps(c.estado);
  const hora = c.hora_inicio ?? c.hora ?? "";

  return (
    <div
      key={c.id}
      className="flex items-center gap-1 text-[10px] font-mono truncate px-1 py-0.5 rounded bg-surface-alt/70 border border-border/50 text-text-secondary group-hover:border-grape/30"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          badgeInfo.variant === "success"
            ? "bg-success"
            : badgeInfo.variant === "warning"
              ? "bg-warning"
              : badgeInfo.variant === "grape"
                ? "bg-grape"
                : "bg-danger"
        }`}
      />
      <span className="tabular-nums font-semibold text-text-primary">
        {hora}
      </span>
      <span className="truncate">
        {c.cliente_nombre ?? c.clienteNombre ?? ""}
      </span>
    </div>
  );
}
