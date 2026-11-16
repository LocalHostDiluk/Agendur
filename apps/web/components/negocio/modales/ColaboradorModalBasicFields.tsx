"use client";

import React from "react";
import { Store } from "lucide-react";
import type { Sucursal } from "@/lib/types";
import { PendingBadge } from "@/components/ui/PendingBadge";
import { COLABORADOR_ROLES } from "@/lib/utils/modal-colaborador-constants";

interface ColaboradorModalBasicFieldsProps {
  idPrefix: string;
  rolLabel: string;
  nombre: string;
  onChangeNombre: (val: string) => void;
  apellido: string;
  onChangeApellido: (val: string) => void;
  sucursalId: string;
  onChangeSucursalId: (val: string) => void;
  sucursales: Sucursal[];
  rol: string;
  onChangeRol: (val: string) => void;
  telefono: string;
  onChangeTelefono: (val: string) => void;
  email: string;
  onChangeEmail: (val: string) => void;
  afterNameSlot?: React.ReactNode;
}

export function ColaboradorModalBasicFields({
  idPrefix, rolLabel, nombre, onChangeNombre, apellido, onChangeApellido,
  sucursalId, onChangeSucursalId, sucursales, rol, onChangeRol,
  telefono, onChangeTelefono, email, onChangeEmail, afterNameSlot,
}: ColaboradorModalBasicFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-nombre`} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Nombre *
          </label>
          <input
            id={`${idPrefix}-nombre`} type="text" required value={nombre}
            onChange={(e) => onChangeNombre(e.target.value)} placeholder="Ej. Carlos"
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-apellido`} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Apellido *
          </label>
          <input
            id={`${idPrefix}-apellido`} type="text" required value={apellido}
            onChange={(e) => onChangeApellido(e.target.value)} placeholder="Ej. Mendoza"
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          />
        </div>
      </div>

      {afterNameSlot}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-sucursal`} className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-grape" />
            <span>Sucursal Asignada *</span>
          </label>
          <select
            id={`${idPrefix}-sucursal`} required value={sucursalId}
            onChange={(e) => onChangeSucursalId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre} {s.es_matriz ? "(Matriz)" : ""}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor={`${idPrefix}-rol`} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {rolLabel}
            </label>
            <PendingBadge label="Pendiente" tooltip="Gestión avanzada de permisos en desarrollo" />
          </div>
          <select
            id={`${idPrefix}-rol`} value={rol} onChange={(e) => onChangeRol(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          >
            {COLABORADOR_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-telefono`} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Teléfono de Contacto
          </label>
          <input
            id={`${idPrefix}-telefono`} type="tel" inputMode="tel" value={telefono}
            onChange={(e) => onChangeTelefono(e.target.value)} placeholder="+52 55 1234 5678"
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm font-mono text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-email`} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Correo Electrónico
          </label>
          <input
            id={`${idPrefix}-email`} type="email" inputMode="email" value={email}
            onChange={(e) => onChangeEmail(e.target.value)} placeholder="colaborador@negocio.com"
            className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape min-h-[44px]"
          />
        </div>
      </div>
    </>
  );
}
