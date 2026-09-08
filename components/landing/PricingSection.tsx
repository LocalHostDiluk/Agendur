"use client";

import { useState } from "react";
import { Check, Sparkles, Building2, Shield } from "lucide-react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Emprendedor",
      description:
        "Ideal para profesionales independientes o 1 solo local comercial.",
      monthlyPrice: 19,
      annualPrice: 15,
      features: [
        "**1 Sucursal** registrada",
        "Hasta **3 Especialistas / Agendas**",
        "Reservaciones ilimitadas al mes",
        "Portal de reservas web 24/7",
        "Recordatorios por Email y SMS",
        "Sincronización con Google Calendar",
        "Soporte por chat y email",
      ],
      popular: false,
      buttonText: "Probar 14 Días Gratis",
      buttonVariant: "secondary",
    },
    {
      name: "PyME Crecimiento",
      description: "Para clínicas, spas, barberías y negocios en expansión.",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "Hasta **5 Sucursales** registradas",
        "Hasta **15 Especialistas / Agendas**",
        "Alertas y Recordatorios por **WhatsApp Automáticos**",
        "Cobro de Anticipos (Stripe / MercadoPago)",
        "Control de Asistencia y No-Shows",
        "Estadísticas de Ocupación e Historial",
        "Soporte prioritario",
      ],
      popular: true,
      buttonText: "Iniciar Prueba de 14 Días",
      buttonVariant: "primary",
    },
    {
      name: "Multi-Sucursal Enterprise",
      description:
        "Para cadenas comerciales y franquicias con múltiples ubicaciones.",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "**Sucursales Ilimitadas**",
        "**Especialistas y Personal Ilimitados**",
        "Dominio Propio (citas.tuempresa.com)",
        "API Completa e Integración con CRM / POS",
        "Gestor de cuenta dedicado",
        "Capacitación para todo tu personal",
        "Garantía de disponibilidad del 99.9%",
      ],
      popular: false,
      buttonText: "Contactar a Ventas",
      buttonVariant: "secondary",
    },
  ];

  return (
    <section id="precios" className="py-20 lg:py-28 relative bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            Planes Transparentes para PyMEs
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Elige el plan ideal según el número de sucursales que tengas.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Todos los planes incluyen 14 días de prueba gratuita sin tarjeta de
            crédito. Cancela en cualquier momento.
          </p>

          {/* Toggle Switch */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <span
              className={`text-sm font-medium ${!isAnnual ? "text-white" : "text-slate-400"}`}
            >
              Facturación Mensual
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-slate-800 rounded-full p-1 border border-slate-700 transition-colors focus:outline-none"
            >
              <div
                className={`w-6 h-6 rounded-full bg-emerald-400 shadow-md transform transition-transform ${
                  isAnnual
                    ? "translate-x-6 bg-gradient-to-r from-emerald-400 to-teal-300"
                    : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium flex items-center gap-1.5 ${isAnnual ? "text-white" : "text-slate-400"}`}
            >
              Facturación Anual
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                AHORRA 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={idx}
                className={`relative flex flex-col justify-between p-8 rounded-2xl transition-all duration-300 ${
                  plan.popular
                    ? "bg-slate-900 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-950/50 -translate-y-2"
                    : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-bold shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    Más Popular
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white font-mono">
                      ${price}
                    </span>
                    <span className="text-slate-400 text-sm">/mes</span>
                    {isAnnual && (
                      <span className="text-[11px] text-slate-500 block font-mono">
                        (facturado anualmente)
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: feat.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-white font-semibold">$1</strong>',
                            ),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <a
                    href="/dashboard"
                    className={`w-full inline-flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white"
                    }`}
                  >
                    {plan.buttonText}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-slate-400" />
          <span>
            Sin contratos forzosos. Cancela en cualquier momento con 1 clic.
          </span>
        </div>
      </div>
    </section>
  );
}
