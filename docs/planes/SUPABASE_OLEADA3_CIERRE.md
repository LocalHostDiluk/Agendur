# Supabase remoto — cierre de Oleada 3

Fecha: 29 de septiembre de 2026, America/Monterrey (30 de septiembre en el ledger UTC).
Proyecto: `dolpnpuycjfppflcqexe`. No se creó ni ejecutó otra base de datos.

## Aplicado en el remoto

Las versiones locales coinciden con el ledger remoto. El baseline no se volvió a ejecutar.

| Versión | Cambio |
| --- | --- |
| `20260930015253` | Colaboradores, vínculo profesional–Auth, ciclo de vida y RPC de baja transaccional |
| `20260930015324` | Matriz RLS y grants mínimos, incluidas restricciones de actualización por columna |
| `20260930015410` | Escritura de logos exclusiva del propietario; avatars para propietario y gerente |
| `20260930020437` | Campos aditivos de onboarding compatibles con el registro existente |
| `20260930020452` | Políticas operativas sin SELECT duplicado e índices de claves foráneas |

## Contrato vigente

- Propietario: administración del negocio, personal, configuración y facturación.
- Gerente: operación en todas las sedes; no cambia identidades, roles, configuración comercial ni facturación.
- Recepcionista: citas de su sede y clientes asociados a esas citas; sin acceso a otras sedes.
- Profesional: lectura de sus citas; un usuario vinculado a varias sedes conserva acceso a todos sus registros profesionales del negocio.
- El backend con `service_role` valida rol, negocio y sede explícitamente. RLS protege el acceso directo autenticado; `anon` no tiene grants de tablas ni columnas en `public`.
- Las claves de negocio/identidad y los snapshots de citas no son actualizables desde clientes autenticados. Se conservan registros históricos mediante desactivación, no borrado de entidades principales.
- El directorio `/personal` usa datos persistidos y horarios reales. No crea colaboradores sólo en memoria. El propietario agrega cuentas ya registradas, vincula profesionales y cambia rol/sede/estado con validación del backend.
- `POST /api/auth/business` guarda una selección de negocio que se revalida en cada operación. No concede acceso por el contenido de la cookie.

La baja exige mismo origen y confirmación exacta del correo autenticado. Inventaría **todos** los negocios del propietario, cancela sus suscripciones externas antes de mutar Supabase y cierra sus sesiones. La RPC, ejecutable únicamente por `service_role`, vuelve a comprobar el inventario y el timestamp de desactivación dentro de la transacción; anonimiza el profesional vinculado, elimina la identidad Auth y retira ownership personal de Storage sin borrar los archivos. Los negocios quedan sin propietario y desactivados; se conservan citas, suscripciones y archivos. Una respuesta ambigua se reconcilia o compensa sin asumir éxito.

La creación de perfiles ya no escribe un `rol` inexistente ni utiliza el rol declarado en el registro como autorización. La autorización proviene del vínculo real con el negocio. Catálogo, suscripciones y Stripe ya existían: se integraron sus permisos y el ciclo de baja, sin inventar otra pasarela ni duplicar sus tablas.

## Verificación

- Matriz SQL ejecutada contra el remoto, con `ROLLBACK`: propietario, gerente, recepción, profesional, cruces de negocio/sede, escalamiento de permisos y conservación del negocio al eliminar Auth.
- Recorrido real mediante la aplicación contra el mismo Supabase: **82 comprobaciones aprobadas** en la última ejecución documentada. Incluyó altas/cambios de colaboradores, desactivación y reactivación, profesional multi-sede, selección de negocio, Storage permitido/denegado, perfil, baja del propietario con dos negocios, conservación del historial y rechazo del acceso con el JWT anterior del propietario eliminado.
- Chrome aislado: propietario, gerente y profesional; formulario funcional, sin errores de ejecución y sin desbordamiento horizontal a 320, 768, 1024 y 1440 px. Se corrigió la cabecera que desbordaba en tablet.
- Suite enfocada: **126 aprobadas, 0 fallidas**, en 11 archivos. TypeScript y generación de tipos de rutas aprobados.
- Suite general: **329 aprobadas, 3 fallidas**. Persisten dos expectativas de `agendas.test.tsx` y la expectativa antigua `font-bricolage` del logo en `shell.test.ts`; el logo ya usaba `brand-mark` en HEAD antes de estos cambios. No se alteraron esas expectativas para aparentar una suite verde.
- Los fixtures `wave3-check-*` se limpiaron. Conteos originales conservados: 7 usuarios, 4 negocios, 5 sedes, 1 profesional, 4 suscripciones; 0 citas, clientes, colaboradores y objetos de Storage temporales al finalizar.
- Revisión independiente por subagente: sin bloqueantes de seguridad/correctitud en los cambios revisados.

## Respaldos y corrección hacia adelante

Hay cinco respaldos lógicos JSON de esquema y datos, uno antes de cada migración, en `/home/sebastian/Descargas/citas-wave3-backup.uSOvbc/`. Son legibles y verificados, fuera de Git: directorio privado y archivos con permiso `600`. **Contienen datos sensibles de Auth**. No son un `pg_dump` ni una restauración integral ensayada.

No ejecutar resets ni volver a aplicar el baseline. Corregir mediante una migración nueva, con inventario y respaldo previos. No retirar campos de compatibilidad ni reconstruir propietarios automáticamente: un negocio sin propietario requiere revisión explícita. Una cancelación ya realizada en Stripe no se revierte compensando columnas en Supabase.

## Límites de esta entrega

- El código está integrado en el checkout; no se hizo commit, push ni despliegue de Next.js a un proveedor externo.
- Asesor de seguridad: sin errores críticos nuevos. Persiste el WARN previo de [protección de contraseñas filtradas deshabilitada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). `stripe_webhook_events` permanece deliberadamente sin policies de cliente y accesible sólo al servidor.
- Asesor de rendimiento: sin WARN; sólo índices aún sin uso, normales con tablas vacías y un respaldo histórico. No se eliminaron índices de integridad por falta de uso reciente.
- Se probaron las reglas de facturación y fallos/compensaciones con pruebas controladas. No se creó, cobró ni canceló una suscripción real en Stripe; las suscripciones existentes del remoto son manuales. La validación del proveedor externo no se declara completada.

## Repetir las comprobaciones

Desde `apps/web`, iniciar un servidor de aplicación nuevo en `http://localhost:3000` que use `.env.local` y el proyecto indicado. La repetición inmediata consume los límites reales de login y baja: no deshabilitarlos para la aplicación.

```sh
WAVE3_REMOTE_PROJECT=dolpnpuycjfppflcqexe WAVE3_APP_ORIGIN=http://localhost:3000 WAVE3_BROWSER=1 bun --env-file=.env.local scripts/verify-wave3-remote.ts
bunx next typegen
bunx tsc --noEmit
bun test
```

El script exige autorización explícita del proyecto, crea fixtures reconocibles y ejecuta limpieza en `finally`. El navegador usa un perfil aislado. La matriz SQL está en `supabase/tests/wave3_role_matrix_rollback.sql`; debe ejecutarse completa en una sola sesión, nunca quitando su `ROLLBACK`.
