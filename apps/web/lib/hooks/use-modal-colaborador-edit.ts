import { useState } from "react";
import type { Sucursal, Servicio } from "@/lib/types";
import { notify } from "@/lib/utils/toast";
import { useUpdateProfesional } from "@/lib/hooks";
import type { UnifiedColaborador } from "@/app/(negocio)/personal/page";

interface UseModalColaboradorEditParams {
  colaborador: UnifiedColaborador;
  sucursales: Sucursal[];
  servicios: Servicio[];
  onClose: () => void;
  onColaboradorActualizado?: (colaborador: UnifiedColaborador) => void;
}

export function useModalColaboradorEdit({
  colaborador,
  sucursales,
  servicios,
  onClose,
  onColaboradorActualizado,
}: UseModalColaboradorEditParams) {
  const [nombre, setNombre] = useState(colaborador.nombre || "");
  const [apellido, setApellido] = useState(colaborador.apellido || "");
  const [sucursalId, setSucursalId] = useState(colaborador.sucursal_id || sucursales[0]?.id || "");
  const [email, setEmail] = useState(colaborador.email || "");
  const [telefono, setTelefono] = useState(colaborador.telefono || "");
  const [avatarUrl, setAvatarUrl] = useState(colaborador.avatar_url || colaborador.avatarUrl || "");
  const [rol, setRol] = useState(colaborador.cargo || colaborador.rol || "Especialista");
  const [selectedServicios, setSelectedServicios] = useState<string[]>(colaborador.serviciosIds || []);
  const [activo, setActivo] = useState(colaborador.activo !== false);
  const updateProfesional = useUpdateProfesional();

  const toggleServicio = (id: string) =>
    setSelectedServicios((prev) => (prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]));
  const selectAllServicios = () =>
    setSelectedServicios(selectedServicios.length === servicios.length ? [] : servicios.map((s) => s.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return void notify.warning("Campo requerido", "El nombre es obligatorio.");
    if (!apellido.trim()) return void notify.warning("Campo requerido", "El apellido es obligatorio.");
    if (!sucursalId) return void notify.warning("Campo requerido", "Selecciona una sucursal para el colaborador.");

    try {
      const { profesional: updated } = await updateProfesional.mutateAsync({
        id: colaborador.id, nombre: nombre.trim(), apellido: apellido.trim(), sucursal_id: sucursalId,
        cargo: rol, email: email.trim() || null, telefono: telefono.trim() || null,
        avatar_url: avatarUrl || null, serviciosIds: selectedServicios, activo,
      });
      notify.success("Colaborador actualizado", `Se guardaron los cambios para ${updated.nombre} ${updated.apellido ?? ""}.`);
      onColaboradorActualizado?.({
        ...colaborador, nombre: updated.nombre, apellido: updated.apellido ?? "",
        sucursal_id: updated.sucursal_id ?? sucursalId, email: updated.email || null,
        telefono: updated.telefono || null, avatar_url: updated.avatar_url || null,
        cargo: updated.cargo || rol, rol: updated.cargo || rol,
        serviciosIds: updated.serviciosIds ?? selectedServicios, activo: updated.activo ?? activo,
      });
      onClose();
    } catch (err: unknown) {
      notify.error("No se pudo actualizar", err instanceof Error ? err.message : "Error al actualizar colaborador.");
    }
  };

  return {
    nombre, setNombre, apellido, setApellido, sucursalId, setSucursalId,
    email, setEmail, telefono, setTelefono, avatarUrl, setAvatarUrl,
    rol, setRol, selectedServicios, toggleServicio, selectAllServicios,
    activo, setActivo, isPending: updateProfesional.isPending, handleSubmit,
  };
}
