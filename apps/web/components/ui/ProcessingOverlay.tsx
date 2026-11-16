"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CircleCheck, CircleAlert } from "lucide-react";

export type ProcessType = "pago" | "reporte" | "reserva";
export type ProcessingStatus = "loading" | "success" | "error";
export type ProcessingLang = "es" | "en";
export type ProcessingVariant = "modal" | "fullscreen";

export interface ProcessingOverlayProps {
  /**
   * Controla si el overlay está visible o no.
   * @default true
   */
  isOpen?: boolean;

  /**
   * Tipo de proceso en ejecución. Determina el mensaje canónico del proceso.
   * @default 'pago'
   */
  process?: ProcessType;

  /**
   * Alias de compatibilidad para `process`.
   */
  processType?: ProcessType;

  /**
   * Estado actual del proceso.
   * - 'loading': Muestra el indicador de actividad y el mensaje de estado.
   * - 'success': Muestra ícono de éxito y texto ¡Listo! / Done!
   * - 'error': Muestra ícono de error, mensaje y botón reintentar.
   * @default 'loading'
   */
  status?: ProcessingStatus;

  /**
   * Idioma de los textos ('es' o 'en').
   * @default 'es'
   */
  lang?: ProcessingLang;

  /**
   * Variante de presentación del contenedor.
   * - 'modal': Overlay sobre viewport con fondo rgba(29,23,32,0.85).
   * - 'fullscreen': Cubre toda la pantalla con fondo sólido --ink (#1d1720).
   * @default 'modal'
   */
  variant?: ProcessingVariant;

  /**
   * Mensaje de error personalizado en caso de falla.
   */
  errorMessage?: string;

  /**
   * Mensaje explícito de etapa reportado por el backend.
   * Reemplaza el mensaje canónico del proceso sin rotación por temporizador.
   */
  stageMessage?: string;

  /**
   * Compatibilidad heredada: si se proporciona y no hay `stageMessage`,
   * muestra únicamente `customMessages[0]` sin ciclar por temporizador.
   */
  customMessages?: string[];

  /**
   * Callback invocado inmediatamente al entrar al estado abierto de éxito.
   */
  onComplete?: () => void;

  /**
   * Callback invocado al presionar el botón 'Reintentar' en estado de error.
   */
  onRetry?: () => void;

  /**
   * Callback opcional de cierre si se requiere.
   */
  onClose?: () => void;

  /**
   * Clases CSS adicionales para la tarjeta del ticket.
   */
  className?: string;
}

const PROCESS_MESSAGES: Record<ProcessType, Record<ProcessingLang, string>> = {
  pago: {
    es: "Procesando tu pago…",
    en: "Processing your payment…",
  },
  reporte: {
    es: "Preparando tu reporte…",
    en: "Preparing your report…",
  },
  reserva: {
    es: "Confirmando tu cita…",
    en: "Confirming your appointment…",
  },
};

const TAKING_LONGER_MESSAGE: Record<ProcessingLang, string> = {
  es: "Esto está tardando más de lo normal.",
  en: "This is taking longer than usual.",
};

const HELP_TEXT: Record<ProcessingLang, string> = {
  es: "Esto puede tardar unos segundos.",
  en: "This may take a few seconds.",
};

const SUCCESS_TEXT: Record<ProcessingLang, string> = {
  es: "¡Listo!",
  en: "Done!",
};

const RETRY_TEXT: Record<ProcessingLang, string> = {
  es: "Reintentar",
  en: "Retry",
};

const DEFAULT_ERROR_MESSAGE: Record<ProcessingLang, string> = {
  es: "Ocurrió un problema al procesar la solicitud.",
  en: "A problem occurred while processing the request.",
};

