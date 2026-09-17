"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
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
   * Tipo de proceso en ejecución. Determina la secuencia de mensajes.
   * @default 'pago'
   */
  process?: ProcessType;

  /**
   * Alias de compatibilidad para `process`.
   */
  processType?: ProcessType;

  /**
   * Estado actual del proceso.
   * - 'loading': Muestra el ciclo de actividad y mensajes.
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
   * Lista de mensajes personalizados opcionales para reemplazar los predeterminados.
   */
  customMessages?: string[];

  /**
   * Callback invocado tras 800ms de mantener el estado de éxito (REGLA C.3).
   */
  onComplete?: () => void;

  /**
   * Callback invocado al presionar el botón 'Reintentar' en estado de error (REGLA C.4).
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

const PROCESS_MESSAGES: Record<ProcessType, { es: string[]; en: string[] }> = {
  pago: {
    es: [
      "Verificando datos de pago…",
      "Procesando con la pasarela…",
      "Confirmando transacción…",
    ],
    en: [
      "Verifying payment details…",
      "Processing with the gateway…",
      "Confirming transaction…",
    ],
  },
  reporte: {
    es: [
      "Recopilando datos…",
      "Calculando métricas…",
      "Preparando tu archivo…",
    ],
    en: [
      "Gathering data…",
      "Calculating metrics…",
      "Preparing your file…",
    ],
  },
  reserva: {
    es: [
      "Verificando disponibilidad…",
      "Confirmando con el negocio…",
      "Enviando tu confirmación…",
    ],
    en: [
      "Checking availability…",
      "Confirming with the business…",
      "Sending your confirmation…",
    ],
  },
};

const TAKING_LONGER_MESSAGE: Record<ProcessingLang, string> = {
  es: "Esto está tardando más de lo normal, pero seguimos en eso.",
  en: "This is taking longer than usual, but we're still on it.",
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

  // Lista de mensajes a ciclar
  const messageList = useMemo(() => {
    if (customMessages && customMessages.length > 0) {
      return customMessages;
    }
    return PROCESS_MESSAGES[activeProcess]?.[lang] || PROCESS_MESSAGES.pago[lang];
  }, [activeProcess, lang, customMessages]);

  // Control de estado para REGLA C.1 (mínimo 1200ms antes de pasar a éxito)
  const [isSuccessUnlocked, setIsSuccessUnlocked] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  // Registro de tiempo de inicio sin impurezas en render
  const startTimeRef = useRef<number | null>(null);

  // Referencias para callbacks actualizadas en effect
  const onCompleteRef = useRef(onComplete);
  const onRetryRef = useRef(onRetry);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onRetryRef.current = onRetry;
  });

  // Inicializar startTime en el montaje o cuando status cambia
  useEffect(() => {
    if (startTimeRef.current === null || status === "loading") {
      startTimeRef.current = Date.now();
    }
  }, [status]);

  // Bloqueo de scroll del body mientras el overlay esté abierto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Transición a éxito respetando REGLA C.1 (mínimo 1200ms)
  useEffect(() => {
    if (status !== "success") {
      return;
    }

    const startTime = startTimeRef.current ?? Date.now();
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 1200 - elapsed);

    const timer = setTimeout(() => {
      setIsSuccessUnlocked(true);
    }, remaining);

    return () => {
      clearTimeout(timer);
    };
  }, [status]);

  // Derivación limpia del displayStatus
  let displayStatus: ProcessingStatus = status;
  if (status === "success" && !isSuccessUnlocked && typeof window !== "undefined") {
    displayStatus = "loading";
  }

  // Manejo del estado éxito: mantener 800ms antes de disparar onComplete (REGLA C.3)
  useEffect(() => {
    if (displayStatus === "success") {
      const timer = setTimeout(() => {
        onCompleteRef.current?.();
      }, 800);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [displayStatus]);

  // Ciclo de mensajes (cada 1800ms) y regla de 8 segundos (REGLA C.2)
  useEffect(() => {
    if (displayStatus !== "loading") {
      return;
    }

    const startTime = startTimeRef.current ?? Date.now();
    const elapsed = Date.now() - startTime;
    const remainingLonger = Math.max(0, 8000 - elapsed);

    const longerTimer = setTimeout(() => {
      setIsTakingLonger(true);
    }, remainingLonger);

    let cycleInterval: ReturnType<typeof setInterval> | null = null;
    if (!isTakingLonger) {
      cycleInterval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messageList.length);
      }, 1800);
    }

    return () => {
      clearTimeout(longerTimer);
      if (cycleInterval) {
        clearInterval(cycleInterval);
      }
    };
  }, [displayStatus, isTakingLonger, messageList.length]);

  const handleRetry = () => {
    startTimeRef.current = Date.now();
    setIsTakingLonger(false);
    setCurrentMessageIndex(0);
    setIsSuccessUnlocked(false);
    onRetryRef.current?.();
  };

  const currentMessage = isTakingLonger
    ? TAKING_LONGER_MESSAGE[lang]
    : messageList[currentMessageIndex % messageList.length];

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
            if (displayStatus === "error" && onClose) {
              onClose();
            }
          }}
        >
          {/* Estilos locales para los 3 cuadrados de actividad */}
          <style>{`
            @keyframes agendur-square-pulse {
              0%, 100% {
                opacity: 0.3;
              }
              50% {
                opacity: 1;
              }
            }
            .agendur-pulse-dot {
              width: 8px;
              height: 8px;
              border-radius: 3px;
              background-color: var(--grape, #6e49a6);
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
            @media (prefers-reduced-motion: reduce) {
              .agendur-pulse-dot {
                animation: none !important;
                opacity: 0.6 !important;
              }
            }
          `}</style>

          <motion.div
            initial={
              variant === "modal" && !shouldReduceMotion
                ? { opacity: 0, scale: 0.95 }
                : { opacity: 0 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={
              variant === "modal" && !shouldReduceMotion
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
              {displayStatus === "loading" && (
                <motion.div
                  key="status-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  className="flex flex-col items-center"
                >
                  {/* Indicador de actividad: 3 cuadrados redondeados de 8x8px con gap 6px */}
                  <div
                    className="flex items-center justify-center gap-[6px]"
                    role="status"
                    aria-label="Cargando"
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

                  {/* Texto de estado: Inter 14px, --text-secondary, crossfade 200ms cada 1800ms */}
                  <div className="mt-4 min-h-[44px] flex items-center justify-center text-center px-1 w-full">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentMessage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.2,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="text-[14px] leading-snug text-center text-[var(--text-secondary,#6b6355)] font-sans"
                      >
                        {currentMessage}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Separador risográfico */}
                  <div className="perforacion my-4" />

                  {/* Texto de ayuda fijo: Inter 12px, --text-muted */}
                  <p className="text-[12px] text-center text-[var(--text-muted,#a39c8c)] font-sans">
                    {HELP_TEXT[lang]}
                  </p>
                </motion.div>
              )}

              {displayStatus === "success" && (
                <motion.div
                  key="status-success"
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  className="flex flex-col items-center justify-center py-3 text-center"
                >
                  <CircleCheck
                    className="w-10 h-10 text-[var(--mint,#46b88a)] mb-3"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <h3 className="text-[16px] font-semibold text-[var(--text-primary,#211a26)] font-sans">
                    {SUCCESS_TEXT[lang]}
                  </h3>
                </motion.div>
              )}

              {displayStatus === "error" && (
                <motion.div
                  key="status-error"
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  className="flex flex-col items-center justify-center py-2 text-center"
                >
                  <CircleAlert
                    className="w-10 h-10 text-[var(--danger,#d14343)] mb-3"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <p className="text-[14px] text-[var(--text-secondary,#6b6355)] font-sans px-2 mb-4 leading-relaxed">
                    {errorMessage || DEFAULT_ERROR_MESSAGE[lang]}
                  </p>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-[var(--grape,#6e49a6)] hover:brightness-105 active:scale-[0.98] rounded-[var(--radius-md,10px)] transition-all cursor-pointer shadow-xs"
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
