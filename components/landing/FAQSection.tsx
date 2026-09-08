"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question:
        "¿Puedo administrar múltiples sucursales con diferentes direcciones y horarios?",
      answer:
        "Sí. CitaSync está diseñado específicamente para PyMEs con múltiples locales o sucursales. Puedes dar de alta cada ubicación con su dirección, zona horaria, catálogo de servicios y personal independiente.",
    },
    {
      question: "¿Cómo funcionan los recordatorios automáticos por WhatsApp?",
      answer:
        "Al momento de la reserva, el sistema envía un mensaje de confirmación por WhatsApp. Posteriormente, envía recordatorios automáticos (por ejemplo, 24 horas y 2 horas antes de la cita) con la ubicación GPS de la sucursal y la opción de reprogramar si es necesario.",
    },
    {
      question:
        "¿Mis clientes necesitan instalar alguna aplicación para reservar?",
      answer:
        "No. Tus clientes pueden agendar directamente desde cualquier navegador web en su teléfono o computadora mediante tu enlace personalizado o código QR. Es un proceso rápido de menos de 30 segundos.",
    },
    {
      question: "¿Puedo exigir el pago de un anticipo o depósito para agendar?",
      answer:
        "Sí. Puedes conectar tu cuenta de Stripe o MercadoPago y definir un porcentaje de anticipo (ej. 50%) o cobrar la totalidad del servicio en línea antes de confirmar la cita.",
    },
    {
      question: "¿Se sincroniza con Google Calendar o Microsoft Outlook?",
      answer:
        "Así es. Cada especialista o profesional de tu equipo puede conectar su calendario personal para que sus compromisos personales bloqueen automáticamente sus horarios disponibles en el portal de clientes.",
    },
    {
      question: "¿Existe algún contrato de permanencia forzosa?",
      answer:
        "Ninguno. Todos los planes son de cancelación libre mes a mes o anualmente. Puedes probar CitaSync gratis durante 14 días sin ingresar tarjeta de crédito.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-slate-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            Preguntas Frecuentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Todo lo que necesitas saber para digitalizar tus citas.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-white font-semibold text-base sm:text-lg hover:text-emerald-400 transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-800/40 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
