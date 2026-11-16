"use client";

import { motion } from "motion/react";
import { CheckCircle2, CircleDot, Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui";
import { DashboardRecoveryActions } from "./DashboardRecoveryActions";

interface DashboardRecoveryBannerProps {
  sucursalesCount: number;
  nombreNegocioRescatado?: string | null;
  handleRetryAll: () => Promise<void>;
  isRetrying: boolean;
}

export function DashboardRecoveryBanner({
  sucursalesCount,
  nombreNegocioRescatado,
  handleRetryAll,
  isRetrying,
}: DashboardRecoveryBannerProps) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden bg-surface border border-border rounded-2xl shadow-xs"
    >
      {/* Barra superior de acento semántico */}
      <div className="h-1 w-full bg-gradient-to-r from-danger via-warning to-grape" />

      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Cuerpo izquierdo del Ticket */}
        <div className="lg:col-span-8 p-6 sm:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="danger" size="sm" dot={true}>
                No pudimos cargar tu negocio.
              </Badge>
              {sucursalesCount > 0 && (
                <Badge variant="grape" size="sm" dot={false}>
                  <Store className="w-3.5 h-3.5 mr-1" />
                  {sucursalesCount}{" "}
                  {sucursalesCount === 1
                    ? "sede detectada"
                    : "sedes detectadas"}
                </Badge>
              )}
            </div>

            <div className="space-y-1.5">
              <h1 className="font-bricolage font-bold text-2xl sm:text-[28px] text-text-primary tracking-tight leading-tight">
                {nombreNegocioRescatado
                  ? `Hola, ${nombreNegocioRescatado}`
                  : "Panel en modo de recuperación"}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
                Recarga la página o vuelve a iniciar sesión para sincronizar
                tu perfil completo. Mientras se restablece la conexión, tu
                estructura operativa y accesos directos siguen disponibles
                abajo.
              </p>
            </div>
          </div>

          {/* Chips de diagnóstico vivo */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt border border-border text-[11px] text-text-secondary font-medium">
              <CircleDot className="w-3.5 h-3.5 text-warning" />
              Sesión de negocio: Pendiente de respuesta
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt border border-border text-[11px] text-text-secondary font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              Sedes en caché:{" "}
              <strong className="font-mono text-text-primary">
                {sucursalesCount}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt border border-border text-[11px] text-text-secondary font-medium">
              <Sparkles className="w-3.5 h-3.5 text-grape" />
              Navegación local activa
            </span>
          </div>
        </div>

        {/* Talón derecho del Ticket con perforación y sello circular */}
        <div className="lg:col-span-4 relative border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-border bg-surface-alt/45 p-6 sm:p-7 flex flex-col justify-between gap-4">
          {/* Muescas semicirculares del corte de ticket (Desktop) */}
          <span
            aria-hidden="true"
            className="hidden lg:block absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background border border-border"
          />
          <span
            aria-hidden="true"
            className="hidden lg:block absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-background border border-border"
          />

          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted block">
                TICKET DE ESTADO
              </span>
              <span className="text-xs font-semibold text-text-primary">
                Acciones de conexión
              </span>
            </div>

            {/* Sello circular oficial (Design System §0.B Técnica 3) */}
            <div
              aria-hidden="true"
              className="sello text-danger/80 border-danger/40 shrink-0 select-none"
              style={{ width: "70px", height: "70px", fontSize: "9px" }}
            >
              <span>
                SYNC
                <br />
                RETRY
              </span>
            </div>
          </div>

          <DashboardRecoveryActions handleRetryAll={handleRetryAll} isRetrying={isRetrying} />
        </div>
      </div>
    </motion.div>
  );
}
