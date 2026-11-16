"use client";

import React from "react";
import type { Sucursal, Servicio } from "@/lib/types";
import { FRANJAS_HORARIAS, formatServicioOption } from "@/lib/utils/cita-manual-helpers";

export interface ModalCitaManualScheduleFieldsProps {
  sucursales: Sucursal[];
  servicios: Servicio[];
  sucursalId: string;
  onChangeSucursal: (val: string) => void;
  servicioId: string;
  onChangeServicio: (val: string) => void;
  fecha: string;
  onChangeFecha: (val: string) => void;
  hora: string;
  onChangeHora: (val: string) => void;
  isSubmitting: boolean;
}

export function ModalCitaManualScheduleFields({
  sucursales,
  servicios,
  sucursalId,
  onChangeSucursal,
  servicioId,
  onChangeServicio,
  fecha,
  onChangeFecha,
  hora,
  onChangeHora,
  isSubmitting,
}: ModalCitaManualScheduleFieldsProps) {
  return (
    <>
      <div>
        <label
          htmlFor="manual-sucursal"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Sucursal <span className="text-danger">*</span>
        </label>
        <select
          id="manual-sucursal"
          value={sucursalId}
          onChange={(e) => onChangeSucursal(e.target.value)}
          disabled={isSubmitting || sucursales.length === 0}
          required
          className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 cursor-pointer"
        >
          {sucursales.length === 0 ? (
            <option value="" disabled>
              No hay sucursales disponibles
            </option>
          ) : (
            sucursales.map((suc) => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre}
                {suc.es_matriz ? " (Matriz)" : ""}
                {!suc.activa ? " (Inactiva)" : ""}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor="manual-servicio"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Servicio <span className="text-danger">*</span>
        </label>
        <select
          id="manual-servicio"
          value={servicioId}
          onChange={(e) => onChangeServicio(e.target.value)}
          disabled={isSubmitting || servicios.length === 0}
          required
          className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 cursor-pointer"
        >
          {servicios.length === 0 ? (
            <option value="" disabled>
              No hay servicios disponibles
            </option>
          ) : (
            servicios.map((serv) => (
              <option key={serv.id} value={serv.id}>
                {formatServicioOption(serv)}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="manual-fecha"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Fecha <span className="text-danger">*</span>
          </label>
          <input
            id="manual-fecha"
            type="date"
            required
            value={fecha}
            onChange={(e) => onChangeFecha(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="manual-hora"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Hora <span className="text-danger">*</span>
          </label>
          <select
            id="manual-hora"
            value={hora}
            onChange={(e) => onChangeHora(e.target.value)}
            disabled={isSubmitting}
            required
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 cursor-pointer"
          >
            {FRANJAS_HORARIAS.map((slot) => (
              <option key={slot} value={slot}>
                {slot} hrs
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
