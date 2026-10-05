import { adminClient } from "@/lib/supabase/admin";

export async function asignarServiciosProfesional(negocioId: string, profesionalId: string, serviciosIds: unknown) {
  const negocio = { id: negocioId };

  let serviciosFinales: string[] = [];

  if (Array.isArray(serviciosIds)) {
    const incomingIds = serviciosIds.filter(
      (s): s is string => typeof s === "string",
    );

    // Validar que pertenezcan al negocio
    const { data: serviciosNegocio, error: servError } = await adminClient
      .from("servicios")
      .select("id")
      .eq("negocio_id", negocio.id)
      .in("id", incomingIds);

    if (servError) throw servError;

    serviciosFinales = (serviciosNegocio || []).map((s) => s.id);

    // Eliminar asignaciones actuales
    const { error: delError } = await adminClient
      .from("profesional_servicios")
      .delete()
      .eq("profesional_id", profesionalId);

    if (delError) throw delError;

    // Insertar nuevas asignaciones si existen
    if (serviciosFinales.length > 0) {
      const rows = serviciosFinales.map((sId) => ({
        profesional_id: profesionalId,
        servicio_id: sId,
      }));

      const { error: insertRelError } = await adminClient
        .from("profesional_servicios")
        .insert(rows);

      if (insertRelError) throw insertRelError;
    }
  } else {
    // Si no se pasaron serviciosIds, consultar los existentes para el response
    const { data: rels } = await adminClient
      .from("profesional_servicios")
      .select("servicio_id")
      .eq("profesional_id", profesionalId);

    serviciosFinales = (rels || []).map((r) => r.servicio_id);
  }

  return serviciosFinales;
}
