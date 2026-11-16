"use client";

import React from "react";
import { ZONAS_HORARIAS } from "@/lib/utils/modal-sucursal-constants";

interface SucursalModalFieldsProps {
  nombre: string;
  onChangeNombre: (val: string) => void;
  direccion: string;
  onChangeDireccion: (val: string) => void;
  ciudad: string;
  onChangeCiudad: (val: string) => void;
  estadoProvincia: string;
  onChangeEstadoProvincia: (val: string) => void;
  codigoPostal: string;
  onChangeCodigoPostal: (val: string) => void;
  telefono: string;
  onChangeTelefono: (val: string) => void;
  zonaHoraria: string;
  onChangeZonaHoraria: (val: string) => void;
  isSubmitting: boolean;
}

export function SucursalModalFields({
  nombre, onChangeNombre, direccion, onChangeDireccion,
  ciudad, onChangeCiudad, estadoProvincia, onChangeEstadoProvincia,
  codigoPostal, onChangeCodigoPostal, telefono, onChangeTelefono,
  zonaHoraria, onChangeZonaHoraria, isSubmitting,
}: SucursalModalFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="sucursal-nombre" className="block text-xs font-medium text-text-secondary mb-1.5">
          Nombre de la sucursal <span className="text-danger">*</span>
        </label>
        <input
          id="sucursal-nombre" type="text" required maxLength={120}
          placeholder="ej. Sucursal Centro" value={nombre}
          onChange={(e) => onChangeNombre(e.target.value)} disabled={isSubmitting}
          className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="sucursal-direccion" className="block text-xs font-medium text-text-secondary mb-1.5">
          Dirección completa <span className="text-danger">*</span>
        </label>
        <input
          id="sucursal-direccion" type="text" required
          placeholder="ej. Av. Insurgentes Sur 450" value={direccion}
          onChange={(e) => onChangeDireccion(e.target.value)} disabled={isSubmitting}
          className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sucursal-ciudad" className="block text-xs font-medium text-text-secondary mb-1.5">
            Ciudad <span className="text-danger">*</span>
          </label>
          <input
            id="sucursal-ciudad" type="text" required placeholder="ej. CDMX" value={ciudad}
            onChange={(e) => onChangeCiudad(e.target.value)} disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="sucursal-estado" className="block text-xs font-medium text-text-secondary mb-1.5">
            Estado o Provincia <span className="text-text-muted text-[11px]">(opcional)</span>
          </label>
          <input
            id="sucursal-estado" type="text" placeholder="ej. CDMX" value={estadoProvincia}
            onChange={(e) => onChangeEstadoProvincia(e.target.value)} disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sucursal-cp" className="block text-xs font-medium text-text-secondary mb-1.5">
            Código Postal <span className="text-text-muted text-[11px]">(opcional)</span>
          </label>
          <input
            id="sucursal-cp" type="text" maxLength={10} placeholder="ej. 06700" value={codigoPostal}
            onChange={(e) => onChangeCodigoPostal(e.target.value)} disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="sucursal-telefono" className="block text-xs font-medium text-text-secondary mb-1.5">
            Teléfono de contacto <span className="text-danger">*</span>
          </label>
          <input
            id="sucursal-telefono" type="tel" inputMode="tel" required
            placeholder="ej. +525512345678" value={telefono}
            onChange={(e) => onChangeTelefono(e.target.value)} disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="sucursal-tz" className="block text-xs font-medium text-text-secondary mb-1.5">
          Zona horaria
        </label>
        <select
          id="sucursal-tz" value={zonaHoraria} onChange={(e) => onChangeZonaHoraria(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 cursor-pointer"
        >
          {ZONAS_HORARIAS.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label} ({tz.value})</option>
          ))}
        </select>
      </div>
    </>
  );
}
