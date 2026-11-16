import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { Sucursal } from "@/lib/types";
import { PersonalHorarioCell } from "./PersonalHorarioCell";
import { PersonalAvatar } from "./PersonalAvatar";
interface PersonalHorarioRowProps { colab: UnifiedColaborador; sucursal?: Sucursal; dias: { dia: number }[] }
export function PersonalHorarioRow({ colab, sucursal, dias }: PersonalHorarioRowProps) {
  return (
    <tr
      className="hover:bg-surface-alt/50 transition-colors"
    >
      {/* Colaborador info */}
      <td className="p-3.5 sticky left-0 bg-surface z-10">
        <div className="flex items-center gap-2.5">
          <PersonalAvatar nombre={colab.nombre} className="size-8 rounded-lg bg-grape/15 text-grape font-bold font-bricolage text-xs flex items-center justify-center shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">
              {colab.nombre} {colab.apellido ?? ""}
            </p>
            <p className="text-[10px] text-text-muted truncate">
              {sucursal?.nombre ||
                colab.rol ||
                "Especialista"}
            </p>
          </div>
        </div>
      </td>

      {/* 7 Días */}
      {dias.map((d) => {
        const horario = colab.horarios?.find(
          (item) => item.dia_semana === d.dia,
        );
        return (
          <PersonalHorarioCell key={d.dia} horario={horario} />
        );
      })}
    </tr>
  );
}
