# Task List: Agendur — Unificación de Estilos de Carga

## Fase 1: Unificación del Portal de Reservas

### Task 1.1: Route Loading en Portal de Reservas

**Description:** Crear `app/(cliente)/reserva/[negocioSlug]/loading.tsx` para que Next.js renderice `<PortalSkeletons />` durante streaming.
**Acceptance criteria:**

- [x] `app/(cliente)/reserva/[negocioSlug]/loading.tsx` renderiza `<PortalSkeletons />`.
      **Verification:**
- [x] `bun run build`

### Task 1.2: Reemplazo de Spinner en `BookingPortal.tsx`

**Description:** Eliminar el spinner de pantalla completa en `BookingPortal.tsx` (`catalogo.isPending`) y sustituirlo por `<PortalSkeletons />` con `useDelayedSkeleton`.
**Acceptance criteria:**

- [x] Spinner `animate-spin` y texto `"Cargando catálogo…"` eliminados.
- [x] `<PortalSkeletons />` renderizado en estado de carga inicial.
      **Verification:**
- [x] `bun test tests/booking-portal.test.tsx`
- [x] `bun run lint`

---

## Fase 2: Unificación del Dashboard Interior

### Task 2.1: Reemplazo de Spinner en `DashboardPage`

**Description:** Eliminar el spinner centrado `authLoading` en `dashboard/page.tsx` y renderizar directamente la estructura réplica de `DashboardLoading`.
**Acceptance criteria:**

- [x] Spinner `"Cargando tu negocio…"` eliminado de `dashboard/page.tsx`.
- [x] `DashboardLoading` se renderiza cuando `authLoading` es true.
- [x] Tabla de citas utiliza utilidades de `Skeleton` para `citasLoading`.
      **Verification:**
- [x] `bun test`
- [x] `bun run lint`

---

## Fase 3: Unificación en Vistas Interiores

### Task 3.1: Reemplazo de Cajas Genéricas en Vistas de Negocio

**Description:** Sustituir divs `animate-pulse` rústicos en `/personal`, `/configuracion`, `/agendas` y `/sucursales` por sus respectivas estructuras de Skeleton.
**Acceptance criteria:**

- [x] `/personal` usa estructura de `PersonalLoading` y utilidades de `Skeleton`.
- [x] `/configuracion` usa estructura de `ConfiguracionLoading`.
- [x] `/agendas` usa estructura de `AgendasLoading` y cuadrícula risográfica con dots.
- [x] `/sucursales` usa tarjetas y filas con `SkeletonBlock` y `SkeletonText`.
      **Verification:**
- [x] `bun test` (298/298 tests passing)
- [x] `bun run lint` (0 errors, 0 warnings)
- [x] `bun x tsc --noEmit` (0 errors)
- [x] `bun run build` (Exit code 0)
