import { Globe, Check, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui";

interface ConfiguracionPortalCardProps {
  slug?: string;
  copied: boolean;
  onCopyLink: () => void;
}

export function ConfiguracionPortalCard({
  slug,
  copied,
  onCopyLink,
}: ConfiguracionPortalCardProps) {
  return (
    <div className="bg-surface-alt border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-grape" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Portal Público de Clientes
          </span>
        </div>
        <Badge variant="success" size="sm" dot>
          En Línea
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface border border-border rounded-xl">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-xs text-text-secondary font-mono select-none">
            agendur.com/reserva/
          </span>
          <span className="text-xs font-mono font-bold text-grape truncate">
            {slug || "mi-negocio"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCopyLink}
            className="px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium bg-surface-alt hover:bg-border/60 text-text-primary border border-border transition-colors flex items-center gap-1.5 min-h-[36px]"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copiado" : "Copiar enlace"}</span>
          </button>
          <a
            href={`/reserva/${slug || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium bg-grape-soft hover:bg-grape-soft/80 text-grape transition-colors flex items-center gap-1.5 min-h-[36px]"
          >
            <span>Abrir portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <p className="text-xs text-text-secondary">
        Este es el enlace directo a tu catálogo de citas para compartir
        por WhatsApp, Instagram y redes sociales. El identificador permanente
        garantiza que tus clientes siempre encuentren tu negocio.
      </p>
    </div>
  );
}
