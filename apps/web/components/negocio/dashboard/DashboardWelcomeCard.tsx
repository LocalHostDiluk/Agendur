"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Badge, Button } from "@/components/ui";

interface DashboardWelcomeCardProps {
  sucursalesCount: number;
  nombreNegocio?: string;
  negocioSlug?: string;
  copyBookingUrl: () => void;
  copied: boolean;
}

export function DashboardWelcomeCard({
  sucursalesCount,
  nombreNegocio,
  negocioSlug,
  copyBookingUrl,
  copied,
}: DashboardWelcomeCardProps) {
  return (
    <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between gap-5">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2">
          <Badge variant="success" size="sm" dot={true}>
            Portal en línea activo
          </Badge>
          {sucursalesCount > 0 && (
            <span className="text-xs text-text-secondary font-medium">
              {sucursalesCount}{" "}
              {sucursalesCount === 1
                ? "sede operativa"
                : "sedes operativas"}
            </span>
          )}
        </div>
        <h1 className="font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
          Hola, {nombreNegocio ?? "—"}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
          Tu portal de reservas está activo y listo para recibir clientes en
          línea en tus sedes.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={copyBookingUrl}
          disabled={!negocioSlug}
          className="cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4 text-text-secondary" />
          )}
          <span>
            {copied ? "¡Enlace copiado!" : "Copiar enlace de reserva"}
          </span>
        </Button>

        <Link
          href={negocioSlug ? `/reserva/${negocioSlug}` : "/"}
          target="_blank"
        >
          <Button variant="primary" size="sm">
            <span>Ver portal público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
