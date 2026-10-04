"use client";

import { CalendarDays, Pencil, UserX, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PersonalColaboradorActionsProps {
  nombre: string;
  esActivo: boolean;
  canWriteStaff: boolean;
  onViewHorarios: () => void;
  onEdit: () => void;
  onToggleActivo: () => void;
  onDelete: () => void;
}

export function PersonalColaboradorActions({
  nombre,
  esActivo,
  canWriteStaff,
  onViewHorarios,
  onEdit,
  onToggleActivo,
  onDelete,
}: PersonalColaboradorActionsProps) {
  if (!canWriteStaff) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onViewHorarios}
        className="gap-1 text-xs"
      >
        <CalendarDays className="w-3.5 h-3.5 text-grape" />
        <span className="hidden sm:inline">Horarios</span>
        <span className="sm:hidden">Ver horarios</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Editar colaborador"
        onClick={onEdit}
        aria-label={`Editar a ${nombre}`}
        className="p-1.5"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>

      <Button
        type="button"
        variant={esActivo ? "ghost" : "secondary"}
        size="sm"
        title={esActivo ? "Desactivar colaborador" : "Reactivar colaborador"}
        onClick={onToggleActivo}
        aria-label={esActivo ? `Desactivar a ${nombre}` : `Activar a ${nombre}`}
        className={`p-1.5 ${esActivo ? "text-danger hover:bg-danger/10" : "text-mint-dark hover:bg-mint/10"}`}
      >
        {esActivo ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Eliminar colaborador"
        onClick={onDelete}
        aria-label={`Eliminar a ${nombre}`}
        className="p-1.5 text-danger hover:bg-danger/10"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
