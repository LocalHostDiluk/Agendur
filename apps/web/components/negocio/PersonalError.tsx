"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PersonalErrorProps {
  onRetry: () => void;
}

export function PersonalError({ onRetry }: PersonalErrorProps) {
  return (
    <div
      role="alert"
      className="bg-danger/10 border border-danger/20 rounded-2xl p-6 text-center space-y-3"
    >
      <div className="size-12 rounded-full bg-danger/15 text-danger flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-bricolage font-bold text-lg text-text-primary">
        No se pudo cargar el personal
      </h3>
      <p className="text-sm text-text-secondary max-w-md mx-auto">
        Ocurrió un error al obtener la información de los colaboradores. Por
        favor intenta de nuevo.
      </p>
      <Button
        type="button"
        variant="secondary"
        onClick={onRetry}
        className="gap-2 mx-auto"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reintentar</span>
      </Button>
    </div>
  );
}
