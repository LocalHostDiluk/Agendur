"use client";

import { ModalNuevoColaborador, ModalEditarColaborador, ModalHorariosProfesional } from "@/components/negocio";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PersonalRolesModal } from "./PersonalRolesModal";
import type { useConfirmDialog, usePersonalActions, usePersonalData } from "@/lib/hooks";

interface PersonalModalsProps {
  actions: ReturnType<typeof usePersonalActions>;
  data: ReturnType<typeof usePersonalData>;
  confirmDialogProps: ReturnType<typeof useConfirmDialog>["dialogProps"];
}

export function PersonalModals({ actions, data, confirmDialogProps }: PersonalModalsProps) {
  return (
    <>
      <PersonalRolesModal
        isOpen={actions.isRolesOpen}
        onClose={() => actions.setIsRolesOpen(false)}
      />

      <ModalNuevoColaborador
        isOpen={actions.isNuevoOpen}
        onClose={() => actions.setIsNuevoOpen(false)}
        sucursales={data.sucursales}
        servicios={data.servicios}
        onColaboradorCreado={actions.handleColaboradorCreado}
      />

      {actions.editingColab && (
        <ModalEditarColaborador
          key={actions.editingColab.id}
          isOpen={Boolean(actions.editingColab)}
          onClose={() => actions.setEditingColab(null)}
          colaborador={actions.editingColab}
          sucursales={data.sucursales}
          servicios={data.servicios}
          onColaboradorActualizado={actions.handleColaboradorActualizado}
          onOpenHorarios={() => {
            const target = actions.editingColab;
            actions.setEditingColab(null);
            actions.setEditingHorariosColab(target);
          }}
        />
      )}

      {actions.editingHorariosColab && (
        <ModalHorariosProfesional
          key={`hor-${actions.editingHorariosColab.id}`}
          isOpen={Boolean(actions.editingHorariosColab)}
          onClose={() => actions.setEditingHorariosColab(null)}
          profesional={actions.editingHorariosColab}
          sucursalNombre={data.sucursales.find((s) => s.id === actions.editingHorariosColab?.sucursal_id)?.nombre}
        />
      )}

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
