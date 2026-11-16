"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui";

interface AgendaManualButtonProps {
  onClick: () => void;
  className: string;
}

export function AgendaManualButton({ onClick, className }: AgendaManualButtonProps) {
  return (
    <Button variant="primary" onClick={onClick} className={className}>
      <Plus className="w-4 h-4" strokeWidth={2} />
      <span>Agendar Cita Manual</span>
    </Button>
  );
}
