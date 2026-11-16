"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { ImageUploadButton } from "@/components/negocio/ImageUploadButton";

interface ColaboradorModalAvatarFieldProps {
  avatarUrl: string;
  nombre: string;
  sucursalId: string;
  colaboradorId: string;
  onUploaded: (url: string) => void;
}

export function ColaboradorModalAvatarField({
  avatarUrl,
  nombre,
  sucursalId,
  colaboradorId,
  onUploaded,
}: ColaboradorModalAvatarFieldProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-alt p-3.5">
      <div className="size-12 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`Avatar de ${nombre || "colaborador"}`}
            className="size-full object-cover"
          />
        ) : (
          <UserCheck className="m-3 size-6 text-text-muted" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-text-primary">Avatar</p>
        <ImageUploadButton
          bucket="avatars-profesionales"
          path={`${sucursalId}/${colaboradorId}`}
          label="Subir avatar"
          disabled={!sucursalId}
          onUploaded={onUploaded}
        />
      </div>
    </div>
  );
}

interface ColaboradorModalEstadoFieldProps {
  activo: boolean;
  onChangeActivo: (val: boolean) => void;
}

export function ColaboradorModalEstadoField({
  activo,
  onChangeActivo,
}: ColaboradorModalEstadoFieldProps) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-surface-alt border border-border rounded-xl">
      <div>
        <p className="text-xs font-semibold text-text-primary">Estado del Colaborador</p>
        <p className="text-[11px] text-text-secondary">
          {activo
            ? "Activo — Disponible para agendar citas y aparecer en el portal."
            : "Inactivo — Temporalmente suspendido de nuevas reservas."}
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => onChangeActivo(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-border peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"></div>
      </label>
    </div>
  );
}
