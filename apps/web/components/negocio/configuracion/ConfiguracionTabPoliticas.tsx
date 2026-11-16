import { FileText, Phone, ShieldAlert } from "lucide-react";
import { ConfiguracionSwitchToggle } from "./ConfiguracionSwitchToggle";
import {
  ConfiguracionTabHorarios,
  type ConfiguracionTabHorariosProps,
} from "./ConfiguracionTabHorarios";

export interface ConfiguracionTabPoliticasProps extends ConfiguracionTabHorariosProps {
  hasContactMethod: boolean;
  telefonoRequerido: boolean;
  setTelefonoRequerido: (value: boolean) => void;
  emailRequerido: boolean;
  setEmailRequerido: (value: boolean) => void;
  notasHabilitadas: boolean;
  setNotasHabilitadas: (value: boolean) => void;
  politicaCancelacion: string;
  setPoliticaCancelacion: (value: string) => void;
}

export function ConfiguracionTabPoliticas({
  cobroAnticipo,
  setCobroAnticipo,
  porcentajeAnticipo,
  setPorcentajeAnticipo,
  anticipacionMinima,
  setAnticipacionMinima,
  anticipacionMaxima,
  setAnticipacionMaxima,
  hasContactMethod,
  telefonoRequerido,
  setTelefonoRequerido,
  emailRequerido,
  setEmailRequerido,
  notasHabilitadas,
  setNotasHabilitadas,
  politicaCancelacion,
  setPoliticaCancelacion,
}: ConfiguracionTabPoliticasProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ConfiguracionTabHorarios
        cobroAnticipo={cobroAnticipo}
        setCobroAnticipo={setCobroAnticipo}
        porcentajeAnticipo={porcentajeAnticipo}
        setPorcentajeAnticipo={setPorcentajeAnticipo}
        anticipacionMinima={anticipacionMinima}
        setAnticipacionMinima={setAnticipacionMinima}
        anticipacionMaxima={anticipacionMaxima}
        setAnticipacionMaxima={setAnticipacionMaxima}
      />

      {/* Customer Contact Requirements */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
            <Phone className="w-5 h-5 text-grape" />
            <span>Datos Requeridos al Cliente</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Define qué información es indispensable ingresar durante el
            proceso de reserva.
          </p>
        </div>

        {!hasContactMethod && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 flex items-center gap-3 text-xs text-danger"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>
              <strong>Atención:</strong> Se requiere al menos un medio de
              contacto (teléfono o correo electrónico) para poder
              notificar y confirmar reservas con tus clientes.
            </span>
          </div>
        )}

        <div className="divide-y divide-border">
          <ConfiguracionSwitchToggle
            id="telefonoRequerido"
            checked={telefonoRequerido}
            onChange={setTelefonoRequerido}
            label="Teléfono obligatorio"
            description="Requerido para enviar confirmaciones y recordatorios por WhatsApp y SMS."
          />

          <ConfiguracionSwitchToggle
            id="emailRequerido"
            checked={emailRequerido}
            onChange={setEmailRequerido}
            label="Correo electrónico obligatorio"
            description="Permite enviar recibos y enlaces directos para cancelar o reagendar."
          />

          <ConfiguracionSwitchToggle
            id="notasHabilitadas"
            checked={notasHabilitadas}
            onChange={setNotasHabilitadas}
            label="Permitir notas y comentarios del cliente"
            description="Habilita un campo opcional para que los clientes agreguen especificaciones previas a su turno."
          />
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-bricolage font-bold text-lg text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-grape" />
              <span>Política de Cancelación y Reembolsos</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Condiciones visibles para el cliente antes de confirmar su
              cita.
            </p>
          </div>
          <span className="font-mono text-xs text-text-secondary">
            {politicaCancelacion.length} / 2000
          </span>
        </div>

        <div className="space-y-1.5">
          <textarea
            rows={4}
            maxLength={2000}
            value={politicaCancelacion}
            onChange={(e) => setPoliticaCancelacion(e.target.value)}
            placeholder="Ejemplo: Las cancelaciones deben realizarse con al menos 24 horas de anticipación para solicitar reembolso de anticipo. Con menos de 24 horas, el depósito no será reembolsable..."
            className="w-full p-3.5 rounded-[var(--radius-sm)] bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-grape"
          />
          <p className="text-[11px] text-text-muted">
            Este texto se desplegará en el paso de confirmación y en los
            correos electrónicos de reserva.
          </p>
        </div>
      </div>
    </div>
  );
}
