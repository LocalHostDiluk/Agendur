import { useState } from "react";
import { useCreateSucursal } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";

interface UseModalSucursalFormParams {
  onClose: () => void;
  onSuccess?: () => void;
}

export function useModalSucursalForm({ onClose, onSuccess }: UseModalSucursalFormParams) {
  const createSucursal = useCreateSucursal();

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estadoProvincia, setEstadoProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [telefono, setTelefono] = useState("");
  const [zonaHoraria, setZonaHoraria] = useState("America/Mexico_City");

  const resetForm = () => {
    setNombre("");
    setDireccion("");
    setCiudad("");
    setEstadoProvincia("");
    setCodigoPostal("");
    setTelefono("");
    setZonaHoraria("America/Mexico_City");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !direccion.trim() || !ciudad.trim() || !telefono.trim()) {
      notify.warning("Campos incompletos", "Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      await createSucursal.mutateAsync({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        ciudad: ciudad.trim(),
        estado_provincia: estadoProvincia.trim() || undefined,
        codigo_postal: codigoPostal.trim() || undefined,
        telefono: telefono.trim(),
        zona_horaria: zonaHoraria,
        activa: true,
      });

      notify.success("Sucursal creada", "La sucursal está lista para recibir citas.");
      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: unknown) {
      notify.error(err, "No se pudo crear la sucursal.");
    }
  };

  return {
    nombre,
    setNombre,
    direccion,
    setDireccion,
    ciudad,
    setCiudad,
    estadoProvincia,
    setEstadoProvincia,
    codigoPostal,
    setCodigoPostal,
    telefono,
    setTelefono,
    zonaHoraria,
    setZonaHoraria,
    isSubmitting: createSucursal.isPending,
    handleSubmit,
  };
}
