import { MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { getPersonalColaboradorDetails } from "@/lib/utils/personal-colaboradores";
import { PersonalRolBadge } from "./PersonalRolBadge";
import { PersonalEstadoBadge } from "./PersonalEstadoBadge";
import { PersonalServicioBadge } from "./PersonalServicioBadge";
interface PersonalColaboradorRowProps extends ReturnType<typeof getPersonalColaboradorDetails> {
  colab: UnifiedColaborador; canWriteStaff: boolean; acciones: ReactNode;
}
export function PersonalColaboradorRow({ colab, sucursal, serviciosDelColab, citasAsignadas, esActivo,
  canWriteStaff, acciones }: PersonalColaboradorRowProps) {
  return (
    <tr
      className="hover:bg-surface-alt transition-colors min-h-[48px]"
    >
      {/* Colaborador */}
      <td className="p-3.5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-gradient-to-br from-grape/20 to-grape/10 border border-grape/30 flex items-center justify-center text-grape font-bricolage font-bold text-sm shrink-0">
            {colab.nombre[0]}
            {(colab.apellido || "")[0] || ""}
          </div>
          <div className="min-w-0">
            <p className="font-bricolage font-bold text-sm text-text-primary truncate">
              {colab.nombre} {colab.apellido ?? ""}
            </p>
            {colab.email && (
              <p className="text-xs text-text-muted truncate">
                {colab.email}
              </p>
            )}
            {colab.telefono && (
              <p className="text-[11px] font-mono tabular-nums text-text-muted truncate">
                {colab.telefono}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Rol */}
      <td className="p-3.5">
        <PersonalRolBadge rol={colab.rol} />
      </td>

      {/* Sucursal */}
      <td className="p-3.5">
        {sucursal ? (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate">
              {sucursal.nombre}
            </span>
          </div>
        ) : (
          <span className="text-xs text-text-muted italic">
            Sin sucursal
          </span>
        )}
      </td>

      {/* Especialidades */}
      <td className="p-3.5">
        {serviciosDelColab.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {serviciosDelColab.map((serv) => (
        <PersonalServicioBadge key={serv.id} serv={serv} />
            ))}
          </div>
        ) : (
          <span className="text-xs text-text-muted italic">
            Sin servicios asignados
          </span>
        )}
      </td>

      {/* Citas */}
      <td className="p-3.5 text-center">
        <span className="font-mono tabular-nums text-xs font-bold text-text-primary">
          {citasAsignadas.length}
        </span>
      </td>

      {/* Estado */}
      <td className="p-3.5">
        <PersonalEstadoBadge esActivo={esActivo} />
      </td>

      {/* Acciones */}
      <td className="p-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {canWriteStaff && <>
        {acciones}
          </>}
        </div>
      </td>
    </tr>
  );
}
