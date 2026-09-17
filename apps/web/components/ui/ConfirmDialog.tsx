"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { LogOut, CalendarX, FileWarning, TriangleAlert } from "lucide-react";

export type ConfirmActionType =
  | "logout"
  | "cancelar_cita"
  | "descartar_cambios"
  | "eliminar_sucursal"
  | "eliminar_servicio"
  | "eliminar_personal"
  | "eliminar_cuenta"
  | "cancelar_suscripcion"
  | "custom";

export interface ConfirmDialogOptions {
  type: ConfirmActionType;
  level?: 1 | 2;
  targetName?: string;
  title?: string;
  description?: string;
  consequences?: string[];
  confirmText?: string;
  cancelText?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  useTicketButton?: boolean;
  locale?: "es" | "en";
  isLoading?: boolean;
}

export interface ConfirmDialogProps extends ConfirmDialogOptions {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  className?: string;
}

interface ActionDefinition {
  level: 1 | 2;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconColorClass: string;
  title: (targetName?: string, locale?: "es" | "en") => string;
  description?: (targetName?: string, locale?: "es" | "en") => string;
  consequences?: (targetName?: string, locale?: "es" | "en") => string[];
  confirmText: (locale?: "es" | "en") => string;
  cancelText: (locale?: "es" | "en") => string;
  confirmButtonVariant: "grape" | "danger" | "danger-ghost";
  requiresExactMatch: boolean;
  inputLabel?: (targetName?: string, locale?: "es" | "en") => string;
}

