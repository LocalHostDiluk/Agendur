"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
  Building2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function HeroSection() {
  const [selectedBranch, setSelectedBranch] = useState("Polanco");
  const [selectedService, setSelectedService] = useState(
    "Corte & Estilo Premium",
  );
  const [selectedStaff, setSelectedStaff] = useState(
    "Carlos Méndez (Master Barber)",
  );
  const [selectedTime, setSelectedTime] = useState("16:30 hrs");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const branches = [
    { name: "Polanco", city: "CDMX", status: "Abierto" },
    { name: "Roma Norte", city: "CDMX", status: "Abierto" },
    { name: "Guadalajara", city: "Jalisco", status: "Abierto" },
  ];

  const services = [
    { name: "Corte & Estilo Premium", duration: "45 min", price: "$350 MXN" },
    { name: "Tratamiento Facial Spa", duration: "60 min", price: "$650 MXN" },
    {
      name: "Consulta Médica Especializada",
      duration: "30 min",
      price: "$800 MXN",
    },
  ];

  const handleConfirm = () => {
    setBookingConfirmed(true);
  };

  const handleReset = () => {
    setBookingConfirmed(false);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/15 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-teal-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                Nuevo: Gestión Multi-Sucursal + Recordatorios por WhatsApp
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
              Citas y reservaciones online para tus{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                sucursales y negocios.
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Dale a tus clientes un portal de agendamiento 24/7. Registra todas
              tus sucursales, organiza las agendas de tus profesionales y
              elimina las ausencias con recordatorios automáticos por WhatsApp.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#precios"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 px-7 py-3.5 rounded-xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Crear Mi Agenda Gratis
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-3.5 rounded-xl transition-all hover:text-white"
              >
                Probar Vista Negocio
              </a>
            </div>

            {/* Trust highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-sucursal en 1 cuenta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sin descarga de Apps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>14 días de prueba gratis</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Booking Widget Mockup */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-1 border border-slate-800 shadow-2xl shadow-emerald-950/40">
              {/* Window Bar Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 rounded-t-xl text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-slate-500 text-[11px] hidden sm:inline">
                    citas.tunegocio.com/sucursal-polanco
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  PORTAL PÚBLICO
                </span>
              </div>

              {/* Portal Content */}
              <div className="p-6 space-y-5 text-left">
                {/* Business Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        Barber & Spa Club
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" /> Sucursal{" "}
                        {selectedBranch} (
                        {branches.find((b) => b.name === selectedBranch)?.city})
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    24/7 ABIERTO
                  </span>
                </div>

                {!bookingConfirmed ? (
                  <>
                    {/* Step 1: Branch Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        1. Selecciona la Sucursal:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {branches.map((b) => (
                          <button
                            key={b.name}
                            onClick={() => setSelectedBranch(b.name)}
                            className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                              selectedBranch === b.name
                                ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold shadow-sm"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <span className="block">{b.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {b.city}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Service Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        2. Elige el Servicio:
                      </label>
                      <div className="space-y-2">
                        {services.map((s) => (
                          <div
                            key={s.name}
                            onClick={() => setSelectedService(s.name)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                              selectedService === s.name
                                ? "bg-slate-800 border-emerald-500/80 text-white"
                                : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <div>
                              <p className="font-medium text-slate-200">
                                {s.name}
                              </p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {s.duration}
                              </p>
                            </div>
                            <span className="font-mono text-emerald-400 font-bold">
                              {s.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 3: Specialist & Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Especialista
                        </label>
                        <select
                          value={selectedStaff}
                          onChange={(e) => setSelectedStaff(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Carlos Méndez (Master Barber)">
                            Carlos Méndez (Master Barber)
                          </option>
                          <option value="Dra. Elena Gómez (Médica)">
                            Dra. Elena Gómez (Médica)
                          </option>
                          <option value="Roberto Silva (Especialista)">
                            Roberto Silva (Especialista)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Horario Disponible
                        </label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="10:00 hrs">Hoy - 10:00 hrs</option>
                          <option value="12:15 hrs">Hoy - 12:15 hrs</option>
                          <option value="16:30 hrs">Hoy - 16:30 hrs</option>
                          <option value="18:00 hrs">Mañana - 18:00 hrs</option>
                        </select>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={handleConfirm}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01]"
                    >
                      Agendar Cita Ahora
                    </button>
                  </>
                ) : (
                  /* Confirmation State */
                  <div className="py-4 space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        ¡Cita Confirmada con Éxito!
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Reservada en{" "}
                        <strong className="text-emerald-400">
                          Sucursal {selectedBranch}
                        </strong>{" "}
                        para{" "}
                        <strong className="text-white">
                          {selectedService}
                        </strong>{" "}
                        a las {selectedTime}.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-left text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        Recordatorio enviado por WhatsApp
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Se ha enviado la ubicación de la sucursal y la opción de
                        añadir a Google Calendar al cliente.
                      </p>
                    </div>

                    <button
                      onClick={handleReset}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Probar agendar otra cita
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
