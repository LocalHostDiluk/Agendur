import { Plus, Users } from "lucide-react";
import { Badge, Button, PendingBadge } from "@/components/ui";
import type { Profesional, Sucursal } from "@/lib/types";
import { ConfiguracionRolesMatrix } from "./ConfiguracionRolesMatrix";

export interface ConfiguracionTabUsuariosProps {
  ownerNombres?: string | null;
  ownerApellidos?: string | null;
  ownerEmail?: string | null;
  profesionales?: Profesional[];
  sucursales?: Sucursal[];
}

export function ConfiguracionTabUsuarios({
  ownerNombres, ownerApellidos, ownerEmail, profesionales, sucursales,
}: ConfiguracionTabUsuariosProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-grape" />
              <h2 className="font-bricolage font-bold text-lg text-text-primary">Equipo y Permisos de Acceso</h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Administra quién puede acceder al panel, gestionar citas, servicios y reportes comerciales.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <PendingBadge label="Pendiente" tooltip="Gestión avanzada de permisos en desarrollo" />
            <Button variant="secondary" size="sm" disabled className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Invitar usuario</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border text-xs font-medium text-text-secondary">
                <th className="py-3 px-4">Usuario o colaborador</th>
                <th className="py-3 px-4">Rol asignado</th>
                <th className="py-3 px-4">Sucursal</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-surface-alt/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-grape-soft text-grape font-mono font-bold flex items-center justify-center text-xs shrink-0">
                      {ownerNombres?.[0] || "P"}{ownerApellidos?.[0] || "R"}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {ownerNombres ? `${ownerNombres} ${ownerApellidos || ""}`.trim() : "Propietario del Negocio"}
                      </p>
                      <p className="text-xs text-text-secondary font-mono">{ownerEmail || "owner@agendur.com"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4"><Badge variant="grape" size="sm" dot>Propietario</Badge></td>
                <td className="py-3 px-4 text-xs text-text-secondary">Todas las sedes</td>
                <td className="py-3 px-4"><Badge variant="success" size="sm" dot>Activo</Badge></td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs text-text-muted font-medium select-none">Acceso total</span>
                </td>
              </tr>

              {profesionales?.map((profesional) => (
                <tr key={profesional.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-surface-alt border border-border text-text-secondary font-mono font-bold flex items-center justify-center text-xs shrink-0">
                        {profesional.nombre?.[0] || "C"}{profesional.apellido?.[0] || "L"}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{profesional.nombre} {profesional.apellido || ""}</p>
                        <p className="text-xs text-text-secondary font-mono">{profesional.email || "colaborador@negocio.com"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Badge variant="neutral" size="sm" dot>{profesional.cargo || "Profesional"}</Badge></td>
                  <td className="py-3 px-4 text-xs text-text-secondary">
                    {sucursales?.find((s) => s.id === profesional.sucursal_id || s.id === profesional.sucursalId)?.nombre || "Sede asignada"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={profesional.activo !== false ? "success" : "neutral"} size="sm" dot>
                      {profesional.activo !== false ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <PendingBadge label="Pendiente" tooltip="Gestión avanzada de permisos en desarrollo" />
                    </div>
                  </td>
                </tr>
              ))}

              {(!profesionales || profesionales.length === 0) && (
                <tr className="hover:bg-surface-alt/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-surface-alt border border-border text-text-secondary font-mono font-bold flex items-center justify-center text-xs shrink-0">GA</div>
                      <div>
                        <p className="font-medium text-text-primary">Gerente de Operaciones</p>
                        <p className="text-xs text-text-secondary font-mono">gerencia@negocio.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Badge variant="info" size="sm" dot>Administrador</Badge></td>
                  <td className="py-3 px-4 text-xs text-text-secondary">Matriz Centro</td>
                  <td className="py-3 px-4"><Badge variant="success" size="sm" dot>Activo</Badge></td>
                  <td className="py-3 px-4 text-right">
                    <PendingBadge label="Pendiente" tooltip="Gestión avanzada de permisos en desarrollo" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ConfiguracionRolesMatrix />
      </div>
    </div>
  );
}
