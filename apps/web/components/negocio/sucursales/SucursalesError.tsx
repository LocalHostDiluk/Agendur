"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SucursalesErrorProps {
  title: string;
  description: string;
  onRetry: () => void;
}

export function SucursalesError({
  title,
  description,
  onRetry,
}: SucursalesErrorProps) {
  return (
    <div className="p-8 rounded-2xl bg-surface border border-danger/30 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto">
          {description}
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRetry}
        className="min-h-[44px]"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Reintentar</span>
      </Button>
    </div>
  );
}
