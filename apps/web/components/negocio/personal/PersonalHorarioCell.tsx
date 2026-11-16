import type { Profesional } from "@/lib/types";
interface PersonalHorarioCellProps { horario?: NonNullable<Profesional["horarios"]>[number] }
export function PersonalHorarioCell({ horario }: PersonalHorarioCellProps) {
  return (
    <td
      className="p-2.5 text-center align-middle"
    >
      {horario ? (
        <div className="inline-flex flex-col items-center justify-center p-1.5 rounded-lg bg-mint/10 border border-mint/20 text-mint-dark min-w-[80px]">
          <span className="font-mono tabular-nums text-xs font-bold">
            {horario.hora_inicio.slice(0, 5)}
          </span>
          <span className="text-[9px] text-text-muted select-none">
            a
          </span>
          <span className="font-mono tabular-nums text-xs font-bold">
            {horario.hora_fin.slice(0, 5)}
          </span>
        </div>
      ) : (
        <div className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg bg-surface-alt border border-border text-text-muted text-[11px] min-w-[80px]">
          <span>Descanso</span>
        </div>
      )}
    </td>
  );
}
