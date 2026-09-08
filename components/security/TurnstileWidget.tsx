"use client";

import { useEffect, useRef, useState } from "react";
import { TURNSTILE_TEST_SITE_KEY } from "@/lib/security/turnstile";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error: unknown) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: unknown) => void;
  onExpire?: () => void;
  className?: string;
}

export default function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const siteKey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
    TURNSTILE_TEST_SITE_KEY;

  useEffect(() => {
    // 1. Cargar el script de Turnstile si no está ya en el documento
    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkAndRender = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "auto",
            callback: (token: string) => {
              onVerify(token);
            },
            "error-callback": (err: unknown) => {
              onError?.(err);
            },
            "expired-callback": () => {
              onExpire?.();
            },
          });
          setLoaded(true);
        } catch {
          // Ignorar si el contenedor ya tenía un widget
        }
      }
    };

    if (window.turnstile) {
      checkAndRender();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          checkAndRender();
        }
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // Cleanup silencioso
        }
      }
    };
  }, [siteKey, onVerify, onError, onExpire]);

  return (
    <div className={`flex justify-center my-3 min-h-[65px] ${className}`}>
      <div ref={containerRef} />
      {!loaded && (
        <div className="text-xs text-slate-400 dark:text-slate-500 py-4 flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span>Cargando verificación de seguridad...</span>
        </div>
      )}
    </div>
  );
}
