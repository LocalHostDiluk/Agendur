"use client";

import React, { useEffect, useId, useRef, useState } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

let supportsDisplayTransition: boolean | undefined;

/**
 * Probes whether the browser genuinely transitions `display` via `allow-discrete`.
 * Firefox 129+ parses `transition-behavior: allow-discrete` without transitioning
 * `display`, so checking `CSS.supports` alone would drop exit animations.
 */
function canTransitionDisplay(): boolean {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !window.CSS?.supports?.("transition-behavior", "allow-discrete") ||
    !document.body
  ) {
    return false;
  }

  const probe = document.createElement("div");
  probe.style.cssText =
    "transition: display 1s allow-discrete !important; display: block;";
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = "none";
  supportsDisplayTransition = getComputedStyle(probe).display === "block";
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.CSS?.supports?.("overlay", "auto") && canTransitionDisplay()
  );
}

async function waitForAnimations(element: HTMLElement): Promise<void> {
  const animations =
    typeof element.getAnimations === "function"
      ? element.getAnimations({ subtree: true })
      : [];
  if (animations.length > 0) {
    await Promise.race([
      Promise.allSettled(animations.map((a) => a.finished)),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  }
}

async function closeTopLayer(element: HTMLDialogElement): Promise<void> {
  if (!supportsTopLayerExit()) {
    element.setAttribute("data-closing", "");
    await waitForAnimations(element);
    if (!element.hasAttribute("data-closing")) return;
    element.removeAttribute("data-closing");
  }

  try {
    if (element.open) {
      element.close();
    }
  } catch {
    element.removeAttribute("open");
  }

  if (supportsTopLayerExit()) {
    await waitForAnimations(element);
  }
}

function isPointerOutside(
  e: React.PointerEvent<HTMLDialogElement> | React.MouseEvent<HTMLDialogElement>,
  dialog: HTMLDialogElement
): boolean {
  const rect = dialog.getBoundingClientRect();
  return (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startedInsideRef = useRef(false);
  const [isPresent, setIsPresent] = useState(isOpen);

  if (isOpen && !isPresent) {
    setIsPresent(true);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let cancelled = false;

    if (isOpen) {
      dialog.removeAttribute("data-closing");
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          dialog.setAttribute("open", "");
        }
      }
      return () => {
        cancelled = true;
      };
    }

    if (dialog.open) {
      void closeTopLayer(dialog).then(() => {
        if (!cancelled) {
          setIsPresent(false);
        }
      });
    } else {
      setIsPresent(false);
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onPointerDown={(e) => {
        startedInsideRef.current = !isPointerOutside(e, e.currentTarget);
      }}
      onClick={(e) => {
        const shouldClose =
          e.target === e.currentTarget &&
          !startedInsideRef.current &&
          (e.detail === 0 || isPointerOutside(e, e.currentTarget));
        startedInsideRef.current = false;
        if (shouldClose) {
          onClose();
        }
      }}
      className={`modal-dialog bg-surface border border-border text-text-primary surface-overlay-depth rounded-[var(--radius-lg)] w-full max-w-lg p-0 overflow-hidden m-auto ${className}`.trim()}
    >
      {isPresent ? (
        <div className="flex flex-col max-h-[85vh]">
          {(title || description) && (
            <div className="flex justify-between items-start py-3.5 px-5 border-b border-border shrink-0">
              <div>
                {title && (
                  <h3
                    id={titleId}
                    className="font-bricolage font-bold text-text-primary heading-balance"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p
                    id={descriptionId}
                    className="text-sm text-text-secondary mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="inline-flex justify-center items-center size-8 rounded-full border border-transparent bg-surface-alt text-text-secondary hover:text-text-primary hover:bg-border/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape shrink-0 ml-2 cursor-pointer transition-colors"
              >
                <svg
                  className="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="p-4 sm:p-6 overflow-y-auto scroll-shadows-y">
            {children}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
