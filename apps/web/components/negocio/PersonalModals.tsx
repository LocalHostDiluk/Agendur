"use client";
import type { ComponentProps } from "react";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";
import type { Sucursal, Servicio } from "@/lib/types";
import type { usePersonalActions } from "@/lib/hooks/use-personal-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PersonalRolesModal } from "./PersonalRolesModal";
import { ModalNuevoColaborador } from "./ModalNuevoColaborador";
import { ModalEditarColaborador } from "./ModalEditarColaborador";
interface PersonalModalsProps {
  isPermisosModalOpen: boolean; setIsPermisosModalOpen: (open: boolean) => void;
  isModalOpen: boolean; setIsModalOpen: (open: boolean) => void;
  isEditModalOpen: boolean; setIsEditModalOpen: (open: boolean) => void;
  colaboradorAEditar: UnifiedColaborador | null;
  setColaboradorAEditar: (colab: UnifiedColaborador | null) => void;
  sucursales: Sucursal[]; servicios: Servicio[];
  handleColaboradorCreado: ReturnType<typeof usePersonalActions>["handleColaboradorCreado"];
  handleColaboradorActualizado: ReturnType<typeof usePersonalActions>["handleColaboradorActualizado"];
  dialogProps: ComponentProps<typeof ConfirmDialog>;
}
export function PersonalModals({ isPermisosModalOpen, setIsPermisosModalOpen, isModalOpen,
  setIsModalOpen, isEditModalOpen, setIsEditModalOpen, colaboradorAEditar, setColaboradorAEditar,
  sucursales, servicios, handleColaboradorCreado, handleColaboradorActualizado, dialogProps }: PersonalModalsProps) {
  return (
    <>
      <PersonalRolesModal
        isOpen={isPermisosModalOpen}
        onClose={() => setIsPermisosModalOpen(false)}
      />

      {/* Modal para Registrar Colaborador */}
      <ModalNuevoColaborador
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sucursales={sucursales}
        servicios={servicios}
        onColaboradorCreado={handleColaboradorCreado}
      />

      {/* Modal para Editar Colaborador */}
      {colaboradorAEditar && <ModalEditarColaborador
        key={colaboradorAEditar.id}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setColaboradorAEditar(null);
        }}
        colaborador={colaboradorAEditar}
        sucursales={sucursales}
        servicios={servicios}
        onColaboradorActualizado={handleColaboradorActualizado}
      />}

      {/* Diálogo de Confirmación (Nivel 1 para desactivar, Nivel 2 con verificationText para eliminar) */}
      <ConfirmDialog {...dialogProps} />
    </>
  );
}
