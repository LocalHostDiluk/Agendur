# Documentación de Implementación: OP-02 — Matriz de Horarios Semanales

**Fecha:** 3 de octubre de 2026  
**Módulos Afectados:** Backend Route Handlers (`/api/negocio/sucursales/horarios`, `/api/negocio/profesionales/horarios`), Hooks de Datos (`use-horarios.ts`), Componentes UI (`ModalHorariosSucursal.tsx`, `ModalHorariosProfesional.tsx`, `PersonalHorarios.tsx`), Vistas (`/personal`, `/sucursales`) y Pruebas Automatizadas.  
**Estado:** Implementado y Validado

---

## 1. Contexto y Problema Resuelto

### 1.1. Diagnóstico Previo (OP-02)
- **Matriz con valores inventados:** La pestaña de horarios en `/personal` presentaba datos fijos en interfaz y no administraba las tablas reales de base de datos (`horarios_profesional` ni `horarios_sucursal`).
- **Falta de edición en pantallas existentes:** No existía interfaz visual en `/sucursales` ni en `/personal` para configurar los días laborales y turnos de atención.
- **Riesgo de bifurcación de esquemas:** Se requería explícitamente reutilizar las tablas existentes sin crear modelos alternativos de horarios.

---

## 2. Resumen de lo Implementado y Modificado

```
Agender
├── apps/web/
│   ├── app/
│   │   ├── (negocio)/
│   │   │   ├── personal/page.tsx                      [REFACTORIZADO A 95 LÍNEAS]
│   │   │   └── sucursales/page.tsx                    [INTEGRADO CON BOTÓN HORARIO]
│   │   └── api/negocio/
│   │       ├── sucursales/horarios/route.ts           [VALIDADO Y EXISTENTE]
│   │       └── profesionales/horarios/route.ts        [VALIDADO Y EXISTENTE]
│   ├── components/negocio/
│   │   ├── ModalHorariosSucursal.tsx                  [NUEVO - 139 LÍNEAS]
│   │   ├── ModalHorariosProfesional.tsx               [NUEVO - 135 LÍNEAS]
│   │   ├── PersonalHorarios.tsx                       [MODIFICADO - 104 LÍNEAS]
│   │   ├── PersonalHeader.tsx                         [NUEVO - 54 LÍNEAS]
│   │   ├── PersonalControls.tsx                       [NUEVO - 114 LÍNEAS]
│   │   ├── PersonalDirectorio.tsx                     [NUEVO - 101 LÍNEAS]
│   │   ├── PersonalColaboradorRow.tsx                 [NUEVO - 114 LÍNEAS]
│   │   ├── PersonalColaboradorCard.tsx                [NUEVO - 122 LÍNEAS]
│   │   ├── PersonalColaboradorActions.tsx             [NUEVO - 78 LÍNEAS]
│   │   ├── PersonalRolesModal.tsx                     [NUEVO - 105 LÍNEAS]
│   │   ├── PersonalModals.tsx                         [NUEVO - 45 LÍNEAS]
│   │   ├── PersonalLoading.tsx                        [NUEVO - 40 LÍNEAS]
│   │   ├── PersonalEmpty.tsx                          [NUEVO - 50 LÍNEAS]
│   │   ├── PersonalError.tsx                          [NUEVO - 37 LÍNEAS]
│   │   └── index.ts                                   [MODIFICADO]
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── use-horarios.ts                        [NUEVO - 84 LÍNEAS]
│   │   │   ├── use-personal-actions.ts                [NUEVO - 91 LÍNEAS]
│   │   │   ├── use-personal-data.ts                   [NUEVO - 67 LÍNEAS]
│   │   │   └── index.ts                               [MODIFICADO]
│   │   └── utils/
│   │       ├── personal-colaboradores.ts              [NUEVO - 80 LÍNEAS]
│   │       └── personal-role.ts                       [NUEVO - 78 LÍNEAS]
│   └── tests/
│       ├── branch-schedules-api.test.ts               [VALIDADO - 4 TESTS]
│       ├── professional-schedules-api.test.ts         [VALIDADO - 3 TESTS]
│       └── personal.test.tsx                          [VALIDADO - 10 TESTS]
└── docs/
    └── OP-02_HORARIOS_SEMANALES.md                    [NUEVO]
```

---

## 3. Detalle de Arquitectura e Implementación

