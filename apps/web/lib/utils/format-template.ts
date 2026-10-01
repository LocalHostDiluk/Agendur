/**
 * Sustituye placeholders tipo `{clave}` en una plantilla por su valor en `vars`.
 */
export function previewRenderedText(
  template: string,
  vars: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}
