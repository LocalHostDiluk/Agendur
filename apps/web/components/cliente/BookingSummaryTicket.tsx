import { BlurText } from "./BlurText";
import { formatDateShort } from "@/lib/utils/booking-date";
import type { Sucursal, Servicio, Profesional } from "@/lib/types";

export interface BookingSummaryTicketProps {
  sucursalActiva?: Sucursal;
  fecha: string;
  servicioActivo?: Servicio;
  horaDisponible?: string;
  profesionalActivo?: Profesional;
  activeStepKey: string;
  moneda: string;
}

export function BookingSummaryTicket({
  sucursalActiva,
  fecha,
  servicioActivo,
  horaDisponible,
  profesionalActivo,
  activeStepKey,
  moneda,
}: BookingSummaryTicketProps) {
  return (
    <div className="ticket-on-ink bg-[#FFFFFF] text-[#211A26] rounded-2xl p-6 shadow-2xl relative my-6">
      {/* Encabezado */}
      <div className="text-center pb-2">
        <span className="font-mono text-[11px] font-bold text-[#A39C8C] tracking-[0.1em] uppercase">
          TU RESERVA
        </span>
      </div>

      <div className="perforacion my-3" />

      {/* Filas de datos obligatorias: Sucursal, Fecha, Servicio, Hora, Profesional */}
      <div className="space-y-3.5 py-1">
        {/* 1. Sucursal */}
        <div>
          <div className="text-[12px] font-sans text-[#A39C8C]">Sucursal</div>
          {sucursalActiva ? (
            <BlurText
              key={sucursalActiva.id}
              className="text-[15px] font-sans font-semibold text-[#211A26] block"
            >
              {sucursalActiva.nombre}
            </BlurText>
          ) : (
            <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
          )}
        </div>

        {/* 2. Fecha */}
        <div>
          <div className="text-[12px] font-sans text-[#A39C8C]">Fecha</div>
          {fecha ? (
            <BlurText
              key={fecha}
              className="font-mono text-[15px] font-semibold text-[#211A26] block"
            >
              {formatDateShort(fecha)}
            </BlurText>
          ) : (
            <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
          )}
        </div>

        {/* 3. Servicio */}
        <div>
          <div className="text-[12px] font-sans text-[#A39C8C]">Servicio</div>
          {servicioActivo ? (
            <BlurText
              key={servicioActivo.id}
              className="text-[15px] font-sans font-semibold text-[#211A26] block"
            >
              {servicioActivo.nombre}
            </BlurText>
          ) : (
            <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
          )}
        </div>

        {/* 4. Hora */}
        <div>
          <div className="text-[12px] font-sans text-[#A39C8C]">Hora</div>
          {horaDisponible ? (
            <BlurText
              key={horaDisponible}
              className="font-mono text-[15px] font-semibold text-grape block"
            >
              {horaDisponible} hrs
            </BlurText>
          ) : (
            <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
          )}
        </div>

        {/* 5. Profesional */}
        <div>
          <div className="text-[12px] font-sans text-[#A39C8C]">
            Profesional
          </div>
          {profesionalActivo ? (
            <BlurText
              key={profesionalActivo.id}
              className="text-[15px] font-sans font-semibold text-[#211A26] block"
            >
              {profesionalActivo.nombre} {profesionalActivo.apellido}
            </BlurText>
          ) : horaDisponible ||
            activeStepKey === "hora" ||
            activeStepKey === "datos" ? (
            <BlurText
              key="cualquiera"
              className="text-[15px] font-sans font-semibold text-[#211A26] block"
            >
              Cualquier profesional disponible
            </BlurText>
          ) : (
            <div className="border-b border-dashed border-[#E7E1D3] h-5 w-full my-0.5" />
          )}
        </div>
      </div>

      <div className="perforacion my-3" />

      {/* Pie con duración y precio en Space Mono */}
      <div className="pt-1 flex items-baseline justify-between text-xs">
        <span className="text-[#6B6355] font-sans">
          {servicioActivo ? `${servicioActivo.duracion_minutos} min` : "Total"}
        </span>
        <span className="font-mono text-base font-bold text-[#211A26]">
          {servicioActivo ? `$${servicioActivo.precio} ${moneda}` : "—"}
        </span>
      </div>
    </div>
  );
}
