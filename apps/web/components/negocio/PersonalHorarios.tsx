import { Calendar } from "lucide-react";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { Sucursal } from "@/lib/types";
import { HorariosEspecialesPanel } from "./HorariosEspecialesPanel";
import { PersonalHorarioRow } from "./PersonalHorarioRow";
interface PersonalHorariosProps {
  colaboradoresFiltrados: UnifiedColaborador[]; todosLosColaboradores: UnifiedColaborador[];
  sucursales: Sucursal[]; canWrite: boolean;
}
const DIAS_SEMANA_HEADERS = [
  { dia: 1, nombre: "Lunes", corto: "Lun" },
  { dia: 2, nombre: "Martes", corto: "Mar" },
  { dia: 3, nombre: "Miércoles", corto: "Mié" },
  { dia: 4, nombre: "Jueves", corto: "Jue" },
  { dia: 5, nombre: "Viernes", corto: "Vie" },
  { dia: 6, nombre: "Sábado", corto: "Sáb" },
  { dia: 0, nombre: "Domingo", corto: "Dom" },
];
export function PersonalHorarios({ colaboradoresFiltrados, todosLosColaboradores,
  sucursales, canWrite }: PersonalHorariosProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
      <div className="p-4 border-b border-border bg-surface-alt flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="font-bricolage font-bold text-base text-text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-grape" />
            <span>Turnos y Jornadas Semanales</span>
          </h2>
          <p className="text-xs text-text-secondary">
            Horarios de disponibilidad habitual de los colaboradores de
            lunes a domingo.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="size-2.5 rounded-full bg-mint" />
          <span>Jornada activa</span>
          <span className="size-2.5 rounded-full bg-border ml-2" />
          <span>Día de descanso</span>
        </div>
      </div>

      {/* Weekly Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-text-secondary w-56 sticky left-0 bg-surface z-10">
                Colaborador
              </th>
              {DIAS_SEMANA_HEADERS.map((d) => (
                <th
                  key={d.dia}
                  className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  <span className="block font-bricolage font-bold text-text-primary">
                    {d.corto}
                  </span>
                  <span className="text-[10px] text-text-muted font-normal">
                    {d.nombre}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {colaboradoresFiltrados.map((colab) => {
              const sucursal = sucursales.find(
                (s) => s.id === colab.sucursal_id,
              );

              return (
                <PersonalHorarioRow key={colab.id} colab={colab} sucursal={sucursal} dias={DIAS_SEMANA_HEADERS} />
              );
            })}
          </tbody>
        </table>
      </div>
      <HorariosEspecialesPanel
        sucursales={sucursales}
        profesionales={todosLosColaboradores}
        canWrite={canWrite}
      />
    </div>
  );
}
