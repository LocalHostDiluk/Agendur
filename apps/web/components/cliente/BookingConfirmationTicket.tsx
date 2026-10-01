import { formatDateReadable } from "@/lib/utils/booking-date";
import type { Negocio, Sucursal, Servicio, Cita } from "@/lib/types";

export interface BookingConfirmationTicketProps {
  negocio: Negocio;
  sucursalActiva?: Sucursal;
  servicioActivo?: Servicio;
  cita: Cita;
  horaDisponible?: string;
  profNombre: string;
  nombre: string;
  apellido: string;
  mapsUrl: string;
}

export function BookingConfirmationTicket({
  negocio,
  sucursalActiva,
  servicioActivo,
  cita,
  horaDisponible,
  profNombre,
  nombre,
  apellido,
  mapsUrl,
}: BookingConfirmationTicketProps) {
  return (
    <div className="ticket-on-ink max-w-[400px] w-full bg-[#FFFFFF] text-[#211A26] rounded-2xl shadow-2xl overflow-hidden mb-6 relative">
      <div className="p-6 text-center border-b border-dashed border-[#E7E1D3]">
        <h2 className="font-bricolage text-lg font-bold text-[#211A26]">
          {negocio.nombre_comercial}
        </h2>
        <p className="text-xs text-[#A39C8C] mt-0.5">
          {sucursalActiva?.nombre}
        </p>

        {/* Fecha y hora en Space Mono 22px peso 700 */}
        <div className="mt-4 p-3.5 bg-[var(--surface-alt,#F0ECE0)] rounded-xl border border-[#E7E1D3]/80 inline-block w-full">
          <p className="font-mono text-[22px] font-bold text-[#211A26] tracking-tight">
            {cita.hora_inicio ? cita.hora_inicio.slice(0, 5) : horaDisponible}{" "}
            <span className="text-sm font-normal text-[#A39C8C]">hrs</span>
          </p>
          <p className="font-sans text-sm font-medium text-[#6B6355] mt-0.5">
            {formatDateReadable(cita.fecha)}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-3 text-sm">
        <div className="flex justify-between items-center py-0.5">
          <span className="text-[#A39C8C]">Servicio:</span>
          <span className="font-semibold text-[#211A26] text-right">
            {servicioActivo?.nombre} ({servicioActivo?.duracion_minutos} min)
          </span>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-[#A39C8C]">Profesional:</span>
          <span className="font-medium text-[#211A26]">{profNombre}</span>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-[#A39C8C]">Cliente:</span>
          <span className="font-medium text-[#211A26]">
            {nombre} {apellido}
          </span>
        </div>

        {sucursalActiva && (
          <div className="flex justify-between items-baseline py-0.5">
            <span className="text-[#A39C8C]">Ubicación:</span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-grape hover:underline text-right text-xs max-w-[200px]"
            >
              {sucursalActiva.direccion}, {sucursalActiva.ciudad}
            </a>
          </div>
        )}

        <div className="perforacion my-2" />

        <div className="flex justify-between items-center pt-2">
          <span className="text-[#A39C8C]">Total:</span>
          <span className="font-mono text-lg font-bold text-grape">
            ${servicioActivo?.precio} {negocio.moneda_principal}
          </span>
        </div>

        <div className="pt-2 text-center">
          <span className="font-mono text-[13px] text-[#A39C8C] tracking-wider font-semibold">
            #AG-{cita.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
