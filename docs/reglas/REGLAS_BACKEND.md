# Reglas de construcción — Backend (`apps/web` y Supabase)

Obligatorias para código nuevo o modificado del servidor. La deuda existente se
registra en el [inventario backend](../INVENTARIO_BACKEND.md) y se reduce por dominio.
Estas reglas complementan las [reglas frontend](REGLAS_FRONTEND.md); SQL, pruebas
y documentación no reciben límites artificiales de líneas.

## 0. Antes de escribir código

1. Lee estas reglas, el [documento canónico](../BACKEND_SUPABASE.md), el inventario
   y las instrucciones aplicables del repositorio. La petición del usuario determina
   el alcance autorizado; no ampliar una reorganización a correcciones funcionales.
2. Si existe `.codegraph/`, consulta CodeGraph antes de buscar o leer código.
   Después usa `rg`/`rg --files` para completar búsquedas no cubiertas por el grafo.
3. Traza entrada HTTP, operación, persistencia, consumidores, imports dinámicos,
   mocks y pruebas. Buscar sólo el endpoint nombrado no demuestra el recorrido.
4. Consulta documentación de la versión instalada. Para dudas del proveedor usa
   Context7, la skill/MCP correspondiente o fuentes oficiales; no actualices
   dependencias sólo por existir una versión más reciente.
5. Registra baseline de esta ejecución y checkout limpio. No hacer stash, reset
   ni sobrescribir trabajo previo. Un único escritor por checkout compartido.

## 1. Tamaños y revisión

| Unidad | Objetivo máximo de líneas |
|---|---:|
| `app/api/**/route.ts` | 150 |
| Módulo interno del backend | 250 |
| Función | 60 |

- Son objetivos de diseño. Superarlos exige revisión y justificación explícita
  en la entrega: responsabilidad indivisible, riesgo de fragmentación y reducción
  prevista cuando exista una extracción coherente.
- No partir una transacción, validación o flujo de compensación para cumplir un
  número. Tampoco introducir capas que sólo reenvían argumentos.
- Archivos existentes largos se inventarían como deuda. Se caracterizan y reducen
  por dominio; no se reescribe masivamente el backend ni se ocultan excepciones.
- Rutas pequeñas expresan contrato HTTP, autorización de petición y respuesta.
  Extraer validación u operación cuando tengan complejidad o responsabilidad real.

## 2. Buscar y reutilizar antes de crear

1. Busca la responsabilidad, sus callers y pruebas; lee el equivalente existente.
2. Reutiliza helper, validador, tipo, cliente o patrón antes de añadir uno nuevo.
3. Prioriza biblioteca estándar, plataforma y dependencias ya instaladas.
4. Usa nombres concretos: `crear-reserva.ts`, `disponibilidad.ts` o
   `asignar-servicios.ts` según la responsabilidad realmente extraída. Funciones
   expresan verbo y objeto; copia la convención local cuando ya exista.
5. No crear nuevos `helpers.ts`, `common.ts`, `utils.ts`, factories, repositorios
   genéricos, interfaces de una implementación ni configuraciones especulativas.
6. No agregar dependencias ni un sistema de validación de arquitectura para
   aplicar estas reglas. Una búsqueda y las verificaciones existentes bastan.

| Necesidad | Reutilizar |
|---|---|
| Capacidad y alcance de negocio | `lib/auth/negocio-access.ts` |
| Respuesta HTTP y error observado | `lib/utils/api-error.ts` |
| Fecha de calendario y día local | `lib/utils/business-date.ts` |
| Horario semanal puro | `lib/schedules/professional.ts` |
| Tipos compartidos | `lib/types/index.ts` |
| SSR, browser y administración Supabase | Sus clientes en `lib/supabase/` según frontera |
| Suscripción y planes | `lib/payments/guards.ts`, `plans.ts` y adaptador existente |
| Rate limit y Turnstile | `lib/security/` |

## 3. Dónde va cada responsabilidad

| Responsabilidad | Ubicación |
|---|---|
| URL, método, petición, cookies y respuesta HTTP | `app/api/**/route.ts`; conservar ubicación |
| Reservas y disponibilidad | `lib/backend/reservas/`: cálculo puro, consulta y creación extraídos en B |
| Sucursales | `lib/backend/sucursales/`, al extraer durante C |
| Profesionales y asignaciones | `lib/backend/profesionales/`, al extraer durante C |
| Colaboradores | `lib/backend/personal/`, al extraer durante C |
| Servicios y configuración | Carpetas concretas del dominio en `lib/backend/`, si hace falta |
| Alta y baja de cuentas | `lib/backend/auth/`, sólo para operaciones extensas extraídas |
| WhatsApp simulado existente | `lib/backend/notificaciones/`, durante D |
| Autorización y capacidades | Mantener `lib/auth/` |
| Planes, pagos y adaptadores | Mantener `lib/payments/` |
| Supabase, seguridad, Realtime e instrumentación | Mantener ubicaciones coherentes actuales |
| Validadores puros y tipos usados por cliente | Mantener fuera de módulos exclusivos servidor |

Este mapa es destino de las tareas siguientes, no afirmación de carpetas ya creadas.
Sólo crear una carpeta cuando aloje una responsabilidad existente que necesita
extracción. Sin carpetas vacías ni capa de servicios adicional.
Los hooks, componentes y pantallas siguen en frontend; modificar únicamente sus
imports cuando un movimiento autorizado del backend lo requiera.

