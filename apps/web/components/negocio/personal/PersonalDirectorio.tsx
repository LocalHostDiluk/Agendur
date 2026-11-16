import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { Sucursal, Servicio, Cita } from "@/lib/types";
import { getPersonalColaboradorDetails } from "@/lib/utils/personal-colaboradores";
import { PersonalColaboradorCard } from "./PersonalColaboradorCard";
import { PersonalColaboradorRow } from "./PersonalColaboradorRow";
import { PersonalColaboradorActions } from "./PersonalColaboradorActions";
interface PersonalDirectorioProps {
  colaboradoresFiltrados: UnifiedColaborador[]; sucursales: Sucursal[]; servicios: Servicio[]; citas: Cita[];
  canWriteStaff: boolean; setActiveTab: (tab: "directorio" | "horarios") => void;
  setColaboradorAEditar: (colab: UnifiedColaborador | null) => void;
  setIsEditModalOpen: (open: boolean) => void;
  handleToggleActivo: (colab: UnifiedColaborador) => Promise<void>;
  handleEliminarColaborador: (colab: UnifiedColaborador) => Promise<void>;
}
export function PersonalDirectorio({ colaboradoresFiltrados, sucursales, servicios, citas,
  canWriteStaff, setActiveTab, setColaboradorAEditar, setIsEditModalOpen,
  handleToggleActivo, handleEliminarColaborador }: PersonalDirectorioProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* MOBILE VIEW (<640px): Tarjetas limpias apiladas (§8) */}
      <div
        className="sm:hidden space-y-3.5"
        data-testid="colaboradores-mobile-list"
      >
        {colaboradoresFiltrados.map((colab) => {
          const { sucursal, serviciosDelColab, citasAsignadas, esActivo } = getPersonalColaboradorDetails(colab, sucursales, servicios, citas);

          return (
            <PersonalColaboradorCard key={`mob-${colab.id}`} colab={colab} sucursal={sucursal} serviciosDelColab={serviciosDelColab} citasAsignadas={citasAsignadas} esActivo={esActivo} canWriteStaff={canWriteStaff} acciones={<PersonalColaboradorActions colab={colab} esActivo={esActivo} setActiveTab={setActiveTab} setColaboradorAEditar={setColaboradorAEditar} setIsEditModalOpen={setIsEditModalOpen} handleToggleActivo={handleToggleActivo} handleEliminarColaborador={handleEliminarColaborador} />} />
          );
        })}
      </div>

      {/* DESKTOP / TABLET VIEW (>=640px): Tabla completa (§5.5, §8) */}
      <div className="hidden sm:block bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-secondary text-xs font-medium">
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Colaborador
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Rol
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Sucursal
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Especialidades
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px] text-center">
                  Citas
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px]">
                  Estado
                </th>
                <th className="p-3.5 text-text-secondary font-medium uppercase tracking-wider text-[11px] text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {colaboradoresFiltrados.map((colab) => {
                const { sucursal, serviciosDelColab, citasAsignadas, esActivo } = getPersonalColaboradorDetails(colab, sucursales, servicios, citas);

                return (
                  <PersonalColaboradorRow key={`desk-${colab.id}`} colab={colab} sucursal={sucursal} serviciosDelColab={serviciosDelColab} citasAsignadas={citasAsignadas} esActivo={esActivo} canWriteStaff={canWriteStaff} acciones={<PersonalColaboradorActions colab={colab} esActivo={esActivo} setActiveTab={setActiveTab} setColaboradorAEditar={setColaboradorAEditar} setIsEditModalOpen={setIsEditModalOpen} handleToggleActivo={handleToggleActivo} handleEliminarColaborador={handleEliminarColaborador} />} />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
