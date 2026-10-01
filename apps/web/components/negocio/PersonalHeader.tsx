"use client";
import { ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
interface PersonalHeaderProps {
  canWriteStaff: boolean; setIsPermisosModalOpen: (open: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
}
export function PersonalHeader({ canWriteStaff, setIsPermisosModalOpen, setIsModalOpen }: PersonalHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bricolage font-bold text-text-primary tracking-tight">
          Equipo &amp; Personal
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Gestiona los especialistas y colaboradores de tu negocio, sus
          especialidades y horarios de trabajo.
        </p>
      </div>

      {/* Action Buttons: Roles y Permisos + Registrar Colaborador */}
      {canWriteStaff && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsPermisosModalOpen(true)}
          className="gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-grape" />
          <span>Roles y Permisos</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Colaborador</span>
        </Button>
      </div>}
    </div>
  );
}
