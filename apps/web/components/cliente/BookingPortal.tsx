"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { notify } from "@/lib/utils/toast";

interface BookingPortalProps {
  negocioSlug: string;
}

export function BookingPortal({ negocioSlug }: BookingPortalProps) {
  const [selectedBranch, setSelectedBranch] = useState("suc-1");
  const [selectedService, setSelectedService] = useState("serv-1");
  const [selectedStaff, setSelectedStaff] = useState("prof-1");
  const [selectedTime, setSelectedTime] = useState("16:30");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const sucursales = [
    {
      id: "suc-1",
      nombre: "Sucursal Polanco",
      direccion: "Av. Horacio 450, CDMX",
      telf: "+52 55 4160 0001",
    },
    {
      id: "suc-2",
      nombre: "Sucursal Roma Norte",
      direccion: "Colima 180, CDMX",
      telf: "+52 55 4160 0002",
    },
    {
      id: "suc-3",
      nombre: "Sucursal Guadalajara",
      direccion: "Av. Vallarta 1200, GDL",
      telf: "+52 33 3810 0003",
    },
  ];

  const servicios = [
    {
      id: "serv-1",
      nombre: "Corte & Estilo Barberia Premium",
      duracion: "45 min",
      precio: "$350 MXN",
    },
    {
      id: "serv-2",
      nombre: "Tratamiento Facial & Barba Spa",
      duracion: "60 min",
      precio: "$650 MXN",
    },
    {
      id: "serv-3",
      nombre: "Servicio Completo VIP",
      duracion: "90 min",
      price: "$950 MXN",
    },
  ];

  const personal = [
    { id: "prof-1", nombre: "Carlos Méndez", especialidad: "Master Barber" },
    { id: "prof-2", nombre: "Roberto Silva", especialidad: "Estilista Senior" },
  ];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/cliente/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negocioSlug,
          sucursalId: selectedBranch,
          servicioId: selectedService,
          profesionalId: selectedStaff,
          clienteNombre: name,
          clientePhone: phone,
          clienteEmail: "cliente@ejemplo.com",
          fecha: new Date().toISOString().split("T")[0],
          hora: selectedTime,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo agendar la reservación.");
      }

      notify.success("¡Cita agendada!", "Tu cita ha sido reservada con éxito.");
      setConfirmed(true);
    } catch (err: unknown) {
      notify.error(err, "No se pudo completar la reservación.");
    } finally {
      setLoading(false);
    }
  };

  const branchObj = sucursales.find((s) => s.id === selectedBranch);

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio
        </Link>
        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          PORTAL DE RESERVA PÚBLICO
        </span>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-tight">
              {negocioSlug.replace("-", " ")}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Selecciona la
              sucursal de tu preferencia
            </p>
          </div>
        </div>

        {!confirmed ? (
          <form onSubmit={handleBooking} className="space-y-5">
            {/* Step 1: Branch */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                1. Elige la Sucursal:
              </label>
              <div className="space-y-2">
                {sucursales.map((suc) => (
                  <div
                    key={suc.id}
                    onClick={() => setSelectedBranch(suc.id)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      selectedBranch === suc.id
                        ? "bg-emerald-500/15 border-emerald-500 text-white font-medium"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-bold text-white">{suc.nombre}</p>
                    <p className="text-[11px] text-slate-400">
                      {suc.direccion}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Service */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                2. Selecciona el Servicio:
              </label>
              <div className="space-y-2">
                {servicios.map((serv) => (
                  <div
                    key={serv.id}
                    onClick={() => setSelectedService(serv.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      selectedService === serv.id
                        ? "bg-slate-800 border-emerald-500 text-white font-medium"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-white">{serv.nombre}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />{" "}
                        {serv.duracion}
                      </p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">
                      {serv.precio}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Date, Time & Customer details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Profesional
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {personal.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.especialidad})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Horario Cita
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="10:00">Hoy - 10:00 hrs</option>
                  <option value="12:30">Hoy - 12:30 hrs</option>
                  <option value="16:30">Hoy - 16:30 hrs</option>
                  <option value="18:00">Mañana - 18:00 hrs</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Tu Nombre Completo..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="tel"
                placeholder="Tu Teléfono (para confirmación de WhatsApp)..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all"
            >
              {loading ? "Procesando Reserva..." : "Confirmar Cita Online"}
            </button>
          </form>
        ) : (
          <div className="py-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                ¡Cita Registrada Exitosamente!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Te esperamos en{" "}
                <strong className="text-white">{branchObj?.nombre}</strong> (
                {branchObj?.direccion}) a las {selectedTime} hrs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <MessageSquare className="w-4 h-4 text-emerald-400" />{" "}
                Recordatorio enviado a {phone}
              </div>
              <p className="text-slate-400 text-[11px]">
                Recibirás un recordatorio automático por WhatsApp 2 horas antes
                de tu cita.
              </p>
            </div>

            <button
              onClick={() => setConfirmed(false)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Agendar otra cita
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
