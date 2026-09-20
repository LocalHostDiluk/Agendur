"use client";

import React, { useState } from "react";
import { useLandingLanguage } from "./LandingLanguageContext";
import { Check } from "lucide-react";

export function PricingSection() {
  const { lang, t } = useLandingLanguage();
  const [annual, setAnnual] = useState(true);

  const plans =
    lang === "en"
      ? [
          {
            name: "Starter",
            detail:
              "For solo practitioners, barbers, and independent consultancies.",
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
            detail:
              "For growing businesses with teams of specialists and high demand.",
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
            detail:
              "For multi-branch groups and franchises needing centralized oversight.",
            price: null,
            features: [
              "Unlimited branches",
              "Multiple Stripe accounts",
              "Unlimited WhatsApp reminders",
              "Multi-branch intelligence reports",
              "Dedicated 24/7 advisor",
            ],
          },
        ]
      : [
          {
            name: "Starter",
            detail:
              "Para consultorios individuales, barberos y terapeutas independientes.",
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
            detail:
              "Para negocios consolidados con equipo de especialistas y alta demanda.",
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
            detail:
              "Para franquicias, cadenas y clínicas con múltiples ubicaciones activas.",
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
            aria-label={lang === "en" ? "Billing period" : "Periodo de facturaci\u00f3n"}
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
              <span>{lang === "en" ? "-20%" : "-20%"}</span>
            </button>
          </div>
        </div>
        <div className="plans">
          {plans.map((plan, i) => (
            <article className={`plan-ticket p-${i}`} key={plan.name}>
              <div className="plan-head">
                <div className="plan-title-row">
                  <span className="plan-name">{plan.name}</span>
                  {i === 1 && (
                    <span className="popular">
                      {lang === "en" ? "Most popular" : "Más elegido"}
                    </span>
                  )}
                </div>
                <p>{plan.detail}</p>
                {plan.price === null ? (
                  <div className="price">
                    <strong>
                      {lang === "en" ? "Contact the team" : "Contacta al equipo"}
                    </strong>
                  </div>
                ) : (
                  <div className="price">
                    <small>$</small>
                    <strong>
                      {annual ? Math.round(plan.price * 0.8) : plan.price}
                    </strong>
                    <span>{lang === "en" ? " / mo" : " / mes"}</span>
                  </div>
                )}
              </div>
              <div className="perforation">
                <i />
                <span>{lang === "en" ? "Includes:" : "Incluye:"}</span>
                <i />
              </div>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={16} strokeWidth={1.75} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                className="outline-button"
                href={plan.price === null ? "#contacto" : "/register"}
              >
                {plan.price === null
                  ? lang === "en"
                    ? "Contact the team"
                    : "Contacta al equipo"
                  : lang === "en"
                    ? "Start for free"
                    : "Empieza gratis"}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
