"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui";
import { DashboardCitasTicket } from "./DashboardCitasTicket";

interface DashboardCitasEmptyProps {
  copyBookingUrl: () => void;
  negocioSlug?: string;
  copied: boolean;
}

export function DashboardCitasEmpty({ copyBookingUrl, negocioSlug, copied }: DashboardCitasEmptyProps) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
      <div className="relative mb-4 flex items-center justify-center">
        <DashboardCitasTicket variant="empty" />
      </div>
      <h3 className="font-bricolage font-bold text-lg text-text-primary">
        Aún no tienes citas agendadas
      </h3>
      <p className="mt-1.5 text-xs text-text-secondary max-w-sm">
        Cuando tus clientes reserven citas a través de tu portal público,
        aparecerán listadas aquí en tiempo real.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={copyBookingUrl}
          disabled={!negocioSlug}
          className="cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>
            {copied ? "¡Enlace copiado!" : "Copiar enlace de reserva"}
          </span>
        </Button>
        {negocioSlug && (
          <Link href={`/reserva/${negocioSlug}`} target="_blank">
            <Button variant="secondary" size="sm">
              <span>Ver portal público</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
