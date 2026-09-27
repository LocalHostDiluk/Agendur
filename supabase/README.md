# Supabase

schema.sql es el esquema canónico de Agendur. La única migración,
migrations/20260920071440_baseline.sql, contiene exactamente el mismo SQL.
Ambos archivos son idempotentes: sirven para una base nueva y para reconciliar
la base existente antes de registrar el baseline en el historial de Supabase.

## Contratos importantes

- perfiles_usuario.rol guarda el rol descriptivo elegido en el registro. No
  concede permisos; la autorización sigue dependiendo de negocios.owner_id.
- negocios.ciudad y negocios.sucursales_estimadas guardan los datos declarados
  durante el registro.
- El número real de sucursales no se duplica en negocios: se calcula desde
  sucursales, usando activa = true para consumo y límites del plan.
- Las reservas públicas se crean únicamente por la API del servidor con
  service_role; anon no tiene permisos sobre citas.

## Flujo local

    npx supabase@2.117.0 start
    npx supabase@2.117.0 db reset

## Base remota existente

No ejecutar db push hasta reconciliar el historial remoto, que actualmente no
contiene migraciones registradas. Revisar y aplicar primero el baseline
idempotente; después confirmar sus postcondiciones y registrar una sola versión.
