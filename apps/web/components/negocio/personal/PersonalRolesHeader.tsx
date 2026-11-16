"use client";
import { ShieldCheck, X } from "lucide-react";
interface PersonalRolesHeaderProps { onClose: () => void }
export function PersonalRolesHeader({ onClose }: PersonalRolesHeaderProps) {
  return (
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-grape" />
              <h2
                id="modal-roles-title"
                className="text-xl font-bricolage font-bold text-text-primary"
              >
                Roles y Permisos del Personal
              </h2>
            </div>
            <p className="text-xs text-text-secondary">
              Estructura de perfiles de acceso para colaboradores del negocio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
  );
}