export const ACTION_CONFIGS: Record<Exclude<ConfirmActionType, "custom">, ActionDefinition> = {
  logout: {
    level: 1,
    icon: LogOut,
    iconColorClass: "text-[var(--grape)]",
    title: (_target, locale) => (locale === "en" ? "Heading out?" : "¿Ya te vas?"),
    description: (_target, locale) =>
      locale === "en"
        ? "You're about to log out. Come back anytime."
        : "Vas a cerrar tu sesión. Puedes volver cuando quieras.",
    confirmText: (locale) => (locale === "en" ? "Log out" : "Cerrar sesión"),
    cancelText: (locale) => (locale === "en" ? "Cancel" : "Cancelar"),
    confirmButtonVariant: "grape",
    requiresExactMatch: false,
  },
  cancelar_cita: {
    level: 1,
    icon: CalendarX,
    iconColorClass: "text-[var(--danger)]",
    title: (_target, locale) => (locale === "en" ? "Cancel this appointment?" : "¿Cancelar esta cita?"),
    description: (_target, locale) =>
      locale === "en"
        ? "We'll let the client know via WhatsApp that their appointment was canceled."
        : "Le avisaremos al cliente por WhatsApp que su cita fue cancelada.",
    confirmText: (locale) => (locale === "en" ? "Yes, cancel it" : "Sí, cancelar cita"),
    cancelText: (locale) => (locale === "en" ? "Cancel" : "Cancelar"),
    confirmButtonVariant: "danger",
    requiresExactMatch: false,
  },
  descartar_cambios: {
    level: 1,
    icon: FileWarning,
    iconColorClass: "text-[var(--grape)]",
    title: (_target, locale) => (locale === "en" ? "You have unsaved changes" : "Tienes cambios sin guardar"),
    description: (_target, locale) =>
      locale === "en"
        ? "If you leave now, you'll lose what you changed."
        : "Si sales ahora, vas a perder lo que modificaste.",
    confirmText: (locale) => (locale === "en" ? "Discard changes" : "Descartar cambios"),
    cancelText: (locale) => (locale === "en" ? "Keep editing" : "Seguir editando"),
    confirmButtonVariant: "danger-ghost",
    requiresExactMatch: false,
  },
  eliminar_sucursal: {
    level: 2,
    icon: TriangleAlert,
    iconColorClass: "text-[var(--danger)]",
    title: (target, locale) =>
      locale === "en"
        ? `You're about to delete ${target || "this branch"}`
        : `Vas a eliminar ${target || "esta sucursal"}`,
    consequences: (_target, locale) =>
      locale === "en"
        ? [
            "All future appointments at this location will be canceled",
            "Assigned staff will lose access to this dashboard",
            "You won't be able to recover this location's history",
          ]
        : [
            "Se cancelarán todas las citas futuras de esta sucursal",
            "El personal asignado perderá acceso a este panel",
            "No podrás recuperar el historial de esta sucursal",
          ],
    confirmText: (locale) => (locale === "en" ? "Delete location" : "Eliminar sucursal"),
    cancelText: (locale) => (locale === "en" ? "Cancel" : "Cancelar"),
    confirmButtonVariant: "danger",
    requiresExactMatch: true,
    inputLabel: (_target, locale) =>
      locale === "en"
        ? "Type the location's name to confirm"
        : "Escribe el nombre de la sucursal para confirmar",
  },
  eliminar_servicio: {
    level: 2,
    icon: TriangleAlert,
    iconColorClass: "text-[var(--danger)]",
    title: (target, locale) =>
      locale === "en"
        ? `You're about to delete ${target || "this service"}`
        : `Vas a eliminar ${target || "este servicio"}`,
    consequences: (_target, locale) =>
      locale === "en"
        ? [
            "Future appointments with this service must be rescheduled manually",
            "Clients will no longer be able to book it on your public portal",
          ]
        : [
            "Las citas futuras con este servicio deberán reasignarse manualmente",
            "Los clientes ya no podrán reservarlo en tu portal público",
          ],
    confirmText: (locale) => (locale === "en" ? "Delete service" : "Eliminar servicio"),
    cancelText: (locale) => (locale === "en" ? "Cancel" : "Cancelar"),
    confirmButtonVariant: "danger",
    requiresExactMatch: true,
    inputLabel: (_target, locale) =>
      locale === "en"
        ? "Type the service's name to confirm"
        : "Escribe el nombre del servicio para confirmar",
  },
  eliminar_personal: {
    level: 2,
    icon: TriangleAlert,
    iconColorClass: "text-[var(--danger)]",
    title: (target, locale) =>
      locale === "en"
        ? `You're about to remove ${target || "this member"} from the team`
        : `Vas a eliminar a ${target || "este miembro"} del equipo`,
    consequences: (_target, locale) =>
      locale === "en"
        ? [
            "They will immediately lose access to the dashboard",
            "Their future appointments must be reassigned to another team member",
          ]
        : [
            "Perderá acceso inmediato al panel",
            "Sus citas futuras deberán reasignarse a otro miembro del equipo",
          ],
    confirmText: (locale) => (locale === "en" ? "Remove from team" : "Eliminar del equipo"),
    cancelText: (locale) => (locale === "en" ? "Cancel" : "Cancelar"),
    confirmButtonVariant: "danger",
    requiresExactMatch: true,
    inputLabel: (_target, locale) =>
      locale === "en"
        ? "Type the person's name to confirm"
        : "Escribe el nombre de la persona para confirmar",
  },
  eliminar_cuenta: {
    level: 2,
    icon: TriangleAlert,
    iconColorClass: "text-[var(--danger)]",
    title: (target, locale) =>
      locale === "en"
        ? `You're about to delete your ${target || "business"} account`
        : `Vas a eliminar tu cuenta de ${target || "tu negocio"}`,
    consequences: (_target, locale) =>
      locale === "en"
        ? [
            "All your branches, services, and complete appointment history will be deleted",
            "Your booking portal will stop working immediately",
            "This action cannot be undone",
          ]
        : [
            "Se eliminarán todas tus sucursales, servicios y el historial completo de citas",
            "Tu portal de reservas dejará de funcionar de inmediato",
            "Esta acción no se puede deshacer",
          ],
    confirmText: (locale) => (locale === "en" ? "Delete my account" : "Eliminar mi cuenta"),
    cancelText: (locale) => (locale === "en" ? "Cancel" : "Cancelar"),
    confirmButtonVariant: "danger",
    requiresExactMatch: true,
    inputLabel: (_target, locale) =>
      locale === "en"
        ? "Type the full name of your business to confirm"
        : "Escribe el nombre completo de tu negocio para confirmar",
  },
  cancelar_suscripcion: {
    level: 2,
    icon: TriangleAlert,
    iconColorClass: "text-[var(--danger)]",
    title: (target, locale) =>
      locale === "en"
        ? `You're about to cancel your ${target || "Pro"} plan`
        : `Vas a cancelar tu plan ${target || "Pro"}`,
    consequences: (_target, locale) =>
      locale === "en"
        ? [
            "You will lose access to multi-branch management and online payments",
            "Your account will downgrade to the free plan at the end of the current billing period",
          ]
        : [
            "Perderás acceso a gestión multi-sucursal y pagos en línea",
            "Tu cuenta pasará al plan gratuito al finalizar el periodo actual",
          ],
    confirmText: (locale) => (locale === "en" ? "Cancel plan" : "Cancelar plan"),
    cancelText: (locale) => (locale === "en" ? "Keep my plan" : "Seguir con mi plan"),
    confirmButtonVariant: "danger",
    requiresExactMatch: false,
  },
};

