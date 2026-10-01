"use client";

import type { Sucursal, Servicio, Profesional } from "@/lib/types";

export interface BookingHiddenInputsProps {
  sucursalActiva?: Sucursal;
  handleSelectSucursal: (id: string) => void;
  sucursales: Sucursal[];
  fecha: string;
  handleSelectFecha: (date: string) => void;
  servicioId: string;
  handleSelectServicio: (id: string) => void;
  servicios: Servicio[];
  moneda: string;
  profesionalId: string;
  onSelectProfesional: (id: string) => void;
  profesionalesDisponibles: Profesional[];
  horaDisponible: string;
  setHora: (hora: string) => void;
  horarios: string[];
}

export function BookingHiddenInputs({
  sucursalActiva,
  handleSelectSucursal,
  sucursales,
  fecha,
  handleSelectFecha,
  servicioId,
  handleSelectServicio,
  servicios,
  moneda,
  profesionalId,
  onSelectProfesional,
  profesionalesDisponibles,
  horaDisponible,
  setHora,
  horarios,
}: BookingHiddenInputsProps) {
  return (
    <>
      {/* Campos accesibles y hidden inputs requeridos por tests */}
      <input
        type="hidden"
        id="reserva-sucursal-hidden"
        name="sucursalId"
        value={sucursalActiva?.id ?? ""}
      />

      <select
        id="reserva-sucursal"
        value={sucursalActiva?.id ?? ""}
        onChange={(e) => handleSelectSucursal(e.target.value)}
        className="sr-only"
        aria-label="Sucursal"
      >
        {sucursales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre} — {s.direccion}
          </option>
        ))}
      </select>

      <input
        id="reserva-fecha"
        type="date"
        aria-label="Fecha"
        value={fecha}
        onChange={(e) => handleSelectFecha(e.target.value)}
        className="sr-only"
      />

      <select
        id="reserva-servicio"
        value={servicioId}
        onChange={(e) => handleSelectServicio(e.target.value)}
        className="sr-only"
        aria-label="Servicio"
      >
        <option value="">Selecciona un servicio</option>
        {servicios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre} — {s.duracion_minutos} min — {s.precio} {moneda}
          </option>
        ))}
      </select>

      <select
        id="reserva-profesional"
        value={profesionalId}
        onChange={(e) => onSelectProfesional(e.target.value)}
        className="sr-only"
        aria-label="Profesional"
      >
        <option value="">Cualquier profesional disponible</option>
        {profesionalesDisponibles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre} {p.apellido}
          </option>
        ))}
      </select>

      <select
        id="reserva-hora"
        value={horaDisponible}
        onChange={(e) => setHora(e.target.value)}
        className="sr-only"
        aria-label="Horario"
      >
        <option value="">Selecciona un horario</option>
        {horarios.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </>
  );
}
