"use client";

import { useState } from "react";
import { useLandingLanguage } from "./LandingLanguageContext";
import { PricingCard, type PricingPlan } from "./PricingCard";

const PLANS_EN: PricingPlan[] = [
  {
    name: "Starter",
    detail: "For solo practitioners, barbers, and independent consultancies.",
    price: 199,
    features: [
      "1 branch included",
      "Unlimited appointments & services",
      "Booking page business.agendur.app",
      "100 WhatsApp reminders / mo",
      "Email support",
    ],
  },
  {
    name: "Pro",
    detail: "For growing businesses with teams of specialists and high demand.",
    price: 399,
    features: [
      "Up to 3 branches",
      "Online deposits & full pay",
      "500 automated reminders / mo",
      "Full exportable analytics",
      "Priority WhatsApp support",
    ],
  },
  {
    name: "Business",
    detail: "For multi-branch groups and franchises needing centralized oversight.",
    price: null,
    features: [
      "Unlimited branches",
      "Multiple Stripe accounts",
      "Unlimited WhatsApp reminders",
      "Multi-branch intelligence reports",
      "Dedicated 24/7 advisor",
    ],
  },
];

const PLANS_ES: PricingPlan[] = [
  {
    name: "Starter",
    detail: "Para consultorios individuales, barberos y terapeutas independientes.",
    price: 199,
    features: [
      "1 sucursal incluida",
      "Citas y servicios ilimitados",
      "Página de reservas negocio.agendur.app",
      "100 recordatorios WhatsApp / mes",
      "Soporte por correo",
    ],
  },
  {
    name: "Pro",
    detail: "Para negocios consolidados con equipo de especialistas y alta demanda.",
    price: 399,
    features: [
      "Hasta 3 sucursales",
      "Cobro de anticipos y pagos online",
      "500 recordatorios automáticos / mes",
      "Reportes completos y exportables",
      "Soporte prioritario por WhatsApp",
    ],
  },
  {
    name: "Business",
    detail: "Para franquicias, cadenas y clínicas con múltiples ubicaciones activas.",
    price: null,
    features: [
      "Sucursales ilimitadas",
      "Múltiples cuentas Stripe",
      "Recordatorios WhatsApp ilimitados",
      "Reportes avanzados multi-sede",
      "Asesor dedicado 24/7",
    ],
  },
];

export function PricingSection() {
  const { lang, t } = useLandingLanguage();
  const [annual, setAnnual] = useState(true);
  const plans = lang === "en" ? PLANS_EN : PLANS_ES;

  return (
    <section className="section paper pricing" id="precios">
      <div className="wrap">
        <div className="pricing-header">
          <div className="pricing-title-wrap">
            <p className="eyebrow">
              {lang === "en" ? "03 / Clear pricing" : "03 / Precios claros"}
            </p>
            <h2 className="section-title">{t.priceTitle}</h2>
          </div>
          <div
            className="price-toggle"
            role="group"
            aria-label={lang === "en" ? "Billing period" : "Periodo de facturación"}
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={!annual ? "is-active" : ""}
              aria-pressed={!annual}
            >
              {lang === "en" ? "Monthly" : "Mensual"}
              <span className="placeholder" aria-hidden="true">
                &nbsp;
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={annual ? "is-active" : ""}
              aria-pressed={annual}
            >
              {lang === "en" ? "Annual" : "Anual"}
              <span>-20%</span>
            </button>
          </div>
        </div>
        <div className="plans">
          {plans.map((plan, i) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={i}
              annual={annual}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