export function ProcessingOverlay({
  isOpen = true,
  process,
  processType,
  status = "loading",
  lang = "es",
  variant = "modal",
  errorMessage,
  stageMessage,
  customMessages,
  onComplete,
  onRetry,
  onClose,
  className = "",
}: ProcessingOverlayProps) {
  const dialogId = useId();
  const shouldReduceMotion = useReducedMotion();

  // Tipo de proceso activo
  const activeProcess: ProcessType = process || processType || "pago";

  const [isTakingLonger, setIsTakingLonger] = useState(false);

  // Evita disparos duplicados de onComplete por cada entrada al estado de éxito abierto
  const hasCompletedRef = useRef(false);

  // Referencias para callbacks actualizadas en effect
  const onCompleteRef = useRef(onComplete);
  const onRetryRef = useRef(onRetry);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onRetryRef.current = onRetry;
  });

  // Bloqueo de scroll del body mientras el overlay esté abierto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Éxito inmediato: notificar onComplete sin demoras artificiales (Design-system.md §8.2)
  useEffect(() => {
    if (isOpen && status === "success") {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    hasCompletedRef.current = false;
  }, [isOpen, status]);

  // Aviso de espera prolongada a los 8s mientras sigue cargando; se reinicia al salir o cerrar
  useEffect(() => {
    if (!isOpen || status !== "loading") {
      return;
    }

    const longerTimer = setTimeout(() => {
      setIsTakingLonger(true);
    }, 8000);

    return () => {
      clearTimeout(longerTimer);
      setIsTakingLonger(false);
    };
  }, [isOpen, status, stageMessage]);

  const handleRetry = () => {
    hasCompletedRef.current = false;
    setIsTakingLonger(false);
    onRetryRef.current?.();
  };

  const baseMessage =
    stageMessage ||
    (customMessages && customMessages.length > 0 ? customMessages[0] : undefined) ||
    PROCESS_MESSAGES[activeProcess]?.[lang] ||
    PROCESS_MESSAGES.pago[lang];

  const showTakingLonger = isOpen && status === "loading" && isTakingLonger;
  const currentMessage = showTakingLonger
    ? TAKING_LONGER_MESSAGE[lang]
    : baseMessage;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-live="polite"
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 select-none ${
            variant === "fullscreen"
              ? "bg-[var(--ink,#1d1720)]"
              : "bg-[rgba(29,23,32,0.85)] backdrop-blur-xs"
          }`}
          onClick={() => {
            // El overlay de procesamiento es modal y no permite descarte accidental durante carga
            if (status === "error" && onClose) {
              onClose();
            }
          }}
        >
          {/* Estilos locales para los 3 cuadrados de actividad (opt-in en movimiento) */}
          <style>{`
            .agendur-pulse-dot {
              width: 8px;
              height: 8px;
              border-radius: 3px;
              background-color: var(--grape, #6e49a6);
              opacity: 0.6;
            }
            @media (prefers-reduced-motion: no-preference) {
              @keyframes agendur-square-pulse {
                0%, 100% {
                  opacity: 0.3;
                }
                50% {
                  opacity: 1;
                }
              }
              .agendur-pulse-dot {
                opacity: 1;
                animation: agendur-square-pulse 900ms ease-in-out infinite;
              }
              .agendur-pulse-dot-0 {
                animation-delay: 0ms;
              }
              .agendur-pulse-dot-1 {
                animation-delay: 200ms;
              }
              .agendur-pulse-dot-2 {
                animation-delay: 400ms;
              }
            }
          `}</style>

          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : variant === "modal"
                  ? { opacity: 0, scale: 0.95 }
                  : { opacity: 0 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={
              shouldReduceMotion
                ? undefined
                : variant === "modal"
                  ? { opacity: 0, scale: 0.95 }
                  : { opacity: 0 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`ticket ticket-on-ink w-[320px] max-w-[320px] bg-[var(--paper-pure,#ffffff)] rounded-[var(--radius-lg,16px)] p-6 shadow-2xl relative ${
              variant === "fullscreen"
                ? "[&::before]:!bg-[var(--ink,#1d1720)] [&::after]:!bg-[var(--ink,#1d1720)]"
                : "[&::before]:!bg-[rgba(29,23,32,0.85)] [&::after]:!bg-[rgba(29,23,32,0.85)]"
            } ${className}`.trim()}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="status-loading"
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  className="flex flex-col items-center"
                >
                  {/* Indicador de actividad: 3 cuadrados redondeados de 8x8px con gap 6px */}
                  <div
                    className="flex items-center justify-center gap-[6px]"
                    role="status"
                    aria-label={lang === "en" ? "Loading" : "Cargando"}
                  >
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className={`agendur-pulse-dot agendur-pulse-dot-${idx} ${
                          shouldReduceMotion ? "!opacity-60 !animate-none" : ""
                        }`}
                        style={
                          shouldReduceMotion
                            ? undefined
                            : { animationDelay: `${idx * 200}ms` }
                        }
                      />
                    ))}
                  </div>

                  {/* Texto de estado: Inter 14px, --text-secondary */}
                  <div className="mt-4 min-h-[44px] flex items-center justify-center text-center px-1 w-full">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentMessage}
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.2,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="prose-pretty text-[14px] leading-snug text-center text-[var(--text-secondary,#6b6355)] font-sans"
                      >
                        {currentMessage}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Separador risográfico */}
                  <div className="perforacion my-4" />

                  {/* Texto de ayuda fijo: Inter 12px, --text-muted */}
                  <p className="prose-pretty text-[12px] text-center text-[var(--text-muted,#a39c8c)] font-sans">
                    {HELP_TEXT[lang]}
                  </p>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="status-success"
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, scale: 0.95 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  className="flex flex-col items-center justify-center py-3 text-center"
                >
                  <CircleCheck
                    className="w-10 h-10 text-[var(--success-text)] mb-3"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <h3 className="heading-balance text-[16px] font-semibold text-[var(--text-primary,#211a26)] font-sans">
                    {SUCCESS_TEXT[lang]}
                  </h3>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="status-error"
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, scale: 0.95 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  className="flex flex-col items-center justify-center py-2 text-center"
                >
                  <CircleAlert
                    className="w-10 h-10 text-[var(--danger-text)] mb-3"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <p className="prose-pretty text-[14px] text-[var(--text-secondary,#6b6355)] font-sans px-2 mb-4 leading-relaxed">
                    {errorMessage || DEFAULT_ERROR_MESSAGE[lang]}
                  </p>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium bg-[var(--action-bg)] text-[var(--action-fg)] hover:bg-[var(--action-hover)] motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape rounded-[var(--radius-md,10px)] transition-colors cursor-pointer shadow-xs"
                    >
                      {RETRY_TEXT[lang]}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
