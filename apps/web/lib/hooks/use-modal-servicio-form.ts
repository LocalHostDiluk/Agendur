import { useState } from "react";
import { useCreateServicio } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";

interface UseModalServicioFormParams {
  onClose: () => void;
  onSuccess?: () => void;
}

export function useModalServicioForm({ onClose, onSuccess }: UseModalServicioFormParams) {
  const createServicio = useCreateServicio();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracionMinutos, setDuracionMinutos] = useState<number | string>(30);
  const [bufferMinutos, setBufferMinutos] = useState<number | string>(0);
  const [precio, setPrecio] = useState<number | string>("");

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setDuracionMinutos(30);
    setBufferMinutos(0);
    setPrecio("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      notify.warning("Nombre obligatorio", "Por favor ingresa el nombre del servicio.");
      return;
    }

    const duracion = Number(duracionMinutos);
    if (!duracion || isNaN(duracion) || duracion <= 0) {
      notify.warning("Duración inválida", "La duración debe ser un número mayor a 0 minutos.");
      return;
    }

    const numPrecio = Number(precio);
    if (precio === "" || isNaN(numPrecio) || numPrecio < 0) {
      notify.warning("Precio inválido", "El precio debe ser un número mayor o igual a 0.");
      return;
    }

    const buffer = Number(bufferMinutos);
    if (bufferMinutos === "" || !Number.isInteger(buffer) || buffer < 0) {
      notify.warning(
        "Tiempo entre citas inválido",
        "El tiempo entre citas debe ser un entero mayor o igual a 0 minutos.",
      );
      return;
    }

    try {
      await createServicio.mutateAsync({
        nombre: nombre.trim(),
        duracion_minutos: duracion,
        buffer_minutos: buffer,
        precio: numPrecio,
        descripcion: descripcion.trim() || undefined,
      });

      notify.success("Servicio creado", "El servicio ya está disponible en tu catálogo.");
      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: unknown) {
      notify.error(err, "No se pudo registrar el servicio.");
    }
  };

  return {
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    duracionMinutos,
    setDuracionMinutos,
    bufferMinutos,
    setBufferMinutos,
    precio,
    setPrecio,
    isSubmitting: createServicio.isPending,
    handleSubmit,
  };
}
