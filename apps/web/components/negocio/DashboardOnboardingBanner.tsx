"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

interface DashboardOnboardingBannerProps {
  nombreUsuario: string;
}

export function DashboardOnboardingBanner({ nombreUsuario }: DashboardOnboardingBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xs"
    >
      <div className="h-1 w-full bg-gradient-to-r from-grape via-flame to-mint" />
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 p-6 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-grape-soft text-grape border border-grape/20 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configuración inicial del negocio</span>
          </div>
          <h1 className="font-bricolage font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            Hola,{" "}
            {nombreUsuario}
          </h1>
          <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
            Tu negocio aún no tiene una primera sucursal. Completa tus datos
            y registra una ubicación real antes de publicar tu portal de
            reservas.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-soft text-success text-xs font-medium">
              <Check className="w-3.5 h-3.5" />
              1. Cuenta creada
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-grape-soft text-grape border border-grape/30 text-xs font-semibold">
              2. Registrar primera sucursal
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-text-muted text-xs font-medium">
              3. Recibir reservas
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 relative border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-border bg-surface-alt/45 p-6 sm:p-8 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted block">
                PROGRESO
              </span>
              <p className="text-sm font-medium text-text-primary mt-0.5">
                0 sedes registradas
              </p>
            </div>
            <div
              aria-hidden="true"
              className="sello text-grape border-grape/40 shrink-0"
              style={{ width: "72px", height: "72px", fontSize: "10px" }}
            >
              <span>
                1 / 3
                <br />
                PASOS
              </span>
            </div>
          </div>

          <Link href="/onboarding" className="w-full">
            <Button variant="primary" size="md" className="w-full">
              <span>Registrar primera sucursal</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
