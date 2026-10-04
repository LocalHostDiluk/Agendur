"use client";

import { useEffect } from "react";
import { ShieldCheck, X, Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PendingBadge } from "@/components/ui/PendingBadge";
import { ROLES_PERMISOS_CATALOGO } from "@/lib/utils/personal-role";

interface PersonalRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalRolesModal({ isOpen, onClose }: PersonalRolesModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-roles-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-grape" />
              <h2 id="modal-roles-title" className="text-xl font-bricolage font-bold text-text-primary">
                Roles y Permisos del Personal
              </h2>
            </div>
            <p className="text-xs text-text-secondary">Estructura de perfiles de acceso para colaboradores del negocio.</p>
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

        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-text-primary">Gestión de Permisos Granulares</span>
            </div>
            <PendingBadge label="Pendiente" tooltip="Gestión avanzada de permisos en desarrollo" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Actualmente los permisos se asignan automáticamente según el Rol seleccionado. La personalización granular individual carece de endpoint en backend y se encuentra en desarrollo.
          </p>
        </div>

        <div className="space-y-5">
          {ROLES_PERMISOS_CATALOGO.map((rolItem) => (
            <div key={rolItem.id} className="bg-surface-alt/40 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={rolItem.variant} size="md" dot>{rolItem.nombre}</Badge>
                <PendingBadge label="Pendiente" tooltip="Gestión avanzada de permisos en desarrollo" />
              </div>
              <p className="text-xs text-text-secondary">{rolItem.descripcion}</p>
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">Permisos del perfil</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rolItem.permisos.map((perm) => (
                    <div key={perm.id} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <input type="checkbox" disabled checked={perm.concedido} readOnly className="rounded text-grape focus:ring-grape shrink-0 opacity-70" />
                        <span className={`truncate ${perm.concedido ? "text-text-primary font-medium" : "text-text-muted line-through"}`}>{perm.nombre}</span>
                      </div>
                      <PendingBadge label="Pendiente" tooltip="Gestión avanzada de permisos en desarrollo" className="shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
