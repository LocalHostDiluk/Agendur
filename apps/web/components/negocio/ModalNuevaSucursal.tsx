"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateSucursal } from "@/lib/hooks";
import { notify } from "@/lib/utils/toast";

export interface ModalNuevaSucursalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ZONAS_HORARIAS = [
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Monterrey", label: "Monterrey (GMT-6)" },
  { value: "America/Tijuana", label: "Tijuana (GMT-8)" },
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Santiago", label: "Santiago (GMT-4)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
];

export function ModalNuevaSucursal({
  isOpen,
  onClose,
  onSuccess,
}: ModalNuevaSucursalProps) {
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

    if (!nombre.trim() || !direccion.trim() || !ciudad.trim() || !telefono.trim()) {
      notify.warning(
        "Campos incompletos",
        "Por favor completa todos los campos requeridos.",
      );
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

      notify.success(
        "Sucursal creada",
        "La sucursal está lista para recibir citas.",
      );
      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: unknown) {
      notify.error(err, "No se pudo crear la sucursal.");
    }
  };

  const isSubmitting = createSucursal.isPending;

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
        aria-labelledby="modal-nueva-sucursal-title"
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transform transition-all text-text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border bg-surface">
          <div>
            <h2
              id="modal-nueva-sucursal-title"
              className="text-xl sm:text-2xl font-bricolage font-bold tracking-tight text-text-primary"
            >
              Nueva Sucursal
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Registra una nueva sede para asignar personal y habilitar horarios.
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
          {/* Nombre de la sucursal */}
          <div>
            <label
              htmlFor="sucursal-nombre"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Nombre de la sucursal <span className="text-danger">*</span>
            </label>
            <input
              id="sucursal-nombre"
              type="text"
              required
              maxLength={120}
              placeholder="ej. Sucursal Centro"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
            />
          </div>

          {/* Dirección */}
          <div>
            <label
              htmlFor="sucursal-direccion"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Dirección completa <span className="text-danger">*</span>
            </label>
            <input
              id="sucursal-direccion"
              type="text"
              required
              placeholder="ej. Av. Insurgentes Sur 450"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
            />
          </div>

          {/* Ciudad y Estado/Provincia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sucursal-ciudad"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Ciudad <span className="text-danger">*</span>
              </label>
              <input
                id="sucursal-ciudad"
                type="text"
                required
                placeholder="ej. CDMX"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="sucursal-estado"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Estado o Provincia{" "}
                <span className="text-text-muted text-[11px]">(opcional)</span>
              </label>
              <input
                id="sucursal-estado"
                type="text"
                placeholder="ej. CDMX"
                value={estadoProvincia}
                onChange={(e) => setEstadoProvincia(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
          </div>

          {/* Código Postal y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sucursal-cp"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Código Postal{" "}
                <span className="text-text-muted text-[11px]">(opcional)</span>
              </label>
              <input
                id="sucursal-cp"
                type="text"
                maxLength={10}
                placeholder="ej. 06700"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="sucursal-telefono"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Teléfono de contacto <span className="text-danger">*</span>
              </label>
              <input
                id="sucursal-telefono"
                type="tel"
                inputMode="tel"
                required
                placeholder="ej. +525512345678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
              />
            </div>
          </div>

          {/* Zona Horaria */}
          <div>
            <label
              htmlFor="sucursal-tz"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Zona horaria
            </label>
            <select
              id="sucursal-tz"
              value={zonaHoraria}
              onChange={(e) => setZonaHoraria(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 cursor-pointer"
            >
              {ZONAS_HORARIAS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.value})
                </option>
              ))}
            </select>
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
                <span>Crear Sucursal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
