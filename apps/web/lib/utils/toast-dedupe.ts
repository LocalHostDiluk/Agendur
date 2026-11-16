import { sileo, type SileoOptions } from "sileo";

/** Helper conciso para instanciar notificaciones con botón de cierre funcional */
export function dispatchSileoToast(
  fn: (opts: SileoOptions) => string,
  title: string,
  description?: string,
  options?: Partial<SileoOptions>,
  alwaysShowDismiss = false,
): string {
  let toastId = "";
  const button =
    options?.button ??
    (alwaysShowDismiss || description
      ? {
          title: "Cerrar",
          onClick: () => {
            if (toastId) sileo.dismiss(toastId);
            else sileo.clear();
          },
        }
      : undefined);

  toastId = fn({
    title,
    description,
    ...(button ? { button } : {}),
    ...options,
  });
  return toastId;
}
