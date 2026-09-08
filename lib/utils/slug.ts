/**
 * Convierte un nombre comercial en un slug URL-friendly.
 * Ej: "Barber Club & Spa México" -> "barber-club-spa-mexico"
 */
export function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve acentos y diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remueve caracteres especiales
    .replace(/[\s_-]+/g, "-") // Reemplaza espacios y guiones bajos por guión
    .replace(/^-+|-+$/g, ""); // Remueve guiones al inicio o final
}

