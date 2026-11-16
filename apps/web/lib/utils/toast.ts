import { sileo, type SileoOptions } from "sileo";
import { getHumanErrorMessage } from "./toast-config";
import { dispatchSileoToast } from "./toast-dedupe";

export { getHumanErrorMessage };

/**
 * API unificada de notificaciones Sileo:
 * Errores humanizados, alertas, tips informativos, confirmaciones de éxito y acciones.
 */
export const notify = {
  /** Notificación de error con traducción automática a lenguaje humano y botón de cierre */
  error(
    error: unknown,
    fallbackDescription?: string,
    options?: Partial<SileoOptions>,
  ) {
    const { title, description } = getHumanErrorMessage(
      error,
      fallbackDescription,
    );
    return dispatchSileoToast(sileo.error, title, description, options, true);
  },

  /** Alerta de advertencia para validaciones o límites con botón de cierre */
  warning(
    title: string,
    description?: string,
    options?: Partial<SileoOptions>,
  ) {
    return dispatchSileoToast(sileo.warning, title, description, options);
  },

  /** Tips, avisos o información relevante del sistema */
  info(title: string, description?: string, options?: Partial<SileoOptions>) {
    return dispatchSileoToast(sileo.info, title, description, options);
  },

  /** Confirmación de operaciones exitosas */
  success(
    title: string,
    description?: string,
    options?: Partial<SileoOptions>,
  ) {
    return dispatchSileoToast(sileo.success, title, description, options);
  },

  /** Notificación interactiva con botón de acción */
  action(
    title: string,
    description: string,
    button: { title: string; onClick: () => void },
    options?: Partial<SileoOptions>,
  ) {
    return sileo.action({
      title,
      description,
      button,
      ...options,
    });
  },

  /** Notificación encadenada a una promesa asíncrona */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    options: {
      loading: SileoOptions;
      success: SileoOptions | ((data: T) => SileoOptions);
      error: SileoOptions | ((err: unknown) => SileoOptions);
    },
  ) {
    return sileo.promise(promise, options);
  },

  /** Cerrar notificación manualmente por ID */
  dismiss(id: string) {
    sileo.dismiss(id);
  },

  /** Limpiar todas las notificaciones */
  clear() {
    sileo.clear();
  },
};
