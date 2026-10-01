import Link from "next/link";
import { BookingSummaryTicket } from "./BookingSummaryTicket";
import type { Negocio, Sucursal, Servicio, Profesional } from "@/lib/types";

export interface BookingSummarySidebarProps {
  negocio: Negocio;
  sucursalActiva?: Sucursal;
  fecha: string;
  servicioActivo?: Servicio;
  horaDisponible?: string;
  profesionalActivo?: Profesional;
  activeStepKey: string;
}

export function BookingSummarySidebar({
  negocio,
  sucursalActiva,
  fecha,
  servicioActivo,
  horaDisponible,
  profesionalActivo,
  activeStepKey,
}: BookingSummarySidebarProps) {
  return (
    <aside className="hidden lg:flex w-[380px] shrink-0 bg-[#1D1720] text-[#F3EEDF] p-8 flex-col justify-between min-h-screen sticky top-0 border-r border-[#F3EEDF]/10">
      <div>
        {/* Logo y Nombre del negocio (B.3) */}
        <div className="mb-6">
          {negocio.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={negocio.logo_url}
              alt={negocio.nombre_comercial}
              className="h-12 w-auto max-w-[200px] object-contain rounded-xl mb-3"
            />
          ) : null}
          <h1 className="font-bricolage text-[24px] font-bold text-[#F3EEDF] leading-tight">
            {negocio.nombre_comercial}
          </h1>
          <h2 className="sr-only">Reservar en {negocio.nombre_comercial}</h2>
          {sucursalActiva && (
            <p className="font-sans text-sm text-[#F3EEDF]/65 mt-1">
              {sucursalActiva.nombre} — {sucursalActiva.direccion}
            </p>
          )}
        </div>

        {/* Ticket de Resumen (B.4 y REGLA B.15, B.16) */}
        <BookingSummaryTicket
          sucursalActiva={sucursalActiva}
          fecha={fecha}
          servicioActivo={servicioActivo}
          horaDisponible={horaDisponible}
          profesionalActivo={profesionalActivo}
          activeStepKey={activeStepKey}
          moneda={negocio.moneda_principal}
        />
      </div>

      {/* Pie con marca Agendur */}
      <div className="pt-6 border-t border-[#F3EEDF]/15 text-center">
        <p className="text-[13px] font-sans text-[#A39C8C]">
          Reservas con{" "}
          <Link href="/" className="font-semibold text-grape hover:underline">
            Agendur
          </Link>
        </p>
      </div>
    </aside>
  );
}
