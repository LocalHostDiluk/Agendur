"use client";

import React from "react";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface CitaDetailClienteSectionProps {
  nombreCliente: string;
  isClienteNuevo: boolean;
  rawPhone: string;
  cleanPhone: string;
  waPhone: string;
  clienteEmail: string | null;
}

export function CitaDetailClienteSection({
  nombreCliente,
  isClienteNuevo,
  rawPhone,
  cleanPhone,
  waPhone,
  clienteEmail,
}: CitaDetailClienteSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Ficha del Cliente
        </h3>
        <Badge variant={isClienteNuevo ? "info" : "grape"} size="sm" dot>
          {isClienteNuevo ? "Cliente nuevo" : "Cliente recurrente"}
        </Badge>
      </div>

      <div className="p-4 rounded-xl bg-surface-alt/50 border border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-grape-soft text-grape flex items-center justify-center font-bold text-sm font-bricolage shrink-0">
            {nombreCliente.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bricolage font-bold text-base text-text-primary truncate">
              {nombreCliente}
            </p>
            <p className="text-xs text-text-muted">
              {isClienteNuevo ? "Primera cita agendada" : "Historial activo"}
            </p>
          </div>
        </div>

        {/* Teléfono y Acciones de 1 clic */}
        {cleanPhone ? (
          <div className="pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono tabular-nums text-xs font-medium text-text-primary">
              {rawPhone}
            </span>
            <div className="flex items-center gap-1.5">
              {/* Botón WhatsApp */}
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all cursor-pointer"
              >
                <MessageCircle
                  className="w-3.5 h-3.5 shrink-0"
                  strokeWidth={1.75}
                />
                <span>WhatsApp</span>
              </a>

              {/* Botón Llamada */}
              <a
                href={`tel:${cleanPhone}`}
                aria-label="Llamar al cliente"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface hover:bg-surface-alt border border-border text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                <span>Llamar</span>
              </a>
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-muted italic pt-1">
            Sin teléfono registrado
          </p>
        )}

        {/* Email */}
        {clienteEmail && (
          <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs text-text-secondary">
            <Mail
              className="w-3.5 h-3.5 text-text-muted shrink-0"
              strokeWidth={1.75}
            />
            <a
              href={`mailto:${clienteEmail}`}
              className="hover:text-grape transition-colors truncate"
            >
              {clienteEmail}
            </a>
          </div>
        )}

        {/* Historial resumido de citas */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-secondary">
          <span className="text-text-muted">Historial resumido:</span>
          <span className="font-medium text-text-primary">
            {isClienteNuevo
              ? "1 cita registrada (primera visita)"
              : "Cliente recurrente con historial"}
          </span>
        </div>
      </div>
    </section>
  );
}
