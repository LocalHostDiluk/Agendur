import { useState } from "react";
import type { Sucursal, Servicio } from "@/lib/types";
import { notify } from "@/lib/utils/toast";
import { useCreateProfesional } from "@/lib/hooks";
import { buildUniformProfessionalSchedule } from "@/lib/schedules/professional";
import type { ColaboradorCreadoPayload } from "@/lib/utils/modal-colaborador-constants";

interface UseModalColaboradorCreateParams {
  sucursales: Sucursal[];
  servicios: Servicio[];
  onClose: () => void;
  onColaboradorCreado?: (colaborador: ColaboradorCreadoPayload) => void;
}

export function useModalColaboradorCreate({
  sucursales,
  servicios,
  onClose,
  onColaboradorCreado,
}: UseModalColaboradorCreateParams) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const defaultSucursalId = sucursales.find((s) => s.es_matriz)?.id || sucursales[0]?.id || "";
  const [sucursalId, setSucursalId] = useState(defaultSucursalId);
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("Especialista");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("18:00");
  const [diasLaborables, setDiasLaborables] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const createProfesional = useCreateProfesional();

  const toggleServicio = (id: string) =>
    setSelectedServicios((prev) => (prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]));
  const toggleDia = (dia: number) =>
    setDiasLaborables((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]));
  const selectAllServicios = () =>
    setSelectedServicios(selectedServicios.length === servicios.length ? [] : servicios.map((s) => s.id));

  const resetForm = () => {
    setNombre(""); setApellido(""); setEmail(""); setTelefono(""); setRol("Especialista");
    setSelectedServicios([]); setHoraInicio("09:00"); setHoraFin("18:00"); setDiasLaborables([1, 2, 3, 4, 5, 6]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return void notify.warning("Campo requerido", "El nombre es obligatorio.");
    if (!apellido.trim()) return void notify.warning("Campo requerido", "El apellido es obligatorio.");
    if (!sucursalId) return void notify.warning("Campo requerido", "Selecciona una sucursal para el colaborador.");
    if (diasLaborables.length === 0) return void notify.warning("Horario requerido", "Selecciona al menos un día laboral.");
    if (horaInicio >= horaFin) return void notify.warning("Horario inválido", "La hora de salida debe ser posterior a la entrada.");

    try {
      const { profesional: prof } = await createProfesional.mutateAsync({
        nombre: nombre.trim(), apellido: apellido.trim(), sucursal_id: sucursalId, cargo: rol,
        email: email.trim() || null, telefono: telefono.trim() || null, serviciosIds: selectedServicios,
        horarios: buildUniformProfessionalSchedule(diasLaborables, horaInicio, horaFin), activo: true,
      });
      notify.success("Colaborador registrado", `${prof.nombre} ${prof.apellido ?? ""} ha sido agregado al equipo de trabajo.`);
      onColaboradorCreado?.({
        id: prof.id, nombre: prof.nombre, apellido: prof.apellido ?? "", sucursal_id: prof.sucursal_id ?? sucursalId,
        email: prof.email || "", telefono: prof.telefono || "", serviciosIds: prof.serviciosIds ?? selectedServicios,
        rol: prof.cargo || rol, hora_inicio: horaInicio, hora_fin: horaFin, dias_laborables: diasLaborables, activo: true,
      });
      resetForm();
      onClose();
    } catch (err: unknown) {
      notify.error("No se pudo registrar", err instanceof Error ? err.message : "Error al registrar colaborador.");
    }
  };

  return {
    nombre, setNombre, apellido, setApellido, sucursalId, setSucursalId,
    email, setEmail, telefono, setTelefono, rol, setRol,
    selectedServicios, toggleServicio, selectAllServicios,
    horaInicio, setHoraInicio, horaFin, setHoraFin, diasLaborables, toggleDia,
    isPending: createProfesional.isPending, handleSubmit,
  };
}
