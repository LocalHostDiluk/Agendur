"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Building2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: "emprendedor",
      name: "Emprendedor",
      description:
        "Para profesionales independientes, barberos y consultorios con 1 sucursal.",
      monthlyPrice: 19,
      annualPrice: 15,
      features: [
        "1 Sucursal registrada",
        "Hasta 3 Profesionales / Agendas",
        "Citas y reservas ilimitadas",
        "Portal de autoservicio web 24/7",
        "Recordatorios por correo y SMS",
        "Sincronización con Google Calendar",
        "Soporte estándar por email",
      ],
      popular: false,
      ctaText: "Comenzar Prueba Gratis",
      ctaLink: "/register?plan=emprendedor",
    },
    {
      id: "pyme",
      name: "PYME Crecimiento",
      description:
        "Para negocios consolidados, clínicas y spas con múltiples especialistas.",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "Hasta 5 Sucursales activas",
        "Hasta 15 Profesionales / Agendas",
        "Recordatorios automáticos por WhatsApp",
        "Cobro de Anticipos (Stripe y Manual)",
        "Control anti-ausentismo (No-shows)",
        "Analítica e Historial de Clientes",
        "Soporte prioritario por WhatsApp",
      ],
      popular: true,
      ctaText: "Iniciar 14 Días Gratis",
      ctaLink: "/register?plan=pyme",
    },
    {
      id: "enterprise",
      name: "Multi-Sucursal Enterprise",
      description:
        "Para franquicias y cadenas comerciales con requerimientos avanzados.",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "Sucursales y Sedes ilimitadas",
        "Profesionales y Agendas ilimitadas",
        "Dominio Propio (citas.tuempresa.com)",
        "API Completa & Webhooks",
        "Gestor de cuenta y onboarding dedicado",
        "Capacitación en vivo para tu equipo",
        "SLA de disponibilidad garantizado 99.9%",
      ],
      popular: false,
      ctaText: "Contactar a Ventas",
      ctaLink: "/register?plan=enterprise",
    },
  ];

  return (
    <section
      id="precios"
      className="py-16 sm:py-24 bg-gray-50/60 dark:bg-neutral-950/50 relative transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="size-3.5" />
            Planes Transparentes y Escalables
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Invierte en orden y multiplica las citas de tu negocio
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-neutral-400">
            Todos los planes incluyen 14 días de prueba gratuita sin tarjeta de
            crédito. Cancela en cualquier momento con un solo clic.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium transition-colors ${
                !isAnnual
                  ? "text-gray-900 dark:text-white font-semibold"
                  : "text-gray-500 dark:text-neutral-400"
              }`}
            >
              Facturación Mensual
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              aria-label="Alternar facturación mensual y anual"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-300 dark:bg-neutral-700 transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 data-[checked=true]:bg-blue-600"
              data-checked={isAnnual}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>

            <span
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isAnnual
                  ? "text-gray-900 dark:text-white font-semibold"
                  : "text-gray-500 dark:text-neutral-400"
              }`}
            >
              Facturación Anual
              <span className="inline-flex items-center py-0.5 px-2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Ahorra 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between p-7 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 transition-all ${
                  plan.popular
                    ? "border-2 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/10 -translate-y-1 lg:-translate-y-2"
                    : "border border-gray-200 dark:border-neutral-800 shadow-xs hover:border-gray-300 dark:hover:border-neutral-700"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 py-1 px-3.5 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    <Sparkles className="size-3.5" />
                    Más Popular
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      ${price}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-neutral-400">
                      USD / mes
                    </span>
                    {isAnnual && (
                      <span className="text-[11px] text-gray-400 dark:text-neutral-500 ml-1">
                        (anual)
                      </span>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-8 text-xs sm:text-sm text-gray-700 dark:text-neutral-300 border-t border-gray-100 dark:border-neutral-800 pt-6">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div>
                  <Link
                    href={plan.ctaLink}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 shadow-md shadow-blue-500/20 hover:scale-[1.01]"
                        : "bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200"
                    }`}
                  >
                    {plan.ctaText}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 text-center text-xs text-gray-500 dark:text-neutral-400 flex items-center justify-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            Garantía de satisfacción: cancela cuando quieras, sin cláusulas de
            permanencia.
          </span>
        </div>
      </div>
    </section>
  );
}
