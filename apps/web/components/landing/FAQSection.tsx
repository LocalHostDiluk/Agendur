"use client";

import { useEffect } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isActive?: boolean;
}

const faqs: FAQItem[] = [
  {
    id: "one",
    question: "¿Se requiere tarjeta de crédito para iniciar la prueba de 14 días?",
    answer:
      "No. Puedes registrarte y configurar tus sucursales de inmediato sin ingresar ningún método de pago. Al finalizar tus 14 días de prueba, tú decides si deseas continuar y elegir el plan que mejor se adapte a tu negocio.",
    isActive: true,
  },
  {
    id: "two",
    question: "¿Cómo funciona el portal de reservas para mis clientes?",
    answer:
      "CitaSync genera un enlace único para tu negocio (por ejemplo, citasync.com/reserva/tu-marca) y códigos QR listos para imprimir. Tus clientes pueden ingresar desde cualquier navegador móvil o de escritorio, elegir la sucursal, el profesional, la fecha y hora disponible, y confirmar su cita en menos de 30 segundos sin descargar ninguna aplicación.",
  },
  {
    id: "three",
    question:
      "¿Puedo administrar múltiples sucursales con personal y horarios diferentes?",
    answer:
      "Sí. CitaSync fue creado específicamente con arquitectura multi-sucursal nativa. Puedes registrar cada local o clínica con su propia dirección, zona horaria, catálogo de servicios y equipo de profesionales con horarios y comisiones independientes.",
  },
  {
    id: "four",
    question:
      "¿Cómo se manejan los anticipos y qué pasarelas de pago se admiten?",
    answer:
      "Puedes configurar un cobro de anticipo obligatorio (por ejemplo, el 30%, 50% o el total del servicio). Integramos pasarela segura con Stripe para cobros con tarjeta de crédito/débito, además de soporte para registro de cobros manuales (efectivo o transferencia bancaria) con validación administrativa.",
  },
  {
    id: "five",
    question: "¿Cómo funcionan los recordatorios automáticos por WhatsApp?",
    answer:
      "Al agendar, el cliente recibe un mensaje automático de confirmación. Posteriormente, el sistema le envía recordatorios programados (por ejemplo, 24 horas y 2 horas antes de la cita) con la ubicación en Google Maps y la opción de reprogramar o cancelar a tiempo, liberando el espacio para otro cliente.",
  },
  {
    id: "six",
    question: "¿Puedo sincronizar mi agenda con Google Calendar?",
    answer:
      "Sí. Cada profesional o especialista de tu equipo puede vincular su calendario personal de Google para que los eventos existentes bloqueen automáticamente la disponibilidad en el portal de clientes, evitando citas encimadas.",
  },
];

export function FAQSection() {
  useEffect(() => {
    window.HSStaticMethods?.autoInit();
  }, []);

  return (
    <section id="faq">
      {/* FAQ */}
      <div className="max-w-340 px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        {/* Title */}
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-2xl font-bold md:text-4xl md:leading-tight text-gray-800 dark:text-neutral-200">
            Preguntas Frecuentes
          </h2>
          <p className="mt-1 text-gray-600 dark:text-neutral-300">
            Resolvemos tus dudas principales para que des el paso hacia la automatización de tu agenda.
          </p>
        </div>
        {/* End Title */}

        <div className="max-w-2xl mx-auto">
          {/* Accordion */}
          <div className="hs-accordion-group">
            {faqs.map((faq) => {
              const headingId = `hs-basic-with-title-and-arrow-stretched-heading-${faq.id}`;
              const collapseId = `hs-basic-with-title-and-arrow-stretched-collapse-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className={`hs-accordion hs-accordion-active:bg-gray-100 dark:hs-accordion-active:bg-neutral-700 rounded-xl p-6 ${
                    faq.isActive ? "active" : ""
                  }`}
                  id={headingId}
                >
                  <button
                    type="button"
                    className="hs-accordion-toggle group pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-start text-gray-800 dark:text-neutral-200 rounded-lg transition hover:text-gray-500 dark:hover:text-neutral-400 focus:outline-hidden"
                    aria-expanded={faq.isActive ? "true" : "false"}
                    aria-controls={collapseId}
                  >
                    {faq.question}
                    <svg
                      className="hs-accordion-active:hidden block shrink-0 size-5 text-gray-600 dark:text-neutral-300 group-hover:text-gray-500 dark:group-hover:text-neutral-400"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                    <svg
                      className="hs-accordion-active:block hidden shrink-0 size-5 text-gray-600 dark:text-neutral-300 group-hover:text-gray-500 dark:group-hover:text-neutral-400"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>
                  <div
                    id={collapseId}
                    className={`hs-accordion-content ${
                      faq.isActive ? "" : "hidden "
                    }w-full overflow-hidden transition-[height] duration-300`}
                    role="region"
                    aria-labelledby={headingId}
                  >
                    <p className="text-gray-800 dark:text-neutral-200">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* End Accordion */}
        </div>
      </div>
      {/* End FAQ */}
    </section>
  );
}
