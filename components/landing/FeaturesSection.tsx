import {
  Building2,
  CalendarCheck,
  MessageSquare,
  CreditCard,
  RefreshCw,
  BarChart3,
  Sparkles,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Building2,
      title: "Multi-Sucursal & Múltiples Negocios",
      description:
        "Da de alta todas tus sucursales, clínicas o locales comerciales en una sola cuenta con horarios y personal independientes.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: CalendarCheck,
      title: "Agendamiento Público 24/7",
      description:
        "Comparte tu enlace personalizado en Instagram, WhatsApp o sitio web para que tus clientes agenden sin llamadas.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: MessageSquare,
      title: "Alertas & Recordatorios WhatsApp",
      description:
        "Reduce las ausencias (no-shows) hasta un 80% enviando recordatorios automáticos 24h y 2h antes de cada cita.",
      color: "from-emerald-600 to-green-500",
    },
    {
      icon: CreditCard,
      title: "Cobro de Anticipos y Depósitos",
      description:
        "Cobra un anticipo o el servicio completo en línea vía Stripe o MercadoPago para asegurar la asistencia de tus clientes.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: RefreshCw,
      title: "Sincronización con Google & Outlook",
      description:
        "Sincroniza agendas en tiempo real para que los eventos de tu equipo profesional se reflejen al instante sin empalmes.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Analítica e Historial de Clientes",
      description:
        "Conoce las horas de mayor demanda, el rendimiento por sucursal y el historial completo de cada cliente.",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <section
      id="caracteristicas"
      className="py-20 lg:py-28 relative bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Diseñado para PyMEs y Negocios
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Todo lo que tu negocio necesita para llenar su agenda
            automáticamente.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Di adiós a los cuadernos de citas, mensajes cruzados en WhatsApp y
            cancelaciones sin aviso. CitaSync profesionaliza la atención al
            cliente de tus sucursales.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group relative p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center shadow-lg mb-6 text-slate-950 font-bold group-hover:scale-110 transition-transform`}
              >
                <item.icon className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
