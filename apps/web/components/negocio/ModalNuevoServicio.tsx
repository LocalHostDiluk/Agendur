"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateServicio } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";

export interface ModalNuevoServicioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESETS_DURACION = [15, 30, 45, 60, 90, 120];

export function ModalNuevoServicio({
  isOpen,
  onClose,
  onSuccess,
}: ModalNuevoServicioProps) {
  const createServicio = useCreateServicio();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracionMinutos, setDuracionMinutos] = useState<number | string>(30);
  const [precio, setPrecio] = useState<number | string>("");

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setDuracionMinutos(30);
    setPrecio("");
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      notify.warning(
        "Nombre obligatorio",
        "Por favor ingresa el nombre del servicio.",
      );
      return;
    }

    const duracion = Number(duracionMinutos);
    if (!duracion || isNaN(duracion) || duracion <= 0) {
      notify.warning(
        "Duración inválida",
        "La duración debe ser un número mayor a 0 minutos.",
      );
      return;
    }

    const numPrecio = Number(precio);
    if (precio === "" || isNaN(numPrecio) || numPrecio < 0) {
      notify.warning(
        "Precio inválido",
        "El precio debe ser un número mayor o igual a 0.",
      );
      return;
    }

    try {
      await createServicio.mutateAsync({
        nombre: nombre.trim(),
        duracion_minutos: duracion,
        precio: numPrecio,
        descripcion: descripcion.trim() || undefined,
      });

      notify.success(
        "Servicio creado",
        "El servicio ya está disponible en tu catálogo.",
      );
      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: unknown) {
      notify.error(err, "No se pudo registrar el servicio.");
    }
  };

  const isSubmitting = createServicio.isPending;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-nuevo-servicio-title"
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transform transition-all text-text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border bg-surface">
          <div>
            <h2
              id="modal-nuevo-servicio-title"
              className="text-xl sm:text-2xl font-bricolage font-bold tracking-tight text-text-primary"
            >
              Nuevo Servicio
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Configura el servicio que tus clientes podrán reservar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Nombre del servicio */}
          <div>
            <label
              htmlFor="servicio-nombre"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Nombre del servicio <span className="text-danger">*</span>
            </label>
            <input
              id="servicio-nombre"
              type="text"
              required
              maxLength={120}
              placeholder="ej. Corte de Cabello Clásico"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
            />
          </div>

          {/* Descripción (opcional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="servicio-descripcion"
                className="block text-xs font-medium text-text-secondary"
              >
                Descripción{" "}
                <span className="text-text-muted text-[11px]">(opcional)</span>
              </label>
              <span className="font-mono text-[11px] text-text-muted">
                {descripcion.length}/200
              </span>
            </div>
            <textarea
              id="servicio-descripcion"
              rows={3}
              maxLength={200}
              placeholder="Configura el servicio que tus clientes podrán reservar."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 resize-none"
            />
          </div>

          {/* Duración en minutos */}
          <div>
            <label
              htmlFor="servicio-duracion"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Duración en minutos <span className="text-danger">*</span>
            </label>

            {/* Presets rápidos */}
            <div className="flex flex-wrap gap-2 mb-2.5">
              {PRESETS_DURACION.map((minutos) => {
                const isSelected = Number(duracionMinutos) === minutos;
                return (
                  <button
                    key={minutos}
                    type="button"
                    onClick={() => setDuracionMinutos(minutos)}
                    disabled={isSubmitting}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-grape text-white border-grape shadow-xs"
                        : "bg-surface-alt text-text-secondary border-border hover:bg-surface hover:text-text-primary"
                    } disabled:opacity-50`}
                  >
                    {minutos} min
                  </button>
                );
              })}
            </div>

            {/* Input libre */}
            <div className="relative flex items-center">
              <input
                id="servicio-duracion"
                type="number"
                min={1}
                step={1}
                required
                placeholder="30"
                value={duracionMinutos}
                onChange={(e) => setDuracionMinutos(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 pr-12 rounded-md bg-surface border border-border text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
              <span className="absolute right-3.5 text-xs font-mono text-text-muted pointer-events-none select-none">
                min
              </span>
            </div>
          </div>

          {/* Precio en MXN */}
          <div>
            <label
              htmlFor="servicio-precio"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Precio en MXN <span className="text-danger">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-mono font-medium text-text-muted pointer-events-none select-none">
                $
              </span>
              <input
                id="servicio-precio"
                type="number"
                min={0}
                step="any"
                required
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-8 pr-16 py-2 rounded-md bg-surface border border-border text-sm font-mono font-medium text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
              <span className="absolute right-3.5 text-xs font-mono font-medium text-text-muted pointer-events-none select-none">
                MXN
              </span>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg text-text-secondary bg-surface border border-border hover:bg-surface-alt transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg text-white bg-grape hover:opacity-95 active:scale-[0.98] transition-all focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Servicio</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