### 3.1. Reutilización de Tablas y RPCs Canónicos
No se crearon modelos paralelos ni tablas redundantes:
- **`horarios_sucursal`**: Columnas `sucursal_id`, `dia_semana`, `hora_apertura`, `hora_cierre`, `es_laborable`. Persistencia atómica mediante el RPC `replace_branch_schedule(p_sucursal_id, p_horarios)`.
- **`horarios_profesional`**: Columnas `profesional_id`, `dia_semana`, `hora_inicio`, `hora_fin`. Persistencia atómica mediante el RPC `replace_professional_schedule(p_profesional_id, p_horarios)`.
- **Días canónicos**: 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado.

### 3.2. Hook Especializado `use-horarios.ts`
Implementado en `apps/web/lib/hooks/use-horarios.ts` (84 líneas, respetando el límite de 100 líneas):
- `useHorariosSucursal(sucursalId)`: Consulta `GET /api/negocio/sucursales/horarios?sucursalId=...`.
- `useUpdateHorariosSucursal()`: Mutación `PUT /api/negocio/sucursales/horarios` con invalidación de queries de sucursales y disponibilidad pública.
- `useHorariosProfesional(profesionalId)`: Consulta `GET /api/negocio/profesionales/horarios?profesionalId=...`.
- `useUpdateHorariosProfesional()`: Mutación `PUT /api/negocio/profesionales/horarios` con invalidación de queries de profesionales y disponibilidad pública.

### 3.3. Componentes Modales de Edición
1. **`ModalHorariosSucursal.tsx` (139 líneas)**:
   - Configuración semanal de apertura por sucursal.
   - Montaje desacoplado mediante patrón de inicialización por clave (`key={sucursal.id}`) y render diferido cuando los datos están disponibles, eliminando renders en cascada.
   - Validación de apertura `<` cierre y requerimiento de al menos un día activo.
2. **`ModalHorariosProfesional.tsx` (96 líneas) y `HorariosProfesionalForm.tsx` (149 líneas)**:
   - Configuración semanal de turnos laborales individuales para el profesional.
   - Desacoplado en formulario modular para cumplir con el límite estricto de 150 líneas por componente.
   - **Sincronización automática de días cerrados**: Si la sucursal reduce sus días u horas de operación, los turnos del profesional se acotan y desactivan automáticamente en la interfaz, evitando que queden bloqueados o "congelados" al guardar.
   - Muestra el marco horario de la sucursal por día (`Sucursal: 09:00 - 18:00` o `Sucursal cerrada`) y un aviso explícito de que no se modifica el horario del local.
   - **3 accesos directos**:
     a) Desde el modal de perfil de personal ([ModalEditarColaborador.tsx](file:///home/mario_lira/Documents/Universidad/Cuatrimestre_9/Desarrollo%20web%20integral/Agender/apps/web/components/negocio/ModalEditarColaborador.tsx)) mediante el botón "Modificar Horario".
     b) Desde el Directorio de colaboradores ([PersonalDirectorio.tsx](file:///home/mario_lira/Documents/Universidad/Cuatrimestre_9/Desarrollo%20web%20integral/Agender/apps/web/components/negocio/PersonalDirectorio.tsx)) pulsando el botón "Horarios".
     c) Desde la matriz de turnos semanales ([PersonalHorarios.tsx](file:///home/mario_lira/Documents/Universidad/Cuatrimestre_9/Desarrollo%20web%20integral/Agender/apps/web/components/negocio/PersonalHorarios.tsx)) pulsando el icono de reloj.

### 3.4. Refactorización de `personal/page.tsx`
El archivo principal pasó de 1,339 líneas a **95 líneas** (cumpliendo `<= 100 líneas`).
Se dividió la lógica en:
- Directorio de colaboradores con vistas responsivas (`PersonalColaboradorRow` en desktop y `PersonalColaboradorCard` en mobile).
- Matriz de turnos semanales (`PersonalHorarios`), mostrando horarios reales persistidos y turnos de descanso.
- Modal de roles y permisos (`PersonalRolesModal`) utilizando el componente `PendingBadge` para permisos en desarrollo según directrices de diseño.

---

## 4. Validación y Criterio de Aceptación

1. **Persistencia Real**: Los horarios editados tanto para sucursales como para profesionales se guardan en PostgreSQL y reaparecen tras recargar la página.
2. **Disponibilidad Pública**: Las mutaciones invalidan la caché de React Query de `["cliente", "disponibilidad"]`, impactando directamente los bloques disponibles para agendar citas.
3. **Pruebas Automatizadas**:
   - `bun test tests/branch-schedules-api.test.ts`: 4/4 pasando.
   - `bun test tests/professional-schedules-api.test.ts`: 3/3 pasando.
   - `bun test tests/personal.test.tsx`: 10/10 pasando.
4. **Calidad**: 0 errores en compilación TypeScript (`bunx tsc --noEmit`) y 0 errores en ESLint (`bun run lint`).
