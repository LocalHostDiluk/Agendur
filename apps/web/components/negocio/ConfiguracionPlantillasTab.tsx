import { MessageSquare, Send, Smartphone } from "lucide-react";
import { PendingBadge } from "@/components/ui";
import { ConfiguracionTicketPreview } from "./ConfiguracionTicketPreview";

export interface ConfiguracionPlantillasTabProps {
  canalPlantilla: "whatsapp" | "sms"; onCanalPlantillaChange: (canal: "whatsapp" | "sms") => void;
  tipoPlantilla: "recordatorio" | "confirmacion" | "cancelacion"; onTipoPlantillaChange: (tipo: "recordatorio" | "confirmacion" | "cancelacion") => void;
  plantillaWhatsApp: string; onPlantillaWhatsAppChange: (value: string) => void;
  plantillaSMS: string; onPlantillaSMSChange: (value: string) => void;
  onInsertVariable: (varName: string) => void;
  nombreNegocio: string;
  renderedPreview: string;
}

const VARIABLES_PLANTILLA = [
  { key: "{cliente}", label: "Nombre Cliente" }, { key: "{servicio}", label: "Servicio" },
  { key: "{fecha}", label: "Fecha" }, { key: "{hora}", label: "Hora" },
  { key: "{profesional}", label: "Profesional" }, { key: "{sucursal}", label: "Sucursal" },
  { key: "{negocio}", label: "Negocio" }, { key: "{enlace_gestion}", label: "Enlace Gestión" },
];

const MOMENTOS_ENVIO = [
  { id: "recordatorio", label: "Recordatorio 24h antes" }, { id: "confirmacion", label: "Confirmación inmediata" }, { id: "cancelacion", label: "Cancelación o Reagendamiento" },
] as const;

export function ConfiguracionPlantillasTab({
  canalPlantilla, onCanalPlantillaChange, tipoPlantilla, onTipoPlantillaChange,
  plantillaWhatsApp, onPlantillaWhatsAppChange, plantillaSMS, onPlantillaSMSChange,
  onInsertVariable, nombreNegocio, renderedPreview,
}: ConfiguracionPlantillasTabProps) {
  const activeTemplateText = canalPlantilla === "whatsapp" ? plantillaWhatsApp : plantillaSMS;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Header with Beta Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-grape" />
              <h2 className="font-bricolage font-bold text-lg text-text-primary">
                Plantillas de Notificaciones
              </h2>
              <PendingBadge label="Beta" tooltip="Envío automatizado en fase de pruebas" />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Personaliza los mensajes directos que tus clientes reciben por WhatsApp y SMS para reducir ausencias.
            </p>
          </div>

          {/* Channel Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-alt border border-border rounded-xl">
            <button
              type="button"
              onClick={() => onCanalPlantillaChange("whatsapp")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${canalPlantilla === "whatsapp" ? "bg-grape text-white shadow-xs" : "text-text-secondary hover:text-text-primary"}`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => onCanalPlantillaChange("sms")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${canalPlantilla === "sms" ? "bg-grape text-white shadow-xs" : "text-text-secondary hover:text-text-primary"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS</span>
            </button>
          </div>
        </div>

        {/* Template Selection Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-text-secondary mr-1">Momento de envío:</span>
          {MOMENTOS_ENVIO.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTipoPlantillaChange(item.id)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${tipoPlantilla === item.id ? "bg-grape text-white shadow-xs" : "bg-surface-alt border border-border text-text-secondary hover:text-text-primary"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Grid: Editor + Ticket Preview (§5.6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Template Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="templateText" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Contenido del Mensaje
                </label>
                <span className="font-mono text-xs text-text-secondary">
                  {activeTemplateText.length} caracteres
                </span>
              </div>

              <textarea
                id="templateText"
                rows={6}
                value={canalPlantilla === "whatsapp" ? plantillaWhatsApp : plantillaSMS}
                onChange={(e) => {
                  if (canalPlantilla === "whatsapp") onPlantillaWhatsAppChange(e.target.value);
                  else onPlantillaSMSChange(e.target.value);
                }}
                className="w-full p-3.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-grape font-sans leading-relaxed"
              />
            </div>

            {/* Variables pills */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary">
                Haz clic para insertar variables dinámicas:
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {VARIABLES_PLANTILLA.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => onInsertVariable(v.key)}
                    className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-surface-alt border border-border text-[11px] font-mono font-medium text-grape hover:bg-grape-soft transition-colors select-none"
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Perforated Ticket Preview (§5.6) */}
          <ConfiguracionTicketPreview
            nombreNegocio={nombreNegocio}
            canalPlantilla={canalPlantilla}
            renderedPreview={renderedPreview}
          />
        </div>
      </div>
    </div>
  );
}
