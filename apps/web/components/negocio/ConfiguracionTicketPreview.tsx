import { Sparkles, Clock, CheckCheck } from "lucide-react";
import { PendingBadge } from "@/components/ui";

export interface ConfiguracionTicketPreviewProps {
  nombreNegocio: string;
  canalPlantilla: "whatsapp" | "sms";
  renderedPreview: string;
}

export function ConfiguracionTicketPreview({
  nombreNegocio,
  canalPlantilla,
  renderedPreview,
}: ConfiguracionTicketPreviewProps) {
  return (
    <div className="lg:col-span-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-grape" />
          <span>Vista Previa del Cliente</span>
        </span>
        <PendingBadge label="Beta" tooltip="Envío automatizado en fase de pruebas" />
      </div>

      {/* Perforated ticket card with notch styling */}
      <div className="relative bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Ticket Header */}
        <div className="p-4 bg-surface-alt/70 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-grape text-white font-mono font-bold text-xs flex items-center justify-center">
              A
            </div>
            <span className="font-bricolage font-bold text-sm text-text-primary">
              {nombreNegocio || "Agendur"}
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-grape bg-grape-soft px-2 py-0.5 rounded-full">
            #TK-4820
          </span>
        </div>

        {/* Perforation line with circular cutout notches on edges (§5.6) */}
        <div className="relative py-2 px-4 flex items-center justify-center">
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border border-border" />
          <div className="w-full border-b border-dashed border-border" />
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border border-border" />
        </div>

        {/* WhatsApp / SMS Chat Bubble */}
        <div className="p-4 bg-surface space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-text-muted justify-center">
            <Clock className="w-3 h-3" />
            <span>Notificación Automática — 24h antes</span>
          </div>

          <div
            className={`rounded-xl p-3 text-xs leading-relaxed space-y-1.5 shadow-xs ${
              canalPlantilla === "whatsapp"
                ? "bg-mint-soft/30 dark:bg-mint-dark/15 border border-mint/25 text-text-primary"
                : "bg-surface-alt border border-border text-text-primary"
            }`}
          >
            <p className="whitespace-pre-wrap">{renderedPreview}</p>
            <div className="flex items-center justify-end gap-1 text-[10px] text-text-muted">
              <span className="font-mono">10:00</span>
              {canalPlantilla === "whatsapp" && (
                <CheckCheck className="w-3.5 h-3.5 text-mint-dark" />
              )}
            </div>
          </div>

          {/* Ticket Footer details */}
          <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <p className="text-text-muted">FECHA & HORA</p>
              <p className="font-bold text-text-primary">30 SEP · 16:00</p>
            </div>
            <div>
              <p className="text-text-muted">CANAL</p>
              <p className="font-bold text-grape uppercase">{canalPlantilla}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
