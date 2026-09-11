import {
  Building2,
  CreditCard,
  MessageSquare,
  Sparkles,
  Clock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section
      id="caracteristicas"
      className="py-16 sm:py-24 bg-gray-50/50 dark:bg-neutral-950/40 relative transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Funcionalidades Diseñadas para Crecer
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Todo lo que tu negocio necesita en una sola plataforma
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400">
            Diseñado para eliminar fricciones operativas, reducir ausencias de
            clientes y optimizar el tiempo de tu equipo de trabajo.
          </p>
        </div>

        {/* Bento Grid (Asymmetrical 4 Quadrants) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cuadrante 1: Span 2 cols */}
          <div className="lg:col-span-2 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xs hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center size-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                <Building2 className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Agenda y Disponibilidad Multi-Sucursal en Tiempo Real
              </h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                Administra todas tus sucursales, clínicas o sedes desde una
                única cuenta centralizada. Asigna personal independiente, define
                horarios específicos y evita empalmes de citas en tiempo real.
              </p>
            </div>

            {/* Visual Multi-Branch Mockup */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-neutral-800">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-2xs">
                  Sucursal Polanco (5 profesionales)
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                  Sucursal Roma Norte (3 profesionales)
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
                  Sucursal Guadalajara (4 profesionales)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/80 dark:border-neutral-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                      Carlos Méndez
                    </span>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                    4 citas hoy • 2 espacios libres
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/80 dark:border-neutral-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                      Dra. Sofía Ramos
                    </span>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                    6 citas hoy • 1 espacio libre
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/80 dark:border-neutral-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800 dark:text-neutral-200">
                      Laura Vega
                    </span>
                    <span className="size-2 rounded-full bg-amber-500" />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                    Agenda Completa • En atención
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cuadrante 2: Cobro de Anticipos (1 col) */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xs hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <CreditCard className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Cobro de Anticipos y Pagos Online
              </h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                Asegura el compromiso de tus clientes cobrando un anticipo o el
                100% del servicio vía Stripe o cobro manual directo.
              </p>
            </div>

            {/* Visual Anticipo Badge */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-neutral-800 space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    Cero No-Shows
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  -85% Ausencias
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 px-1">
                <span>Pasarelas integradas</span>
                <span className="font-semibold text-gray-800 dark:text-neutral-200">
                  Stripe • Efectivo • Transferencia
                </span>
              </div>
            </div>
          </div>

          {/* Cuadrante 3: Recordatorios WhatsApp (1 col) */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xs hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center size-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
                <MessageSquare className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recordatorios por WhatsApp y Email
              </h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
                Confirmaciones instantáneas y recordatorios automáticos 24 horas
                y 2 horas antes de cada cita con ubicación y botón para
                reprogramar.
              </p>
            </div>

            {/* Visual WhatsApp Bubble */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-neutral-800">
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-neutral-800/70 border border-teal-200 dark:border-neutral-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1">
                    <Clock className="size-3" /> WhatsApp Automatizado
                  </span>
                  <span className="text-[10px] text-gray-400">10:00 AM</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-neutral-300">
                  &quot;Hola Juan, tu cita en CitaSync está programada para
                  mañana a las 10:30 AM en Sucursal Polanco. ¿Confirmas tu
                  asistencia?&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Cuadrante 4: Span 2 cols */}
          <div className="lg:col-span-2 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xs hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                <Smartphone className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Portal de Autoservicio para Clientes Móviles
              </h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                Tus clientes reservan de manera autónoma en menos de 30 segundos
                mediante tu enlace público personalizado (
                <code className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  /reserva/[slug]
                </code>
                ) o escaneando un código QR en tu mostrador. Sin descargas ni
                registros forzosos.
              </p>
            </div>

            {/* Visual Steps Workflow */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/70 dark:border-neutral-700/60">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    PASO 1
                  </span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    Elige Sucursal
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    Ubicación y mapa GPS
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/70 dark:border-neutral-700/60">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    PASO 2
                  </span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    Servicio & Staff
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    Duración y tarifa clara
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/70 dark:border-neutral-700/60">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    PASO 3
                  </span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    Horario en Vivo
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                    Solo horas disponibles
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    CONFIRMADO
                  </span>
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    Cita en Calendario
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Sincronización instantánea
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
