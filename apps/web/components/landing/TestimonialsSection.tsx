import { Star, Quote, TrendingDown, Clock, Building } from "lucide-react";

export function TestimonialsSection() {
  const stats = [
    { value: "-80%", label: "Menos ausencias (No-shows)", icon: TrendingDown },
    { value: "24/7", label: "Citas agendadas automáticamente", icon: Clock },
    {
      value: "+3,200",
      label: "Sucursales activas en Latinoamérica",
      icon: Building,
    },
  ];

  const testimonials = [
    {
      name: "Dra. Lucía Morales",
      role: "Directora Médica",
      company: "Clínicas Dentales OdontoSalud (4 Sucursales)",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80",
      content:
        "Teníamos 4 sucursales y la recepción era un caos con llamadas y mensajes cruzados. Con Agendur cada paciente elige su sucursal, doctor y hora disponible. Las ausencias bajaron drásticamente gracias a WhatsApp.",
      rating: 5,
    },
    {
      name: "Mario Restrepo",
      role: "Fundador",
      company: "Barber Club & Lounge (3 Sucursales)",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      content:
        "Al requerir un cobro de anticipo de $100 MXN para agendar, eliminamos por completo a las personas que agendaban y no llegaban. El sistema se pagó solo en la primera semana.",
      rating: 5,
    },
    {
      name: "Valentina Silva",
      role: "Propietaria",
      company: "Aura Spa & Estética (2 Sucursales)",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      content:
        "Mis clientes aman la facilidad de agendar a cualquier hora de la noche desde Instagram. La sincronización con Google Calendar evita que mi equipo encime citas.",
      rating: 5,
    },
  ];

  return (
    <section
      id="testimonios"
      className="py-20 lg:py-28 bg-slate-900/40 relative border-t border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metrics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-xl">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 justify-center md:justify-start"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-white font-mono block">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Quote className="w-3.5 h-3.5" />
            Historias de Éxito
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Negocios con múltiples sucursales que escalaron con Agendur.
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-7 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  &quot;{t.content}&quot;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-slate-400">
                    {t.role} •{" "}
                    <span className="text-emerald-400">{t.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
