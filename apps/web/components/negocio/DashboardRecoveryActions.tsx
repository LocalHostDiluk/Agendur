"use client";

import Link from "next/link";
import { LogIn, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface DashboardRecoveryActionsProps {
  handleRetryAll: () => Promise<void>;
  isRetrying: boolean;
}

export function DashboardRecoveryActions({ handleRetryAll, isRetrying }: DashboardRecoveryActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
      <Button
        variant="primary"
        size="md"
        onClick={handleRetryAll}
        isLoading={isRetrying}
        className="w-full cursor-pointer text-xs"
      >
        <RefreshCw className="w-4 h-4" />
        <span>
          {isRetrying
            ? "Sincronizando datos…"
            : "Reintentar conexión ahora"}
        </span>
      </Button>

      <Link href="/login" className="w-full">
        <Button
          variant="secondary"
          size="md"
          className="w-full text-xs"
        >
          <LogIn className="w-3.5 h-3.5 text-text-secondary" />
          <span>Volver a iniciar sesión</span>
        </Button>
      </Link>
    </div>
  );
}
