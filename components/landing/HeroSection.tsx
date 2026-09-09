"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  MessageCircle,
  Scissors,
  Stethoscope,
  Sparkle,
} from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [slugInput, setSlugInput] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("1");
  const [selectedStaff, setSelectedStaff] = useState("Carlos Méndez");
  const [selectedTime, setSelectedTime] = useState("16:30 hrs");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const services = [
    {
      id: "1",
      name: "Corte & Barba Master",
      duration: "45 min",
      price: "$350 MXN",
      anticipo: "$175 MXN (50%)",
      icon: Scissors,
    },
    {
      id: "2",
      name: "Consulta Especializada",
      duration: "30 min",
      price: "$800 MXN",
      anticipo: "$400 MXN (50%)",
      icon: Stethoscope,
    },
    {
      id: "3",
      name: "Spa & Limpieza Facial",
      duration: "60 min",
      price: "$600 MXN",
      anticipo: "$300 MXN (50%)",
      icon: Sparkle,
    },
  ];

  const staffList = [
    { name: "Carlos Méndez", role: "Master Barber", badge: "Estrella" },
    { name: "Dra. Sofía R.", role: "Especialista", badge: "Certificada" },
    { name: "Laura Vega", role: "Cosmiatra Pro", badge: "Senior" },
  ];

  const currentService =
    services.find((s) => s.id === selectedServiceId) ?? services[0];

  const handleSlugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slugInput.trim();
    if (cleanSlug) {
      router.push(`/register?slug=${encodeURIComponent(cleanSlug)}`);
    } else {
      router.push("/register");
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-white dark:bg-neutral-950 transition-colors">
      {/* Background Gradient Highlights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-100/60 dark:bg-blue-900/15 blur-[120px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/3 right-0 w-[400px] h-[400px] bg-indigo-100/50 dark:bg-indigo-900/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Soft Pill Badge */}
            <div className="inline-flex items-center gap-x-2 py-1.5 px-3.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span>
                ✨ Nueva versión: Anticipos y recordatorios inteligentes
              </span>
            </div>

            {/* Bold Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.12]">
              El software de citas que{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 dark:from-blue-400 dark:via-indigo-300 dark:to-teal-300">
                elimina el ausentismo
              </span>{" "}
              y llena tu agenda en piloto automático
            </h1>

            {/* Benefits Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Permite a tus clientes agendar en menos de 30 segundos desde
              cualquier dispositivo. Gestiona múltiples sucursales, asegura tus
              ingresos cobrando anticipos y envía recordatorios automáticos por
              WhatsApp.
            </p>

            {/* Slug Micro-Capture Bar */}
            <div className="pt-2">
              <form
                onSubmit={handleSlugSubmit}
                className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-lg mx-auto lg:mx-0"
              >
                <div className="relative flex-1 flex items-center rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden">
                  <span className="pl-3.5 text-xs sm:text-sm text-gray-400 dark:text-neutral-500 select-none font-medium">
                    citasync.com/
                  </span>
                  <input
                    type="text"
                    value={slugInput}
                    onChange={(e) =>
                      setSlugInput(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      )
                    }
                    placeholder="tu-marca"
                    aria-label="Nombre de tu marca o negocio"
                    className="w-full py-3 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 bg-transparent focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 inline-flex items-center justify-center gap-x-2 text-sm font-semibold rounded-xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  Comenzar Gratis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-xs text-gray-500 dark:text-neutral-500 mt-2 text-center lg:text-left">
                Prueba de 14 días sin tarjeta de crédito. Configuración en 3
                minutos.
              </p>
            </div>

            {/* Social Proof Badges */}
            <div className="pt-3 border-t border-gray-200 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-neutral-900 object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt="Usuario CitaSync"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-neutral-900 object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                    alt="Usuario CitaSync"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-neutral-900 object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80"
                    alt="Usuario CitaSync"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-neutral-900 object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                    alt="Usuario CitaSync"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="font-bold text-xs text-gray-800 dark:text-neutral-200 ml-1">
                      4.9/5
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-neutral-400">
                    +1,200 negocios gestionando sus citas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preline UI Interactive Mockup Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl transition-all">
              {/* Card Window Topbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50/75 dark:bg-neutral-900/90 rounded-t-2xl">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="size-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="size-2.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="ml-2 font-mono text-[11px] text-gray-400 dark:text-neutral-500">
                    citasync.com/reserva/live
                  </span>
                </div>
                <span className="inline-flex items-center gap-x-1 py-0.5 px-2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                  En Vivo
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 text-left">
                {/* Header info */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Barber & Spa Club Matriz
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-blue-600 dark:text-blue-400" />{" "}
                      Sucursal Polanco • CDMX
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                    24/7 Abierto
                  </span>
                </div>

                {!bookingConfirmed ? (
                  <>
                    {/* 1. Interactive Service Selection */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1.5">
                        1. Selecciona el Servicio
                      </label>
                      <div className="space-y-1.5">
                        {services.map((srv) => {
                          const isSelected = selectedServiceId === srv.id;
                          return (
                            <button
                              type="button"
                              key={srv.id}
                              onClick={() => setSelectedServiceId(srv.id)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 font-medium"
                                  : "border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`p-1.5 rounded-lg ${
                                    isSelected
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300"
                                  }`}
                                >
                                  <srv.icon className="size-3.5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {srv.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                                    <Clock className="size-3" /> {srv.duration}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {srv.price}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Staff and Time selectors */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1">
                          Profesional
                        </label>
                        <select
                          value={selectedStaff}
                          onChange={(e) => setSelectedStaff(e.target.value)}
                          className="w-full py-2 px-2.5 text-xs rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          {staffList.map((st) => (
                            <option key={st.name} value={st.name}>
                              {st.name} ({st.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-1">
                          Horario
                        </label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full py-2 px-2.5 text-xs rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="10:30 hrs">Hoy - 10:30 hrs</option>
                          <option value="12:00 hrs">Hoy - 12:00 hrs</option>
                          <option value="16:30 hrs">Hoy - 16:30 hrs</option>
                          <option value="18:00 hrs">Mañana - 18:00 hrs</option>
                        </select>
                      </div>
                    </div>

                    {/* Deposit Preview Badge */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                            Anticipo Requerido (50%)
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                            Stripe / Tarjeta o Transferencia
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-blue-700 dark:text-blue-400">
                        {currentService.anticipo}
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => setBookingConfirmed(true)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="size-4" />
                      Simular Confirmación de Cita
                    </button>
                  </>
                ) : (
                  /* Confirmed State Simulation */
                  <div className="py-3 space-y-4 text-center">
                    <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-50 dark:ring-emerald-900/30">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        ¡Cita Agendada y Anticipo Pagado!
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                        Servicio:{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {currentService.name}
                        </strong>{" "}
                        ({currentService.price})
                      </p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">
                        Con{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {selectedStaff}
                        </strong>{" "}
                        el día de hoy a las{" "}
                        <strong className="text-blue-600 dark:text-blue-400">
                          {selectedTime}
                        </strong>
                        .
                      </p>
                    </div>

                    {/* WhatsApp simulation */}
                    <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-left text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                        <MessageCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                        Recordatorio Inteligente por WhatsApp
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-neutral-400">
                        Se enviará un mensaje 24h y 2h antes de la cita con
                        confirmación de ubicación y calendarización en 1 clic.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingConfirmed(false)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      ← Cambiar configuración o servicio
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
