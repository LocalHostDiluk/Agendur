"use client";

import React from "react";

export interface ModalCitaManualClientFieldsProps {
  clienteNombre: string;
  onChangeNombre: (val: string) => void;
  clienteApellido: string;
  onChangeApellido: (val: string) => void;
  clientePhone: string;
  onChangePhone: (val: string) => void;
  clienteEmail: string;
  onChangeEmail: (val: string) => void;
  notasCliente: string;
  onChangeNotas: (val: string) => void;
  isSubmitting: boolean;
}

export function ModalCitaManualClientFields({
  clienteNombre,
  onChangeNombre,
  clienteApellido,
  onChangeApellido,
  clientePhone,
  onChangePhone,
  clienteEmail,
  onChangeEmail,
  notasCliente,
  onChangeNotas,
  isSubmitting,
}: ModalCitaManualClientFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="manual-cliente-nombre"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            id="manual-cliente-nombre"
            type="text"
            required
            placeholder="ej. Juan"
            value={clienteNombre}
            onChange={(e) => onChangeNombre(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="manual-cliente-apellido"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Apellido <span className="text-danger">*</span>
          </label>
          <input
            id="manual-cliente-apellido"
            type="text"
            required
            placeholder="ej. Pérez"
            value={clienteApellido}
            onChange={(e) => onChangeApellido(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="manual-cliente-telefono"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Teléfono <span className="text-danger">*</span>
          </label>
          <input
            id="manual-cliente-telefono"
            type="tel"
            inputMode="tel"
            required
            placeholder="+525512345678"
            value={clientePhone}
            onChange={(e) => onChangePhone(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="manual-cliente-email"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Correo electrónico{" "}
            <span className="text-text-muted text-[11px]">(opcional)</span>
          </label>
          <input
            id="manual-cliente-email"
            type="email"
            inputMode="email"
            placeholder="ej. cliente@correo.com"
            value={clienteEmail}
            onChange={(e) => onChangeEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="manual-cliente-notas"
          className="block text-xs font-medium text-text-secondary mb-1.5"
        >
          Notas o requerimientos especiales{" "}
          <span className="text-text-muted text-[11px]">(opcional)</span>
        </label>
        <textarea
          id="manual-cliente-notas"
          rows={2}
          placeholder="Alergias, preferencias o detalles de la cita..."
          value={notasCliente}
          onChange={(e) => onChangeNotas(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3.5 py-2 rounded-md bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-grape focus:ring-2 focus:ring-grape-soft disabled:opacity-50 resize-none"
        />
      </div>
    </>
  );
}