export function ConfirmDialog({
  isOpen,
  type = "logout",
  level: explicitLevel,
  targetName = "",
  title: customTitle,
  description: customDescription,
  consequences: customConsequences,
  confirmText: customConfirmText,
  cancelText: customCancelText,
  inputLabel: customInputLabel,
  inputPlaceholder,
  useTicketButton = true,
  locale = "es",
  isLoading = false,
  onConfirm,
  onCancel,
  className = "",
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const consequencesId = useId();
  const inputId = useId();

  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPredefined = type !== "custom" && type in ACTION_CONFIGS;
  const config = isPredefined ? ACTION_CONFIGS[type as Exclude<ConfirmActionType, "custom">] : null;

  const level: 1 | 2 = explicitLevel ?? (config?.level ?? 1);
  const IconComponent = config?.icon ?? (level === 2 ? TriangleAlert : LogOut);
  const iconColor = config?.iconColorClass ?? (level === 2 ? "text-[var(--danger)]" : "text-[var(--grape)]");

  const title =
    customTitle ??
    (config ? config.title(targetName, locale) : locale === "en" ? "Confirm action" : "Confirmar acción");

  const description =
    customDescription ?? (config?.description ? config.description(targetName, locale) : undefined);

  const consequences =
    customConsequences ?? (config?.consequences ? config.consequences(targetName, locale) : undefined);

  const confirmText =
    customConfirmText ??
    (config ? config.confirmText(locale) : locale === "en" ? "Confirm" : "Confirmar");

  const cancelText =
    customCancelText ??
    (config ? config.cancelText(locale) : locale === "en" ? "Cancel" : "Cancelar");

  const requiresExactMatch =
    level === 2 && (config ? config.requiresExactMatch : Boolean(targetName));

  const inputLabel =
    customInputLabel ??
    (config?.inputLabel
      ? config.inputLabel(targetName, locale)
      : locale === "en"
      ? `Type "${targetName}" to confirm`
      : `Escribe "${targetName}" para confirmar`);

  const effectivePlaceholder = inputPlaceholder ?? targetName;
  const isExactMatched = !requiresExactMatch || inputValue === targetName;
  const isConfirmDisabled = !isExactMatched || isLoading || isSubmitting;
  const confirmVariant = config?.confirmButtonVariant ?? (level === 2 ? "danger" : "grape");
  const hasTicketClass = level === 2 && useTicketButton;

  // Scroll lock y tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onCancel]);

  // REGLA D.3: El foco por defecto al abrir SIEMPRE va en el botón Cancelar
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setInputValue("");
        cancelButtonRef.current?.focus();
      }, 16);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    if (isConfirmDisabled) return;
    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        setIsSubmitting(true);
        await result;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isConfirmDisabled) {
        handleConfirmClick();
      }
    }
  };

  let confirmButtonClass =
    "px-4 py-2.5 text-sm font-medium rounded-[var(--radius-md)] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center";

  if (confirmVariant === "grape") {
    confirmButtonClass +=
      " bg-[var(--grape)] text-white hover:opacity-90 focus:ring-[var(--grape)] shadow-xs";
  } else if (confirmVariant === "danger-ghost") {
    confirmButtonClass +=
      " text-[var(--danger)] bg-transparent hover:bg-[var(--danger-soft)] focus:ring-[var(--danger)]";
  } else {
    // default danger
    confirmButtonClass +=
      " bg-[var(--danger)] text-white hover:opacity-90 focus:ring-[var(--danger)] shadow-xs";
  }

  if (hasTicketClass) {
    confirmButtonClass += " btn-ticket mr-2";
  }

  const describedBy = description
    ? descriptionId
    : consequences && consequences.length > 0
    ? consequencesId
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        style={{ ["--ink" as string]: "var(--surface)" }}
        className={`bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl w-full transform transition-all p-6 relative overflow-visible ${
          level === 1
            ? "max-w-[400px] text-center"
            : "max-w-[460px] border-t-[3px] border-t-[var(--danger)]"
        } ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {level === 1 ? (
          /* Nivel 1 — Confirmación Simple */
          <>
            <div className="flex justify-center mb-4">
              <div
                className={`size-12 rounded-full flex items-center justify-center ${
                  iconColor.includes("danger")
                    ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                    : "bg-[var(--grape-soft)] text-[var(--grape)]"
                }`}
              >
                <IconComponent className="size-10" strokeWidth={1.75} />
              </div>
            </div>

            <h2 id={titleId} className="text-lg font-semibold text-[var(--text-primary)] leading-tight">
              {title}
            </h2>

            {description && (
              <p id={descriptionId} className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                {description}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                ref={cancelButtonRef}
                type="button"
                autoFocus
                onClick={onCancel}
                className="px-4 py-2.5 text-sm font-medium rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-alt)] border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--grape)] cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={isConfirmDisabled}
                className={confirmButtonClass}
              >
                {isLoading || isSubmitting ? (
                  <span
                    className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent rounded-full mr-2"
                    role="status"
                    aria-label="cargando"
                  />
                ) : null}
                {confirmText}
              </button>
            </div>
          </>
        ) : (
          /* Nivel 2 — Confirmación Crítica */
          <>
            <div className="flex items-start gap-3.5 mb-4">
              <div className="size-12 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center shrink-0">
                <TriangleAlert className="size-10" strokeWidth={1.75} />
              </div>
              <div className="pt-0.5">
                <h2
                  id={titleId}
                  className="text-base sm:text-lg font-semibold text-[var(--text-primary)] leading-snug"
                >
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="text-xs text-[var(--text-secondary)] mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {consequences && consequences.length > 0 && (
              <div className="my-4">
                <ul
                  id={consequencesId}
                  className="list-disc pl-5 space-y-1.5 text-sm text-[var(--text-secondary)]"
                >
                  {consequences.map((consequence, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {consequence}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {requiresExactMatch && (
              <div className="mt-4 mb-2">
                <label
                  htmlFor={inputId}
                  className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
                >
                  {inputLabel}
                </label>
                <input
                  id={inputId}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={effectivePlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-3 py-2 text-sm rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--grape)] focus:ring-2 focus:ring-[var(--grape-soft)] transition-colors"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                ref={cancelButtonRef}
                type="button"
                autoFocus
                onClick={onCancel}
                className="px-4 py-2.5 text-sm font-medium rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-alt)] border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--grape)] cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={isConfirmDisabled}
                className={confirmButtonClass}
              >
                {isLoading || isSubmitting ? (
                  <span
                    className="animate-spin inline-block size-4 border-[2px] border-current border-t-transparent rounded-full mr-2"
                    role="status"
                    aria-label="cargando"
                  />
                ) : null}
                {confirmText}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
