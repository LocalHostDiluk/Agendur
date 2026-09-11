import {
  Scissors,
  Sparkles,
  Flower2,
  Smile,
  Stethoscope,
  Palette,
  Activity,
  CheckCircle2,
  Percent,
  CreditCard,
  CalendarCheck,
} from "lucide-react";

export function SocialProofMarquee() {
  const items = [
    { label: "Barberías", icon: Scissors },
    { label: "99.9% Uptime", icon: CheckCircle2, highlight: true },
    { label: "Salones de Belleza", icon: Sparkles },
    { label: "Sin comisiones por cita", icon: Percent, highlight: true },
    { label: "Spas & Masajes", icon: Flower2 },
    {
      label: "Pasarela Stripe y Cobro Manual",
      icon: CreditCard,
      highlight: true,
    },
    { label: "Clínicas Dentales", icon: Smile },
    { label: "Consultorios Médicos", icon: Stethoscope },
    {
      label: "+500,000 Citas Gestionadas",
      icon: CalendarCheck,
      highlight: true,
    },
    { label: "Estudios de Tatuaje", icon: Palette },
    { label: "Centros de Fisioterapia", icon: Activity },
  ];

  // Duplicate items for continuous looping
  const marqueeItems = [...items, ...items];

  return (
    <section
      aria-label="Sectores e indicadores de confianza"
      className="py-6 sm:py-8 border-y border-gray-200 dark:border-neutral-800 bg-gray-50/60 dark:bg-neutral-900/30 relative overflow-hidden transition-colors"
    >
      {/* Left and Right Gradient Mask */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-36 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-36 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-10" />

      {/* Marquee Track */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none flex items-center gap-6 sm:gap-8 px-4">
          {marqueeItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.label}-${index}`}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors select-none shrink-0 ${
                  item.highlight
                    ? "bg-blue-50/80 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300 font-semibold"
                    : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 shadow-2xs"
                }`}
              >
                <Icon
                  className={`size-4 ${
                    item.highlight
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-neutral-500"
                  }`}
                />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
