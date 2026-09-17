# Plan de Arquitectura: Unificación de Estilos de Carga (Skeletons vs. Spinners)

## 1. Contexto y Diagnóstico

Al navegar en `/dashboard` y `/reserva/[slug]`, los usuarios experimentan un parpadeo visual porque se muestran spinners y animaciones ad-hoc en lugar de los skeletons diseñados:

1. **Portal de Reservas (`/reserva/[slug]`):**
   - No tiene `loading.tsx` en Next.js.
   - En `BookingPortal.tsx`, `catalogo.isPending` renderiza un spinner de pantalla completa con `Cargando catálogo…` en lugar de `<PortalSkeletons />`.
2. **Dashboard (`/dashboard`):**
   - En `dashboard/page.tsx`, `authLoading` renderiza un spinner centrado con `Cargando tu negocio…` en lugar de la estructura réplica de `DashboardLoading`.
   - La tabla de citas tiene un loading rústico con `bg-surface-alt` en lugar de los tokens `.skel-*`.
3. **Vistas Interiores (`/personal`, `/configuracion`, `/agendas`, `/sucursales`):**
   - Estados de carga con divs grises `animate-pulse` que no coinciden con sus respectivos `loading.tsx`.

## 2. Principio Rector de Unificación

- **Cero spinners para estructuras o pantallas.**
- Los **Skeletons risográficos** son la única representación visual de carga para páginas y componentes.
- Los spinners (`Loader2` / `animate-spin`) quedan estrictamente reservados para el interior de botones mientras se guarda una acción o en el `ProcessingOverlay`.
- Se aplica el hook `useDelayedSkeleton` para evitar parpadeos en respuestas <200ms y sostener mínimo 400ms.

## 3. Plan de Acción

1. **Fase 1: Unificación del Portal de Reservas**
   - Crear `app/(cliente)/reserva/[negocioSlug]/loading.tsx` renderizando `<PortalSkeletons />`.
   - Modificar `components/cliente/BookingPortal.tsx` para reemplazar el spinner `catalogo.isPending` por `<PortalSkeletons />`.
2. **Fase 2: Unificación del Dashboard Interior**
   - Modularizar `DashboardLoading` (o exportarlo) para que `dashboard/page.tsx` lo use directamente cuando `authLoading` sea true.
   - Unificar el loading de la tabla de citas con las utilidades de `Skeleton`.
3. **Fase 3: Unificación de Vistas Interiores**
   - Reemplazar cajas `animate-pulse` en `/personal`, `/configuracion`, `/agendas` y `/sucursales` por sus respectivos componentes de Skeleton.
4. **Fase 4: Verificación Integral**
   - `bun test`, `bun run lint`, `bun x tsc --noEmit`, `bun run build`.
