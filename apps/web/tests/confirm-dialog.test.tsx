import { describe, it, expect } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ConfirmDialog, ACTION_CONFIGS } from "@/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";

describe("Sistema de Diálogos de Confirmación de 2 Niveles", () => {
  describe("1. Clasificación y Accesibilidad General", () => {
    it("retorna null si isOpen=false", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={false}
          type="logout"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toBe("");
    });

    it("cumple atributos accesibles de diálogo (role=alertdialog, aria-modal=true)", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="logout"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain('role="alertdialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain("aria-labelledby=");
      expect(html).toContain("aria-describedby=");
    });

    it("cumple especificación de backdrop: bg-black/60 y backdrop-blur-xs", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="logout"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("bg-black/60");
      expect(html).toContain("backdrop-blur-xs");
    });

    it("REGLA D.3: El foco inicial SIEMPRE va en el botón Cancelar (autoFocus en Cancelar, NUNCA en botón confirm)", () => {
      const htmlNivel1 = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="logout"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      // El botón cancelar tiene autoFocus
      const buttonsNivel1 = htmlNivel1.match(/<button[\s\S]*?<\/button>/gi) || [];
      expect(buttonsNivel1.length).toBe(2);
      expect(buttonsNivel1[0]).toContain("autofocus");
      expect(buttonsNivel1[0]).toContain("Cancelar");
      expect(buttonsNivel1[1]).not.toContain("autofocus");

      const htmlNivel2 = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_sucursal"
          targetName="Sucursal Norte"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      const buttonsNivel2 = htmlNivel2.match(/<button[\s\S]*?<\/button>/gi) || [];
      expect(buttonsNivel2.length).toBe(2);
      // El botón cancelar en Nivel 2 tiene autoFocus
      expect(buttonsNivel2[0]).toContain("autofocus");
      expect(buttonsNivel2[0]).toContain("Cancelar");

      // El botón destructivo de confirmar NO tiene autoFocus
      expect(buttonsNivel2[1]).not.toContain("autofocus");
      expect(buttonsNivel2[1]).toContain("Eliminar sucursal");
    });
  });

  describe("2. Nivel 1 — Confirmación Simple (max-width: 400px)", () => {
    it("aplica clase max-w-[400px] en Nivel 1", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="logout"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("max-w-[400px]");
      expect(html).not.toContain("border-t-[3px]");
    });

    it("acción 'logout': copy exacto ES y EN, botón en --grape", () => {
      const htmlES = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="logout"
          locale="es"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(htmlES).toContain("¿Ya te vas?");
      expect(htmlES).toContain("Vas a cerrar tu sesión. Puedes volver cuando quieras.");
      expect(htmlES).toContain("Cerrar sesión");
      expect(htmlES).toContain("Cancelar");
      expect(htmlES).toContain("bg-[var(--grape)]");

      const htmlEN = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="logout"
          locale="en"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(htmlEN).toContain("Heading out?");
      expect(htmlEN).toContain("You&#x27;re about to log out. Come back anytime.");
      expect(htmlEN).toContain("Log out");
      expect(htmlEN).toContain("Cancel");
    });

    it("acción 'cancelar_cita': ícono en --danger, copy exacto, botón en --danger", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="cancelar_cita"
          locale="es"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("¿Cancelar esta cita?");
      expect(html).toContain("Le avisaremos al cliente por WhatsApp que su cita fue cancelada.");
      expect(html).toContain("Sí, cancelar cita");
      expect(html).toContain("Cancelar");
      expect(html).toContain("bg-[var(--danger-soft)]");
      expect(html).toContain("bg-[var(--danger)]");
    });

    it("acción 'descartar_cambios': botón 'Seguir editando' (foco inicial) y 'Descartar cambios' (texto --danger, sin fondo)", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="descartar_cambios"
          locale="es"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("Tienes cambios sin guardar");
      expect(html).toContain("Si sales ahora, vas a perder lo que modificaste.");
      expect(html).toContain("Seguir editando");
      expect(html).toContain("Descartar cambios");
      expect(html).toContain("text-[var(--danger)]");
      expect(html).toContain("bg-transparent");
    });
  });

  describe("3. Nivel 2 — Confirmación Crítica (max-width: 460px)", () => {
    it("aplica max-w-[460px] y borde superior sólido de 3px en --danger", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_sucursal"
          targetName="Sucursal Roma"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("max-w-[460px]");
      expect(html).toContain("border-t-[3px]");
      expect(html).toContain("border-t-[var(--danger)]");
    });

    it("REGLA D.2: botón de confirmar Nivel 2 admite la clase .btn-ticket", () => {
      const htmlWithTicket = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_sucursal"
          targetName="Sucursal Roma"
          useTicketButton={true}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(htmlWithTicket).toContain("btn-ticket");

      const htmlWithoutTicket = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_sucursal"
          targetName="Sucursal Roma"
          useTicketButton={false}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(htmlWithoutTicket).not.toContain("btn-ticket");
    });

    it("lista consecuencias específicas en bullets (ul con list-disc)", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_sucursal"
          targetName="Sucursal Roma"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("list-disc");
      expect(html).toContain("Se cancelarán todas las citas futuras de esta sucursal");
      expect(html).toContain("El personal asignado perderá acceso a este panel");
      expect(html).toContain("No podrás recuperar el historial de esta sucursal");
    });

    it("acción 'eliminar_sucursal': título sobrio, consecuencias e input de confirmación con botón deshabilitado", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_sucursal"
          targetName="Sucursal Chapultepec"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("Vas a eliminar Sucursal Chapultepec");
      expect(html).toContain("Escribe el nombre de la sucursal para confirmar");
      expect(html).toContain("Eliminar sucursal");
      // El botón de confirmación está deshabilitado mientras no coincida el texto
      expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Eliminar sucursal[\s\S]*?<\/button>/);
    });

    it("acción 'eliminar_servicio': copy exacto y consecuencias", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_servicio"
          targetName="Corte Ejecutivo"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("Vas a eliminar Corte Ejecutivo");
      expect(html).toContain("Las citas futuras con este servicio deberán reasignarse manualmente");
      expect(html).toContain("Los clientes ya no podrán reservarlo en tu portal público");
      expect(html).toContain("Eliminar servicio");
    });

    it("acción 'eliminar_personal': copy exacto y consecuencias", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_personal"
          targetName="Mariana Ruiz"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("Vas a eliminar a Mariana Ruiz del equipo");
      expect(html).toContain("Perderá acceso inmediato al panel");
      expect(html).toContain("Sus citas futuras deberán reasignarse a otro miembro del equipo");
      expect(html).toContain("Eliminar del equipo");
    });

    it("acción 'eliminar_cuenta': pide nombre del negocio (NUNCA palabra genérica 'ELIMINAR') y consecuencias completas", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="eliminar_cuenta"
          targetName="Barbería Imperial"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("Vas a eliminar tu cuenta de Barbería Imperial");
      expect(html).toContain("Escribe el nombre completo de tu negocio para confirmar");
      expect(html).not.toContain("Escribe ELIMINAR");
      expect(html).toContain("Se eliminarán todas tus sucursales, servicios y el historial completo de citas");
      expect(html).toContain("Tu portal de reservas dejará de funcionar de inmediato");
      expect(html).toContain("Esta acción no se puede deshacer");
      expect(html).toContain("Eliminar mi cuenta");
    });

    it("acción 'cancelar_suscripcion': reversible, SIN campo de texto, botones Seguir con mi plan / Cancelar plan", () => {
      const html = renderToStaticMarkup(
        <ConfirmDialog
          isOpen={true}
          type="cancelar_suscripcion"
          targetName="Pro"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(html).toContain("Vas a cancelar tu plan Pro");
      expect(html).toContain("Perderás acceso a gestión multi-sucursal y pagos en línea");
      expect(html).toContain("Tu cuenta pasará al plan gratuito al finalizar el periodo actual");
      expect(html).toContain("Seguir con mi plan");
      expect(html).toContain("Cancelar plan");
      // NO debe tener campo de input
      expect(html).not.toContain("<input");
      // El botón de cancelar plan NO está deshabilitado por texto
      expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Cancelar plan[\s\S]*?<\/button>/);
    });
  });

  describe("4. Hook useConfirmDialog", () => {
    function HookConsumer({
      onHookReady,
    }: {
      onHookReady: (api: ReturnType<typeof useConfirmDialog>) => void;
    }) {
      const api = useConfirmDialog();
      onHookReady(api);
      return <ConfirmDialog {...api.dialogProps} />;
    }

    it("provee estado inicial isOpen=false y dialogProps correctos", () => {
      let hookApi!: ReturnType<typeof useConfirmDialog>;
      const html = renderToStaticMarkup(
        <HookConsumer
          onHookReady={(api) => {
            hookApi = api;
          }}
        />
      );
      expect(html).toBe("");
      expect(hookApi.isOpen).toBe(false);
      expect(typeof hookApi.confirm).toBe("function");
      expect(typeof hookApi.close).toBe("function");
      expect(typeof hookApi.cancel).toBe("function");
    });

    it("soporta invocación imperativa retornando una promesa que resuelve boolean", async () => {
      let hookApi!: ReturnType<typeof useConfirmDialog>;
      function Harness() {
        hookApi = useConfirmDialog();
        return null;
      }
      renderToStaticMarkup(<Harness />);

      // Iniciar confirmación imperativa
      const confirmPromise = hookApi.confirm({
        type: "cancelar_cita",
      });

      expect(hookApi.isOpen).toBe(true);
      expect(hookApi.dialogProps.type).toBe("cancelar_cita");

      // Simular confirmar
      hookApi.dialogProps.onConfirm();
      const result = await confirmPromise;
      expect(result).toBe(true);
      expect(hookApi.isOpen).toBe(false);
    });

    it("resuelve false cuando se cancela la confirmación", async () => {
      let hookApi!: ReturnType<typeof useConfirmDialog>;
      function Harness() {
        hookApi = useConfirmDialog();
        return null;
      }
      renderToStaticMarkup(<Harness />);

      const confirmPromise = hookApi.confirm("logout");
      expect(hookApi.isOpen).toBe(true);

      hookApi.dialogProps.onCancel();
      const result = await confirmPromise;
      expect(result).toBe(false);
      expect(hookApi.isOpen).toBe(false);
    });
  });

  describe("5. Diccionario ACTION_CONFIGS", () => {
    it("cubre exactamente las 8 acciones requeridas por la especificación", () => {
      const keys = Object.keys(ACTION_CONFIGS);
      expect(keys).toContain("logout");
      expect(keys).toContain("cancelar_cita");
      expect(keys).toContain("descartar_cambios");
      expect(keys).toContain("eliminar_sucursal");
      expect(keys).toContain("eliminar_servicio");
      expect(keys).toContain("eliminar_personal");
      expect(keys).toContain("eliminar_cuenta");
      expect(keys).toContain("cancelar_suscripcion");
      expect(keys.length).toBe(8);
    });
  });
});
