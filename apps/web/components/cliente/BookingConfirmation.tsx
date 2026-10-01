"use client";

import Link from "next/link";
import { CheckCircle2, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { BookingConfirmationTicket } from "./BookingConfirmationTicket";
import { downloadIcsFile } from "@/lib/utils/calendar-event";
import type { Negocio, Sucursal, Servicio, Profesional, Cita } from "@/lib/types";

export interface BookingConfirmationProps {
  negocio: Negocio;
  sucursalActiva?: Sucursal;
  servicioActivo?: Servicio;
  profesionalActivo?: Profesional;
  cita: Cita;
  horaDisponible?: string;
  nombre: string;
  apellido: string;
  showCancelInfo: boolean;
  setShowCancelInfo: (show: boolean | ((prev: boolean) => boolean)) => void;
}

export function BookingConfirmation({
  negocio,
  sucursalActiva,
  servicioActivo,
  profesionalActivo,
  cita,
  horaDisponible,
  nombre,
  apellido,
  showCancelInfo,
  setShowCancelInfo,
}: BookingConfirmationProps) {
  const profNombre = profesionalActivo
    ? `${profesionalActivo.nombre} ${profesionalActivo.apellido}`
    : "Especialista asignado";

  const calendarEvent = {
    title: `${servicioActivo?.nombre || "Cita"} en ${negocio.nombre_comercial}`,
    description: `Cita reservada en ${sucursalActiva?.nombre || ""}. Profesional: ${profNombre}.`,
    location: `${sucursalActiva?.nombre || ""}, ${sucursalActiva?.direccion || ""}, ${sucursalActiva?.ciudad || ""}`,
    fecha: cita.fecha,
    horaInicio: cita.hora_inicio ? cita.hora_inicio.slice(0, 5) : "00:00",
    duracionMinutos: servicioActivo?.duracion_minutos || 45,
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${negocio.nombre_comercial} ${sucursalActiva?.direccion || ""} ${sucursalActiva?.ciudad || ""}`,
  )}`;

  return (
    <div className="min-h-screen bg-[#1D1720] text-[#F3EEDF] py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      {/* Encabezado de confirmación */}
      <div className="max-w-md w-full text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#46B88A]/15 border border-[#46B88A]/30 flex items-center justify-center text-[#46B88A] animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-bricolage text-[28px] font-bold text-[#F3EEDF] leading-tight">
          ¡Listo! Tu cita está confirmada.
        </h1>
        <h2 className="sr-only">Reserva registrada</h2>
        <p className="font-sans text-sm text-[#F3EEDF]/65 mt-1.5">
          Hemos registrado tu turno con éxito.
        </p>
      </div>

      {/* Ticket Emitido de 400px con muescas en --ink (B.10) */}
      <BookingConfirmationTicket
        negocio={negocio}
        sucursalActiva={sucursalActiva}
        servicioActivo={servicioActivo}
        cita={cita}
        horaDisponible={horaDisponible}
        profNombre={profNombre}
        nombre={nombre}
        apellido={apellido}
        mapsUrl={mapsUrl}
      />

      {/* Botones Apilados de 400px */}
      <div className="max-w-[400px] w-full space-y-2.5">
        <button
          type="button"
          onClick={() => downloadIcsFile(calendarEvent)}
          className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-grape hover:bg-grape/90 text-white font-semibold text-sm transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <CalendarIcon className="w-4 h-4" />
          Agregar a mi calendario
        </button>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[44px] py-3 px-4 rounded-xl border border-[#F3EEDF]/25 bg-transparent hover:bg-white/5 text-[#F3EEDF] font-semibold text-sm transition-colors flex items-center justify-center gap-2 text-center"
        >
          <MapPin className="w-4 h-4 text-flame" />
          Ver ubicación
        </a>

        <button
          type="button"
          onClick={() => setShowCancelInfo(!showCancelInfo)}
          className="w-full min-h-[44px] py-2 px-4 text-xs text-[#D14343] hover:text-[#D14343]/80 transition-colors underline cursor-pointer"
        >
          Cancelar cita
        </button>

        {showCancelInfo && sucursalActiva && (
          <div className="p-3 bg-[#2A2130] rounded-xl border border-[#F3EEDF]/15 text-xs text-[#F3EEDF]/80 animate-in fade-in">
            Para cancelar o reprogramar tu cita, comunícate directamente con la
            sucursal al{" "}
            <span className="font-bold text-[#F3EEDF]">
              {sucursalActiva.telefono || "teléfono de la sede"}
            </span>{" "}
            con al menos 24 hrs de antelación.
          </div>
        )}

        <p className="text-center font-sans text-sm text-[#F3EEDF]/65 pt-2">
          Te enviaremos un recordatorio por WhatsApp antes de tu cita.
        </p>

        <p className="text-center text-[13px] font-sans text-[#A39C8C] pt-4">
          Reservas con{" "}
          <Link href="/" className="font-semibold text-grape hover:underline">
            Agendur
          </Link>
        </p>
      </div>
    </div>
  );
}