## 4. Contratos, validación y errores

- Mantener URLs, métodos, status, respuestas, aliases, cookies, permisos y efectos
  durante reorganización. Registrar una corrección funcional en tarea separada.
- Tipos explícitos; entradas externas como `unknown`, comprobando objeto, campos,
  formatos y límites antes de persistir. No sustituir validación por cast, `any`
  o `@ts-ignore`; compartir validadores puros cuando frontend también los usa.
- Comprobar errores de cada consulta y el resultado esperado. Una lista vacía
  real no equivale a consulta fallida; 201 no acredita escrituras que fallaron.
- Errores esperados conservan su contrato; fallos internos pasan por la frontera
  común. No exponer detalles técnicos ni duplicar eventos Sentry por cada capa.
- Operaciones multiescritura que conservan integridad deben ser atómicas en DB.
  Para Auth/proveedores externos, comprobar compensación y resultados ambiguos;
  no prometer atomicidad distribuida que no existe.

## 5. Autorización y frontera servidor/cliente

- Toda consulta privilegiada exige autenticación/capacidad cuando corresponda,
  negocio y alcance explícitos de sede/profesional. Catálogo público exige su
  selección y proyección deliberada; no ampliar acceso porque use `service_role`.
- `service_role` omite RLS. RLS restringe filas y grants restringen operaciones y
  columnas: ninguno reemplaza al otro ni a comprobaciones del servidor. Ver
  [RLS oficial](https://supabase.com/docs/guides/database/postgres/row-level-security).
- No autorizar por `user_metadata`, campos del formulario o cookie sin membresía.
- Secretos y clientes administrativos nunca llegarán a hooks/componentes por
  imports directos, reexports o cadenas transitivas; variables públicas no contienen
  claves privadas. Cliente browser y SSR mantienen responsabilidades distintas.
- No mover parser/tipo compartido a módulo que importe admin, secretos o servidor.
- Funciones SQL privilegiadas necesitan ámbito, `search_path`, grants y revisión
  explícitos. No añadir `SECURITY DEFINER` como arreglo automático de permisos.
- Logs sin credenciales, tokens, bodies de reserva ni datos personales innecesarios.
  Usar contexto e identificadores mínimos para diagnosticar el fallo.

## 6. Migraciones y remoto

- Baseline y migraciones aplicadas son inmutables. Cambio SQL posterior requiere
  migración nueva, respaldo fuera de Git, pre/postcondiciones, ledger, advisors y
  pruebas de aislamiento según el procedimiento del documento canónico.
- Sólo Supabase de desarrollo como DB. Movimientos mecánicos no crean migraciones
  ni modifican datos; distinguir SQL local de estado remoto observado.
- Reutilizar recorrido remoto existente cuando cambie un flujo funcional: sin
  navegador, una ejecución a la vez, fixtures identificables y limpieza comprobada.
- Revisar cambios relevantes del proveedor antes de actuar. No cambiar herramientas,
  providers, contratos, políticas de historial o eliminación durante extracción.
- Días sin horario, permisos de gestión, transiciones de citas y devolución de
  anticipos requieren pausa explícita de producto antes de su implementación.

## 7. Pruebas y entrega

- Pruebas proporcionales al riesgo: una comprobación focal que falle si se rompe
  lógica no trivial, contratos negativos y aislamiento en caminos de seguridad/dinero.
  Reutilizar framework y tests existentes; no añadir suites que reflejen cada línea.
- No rebajar expectativas ni retocar pruebas anteriores sólo para obtener verde.
  Separar mocks/controlado, remoto, proveedor real y fallos preexistentes.
- Después de subtarea: pruebas focales, imports estáticos/dinámicos y mocks,
  frontera cliente/servidor, `bunx tsc --noEmit`, lint de archivos tocados y
  `git diff --check`. En `apps/web` no existe script `typecheck`.
- Antes del push: `bun test`, TypeScript con tipos Next actuales, `bun run lint`,
  `bun run build`, revisión independiente y documentos actualizados. Fallo nuevo
  no aceptado; registrar exactamente cualquier baseline fallida y el alcance.
- Cada tarea grande parte de `main` actualizado en rama `codex/`; subagentes
  realizan cambios/checks/Git. Tras commit y push, pausa hasta merge humano
  comprobado en `main`; no comenzar la siguiente rama anticipadamente.

Checklist de entrega:

- [ ] Busqué: símbolos, términos, CodeGraph, carpetas y todos los consumidores.
- [ ] Reutilicé: módulos, validadores, tipos y dependencias concretos.
- [ ] Cambié/creé: archivos y responsabilidad existente que lo justifica.
- [ ] Medí: líneas de ruta/módulo/función; revisión y justificación de excesos.
- [ ] Verifiqué: contratos, permisos, imports/reexports/dinámicos/mocks y frontera.
- [ ] Probé: comandos/resultados actuales, warnings/errores y baseline por separado.
- [ ] Documenté: mapa, backlog funcional y decisiones pendientes sin afirmar fixes.
- [ ] Revisé independientemente y comprobé limpieza remota si hubo fixtures.
- [ ] Publiqué rama y pausé hasta merge, con pendientes siguientes explícitos.
