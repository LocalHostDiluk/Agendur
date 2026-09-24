# Documentación de Implementación: OP-01 / DS-06 — API y Persistencia de Personal / Profesionales

**Fecha:** 24 de septiembre de 2026  
**Módulos Afectados:** Base de Datos (Supabase), Backend Route Handlers (Next.js App Router), Frontend (React Query, UI Components, `/personal`), Pruebas (Bun Test) y Documentación.  
**Estado:** ✅ Implementado y Validado

---

## 1. Contexto y Problema Resuelto

### 1.1. Diagnóstico Previo (OP-01 & DS-06)
- **Problema en UI / Estado React:** En el panel de `/personal`, al registrar un colaborador mediante el modal de alta, se generaba un ID aleatorio en memoria (`prof-${Date.now()}...`) y se guardaba únicamente en un `useState` local de React (`colaboradoresLocales`).
- **Pérdida de datos:** Al refrescar la página (`F5`), el personal creado desaparecía por completo.
- **Inexistencia de API de Profesionales:** No existía ningún Route Handler en `/api/negocio/profesionales`. La página `/personal` leía indirectamente los datos desde la vista pública del catálogo (`useCatalogo`), la cual no expone datos PII (correo ni teléfono) ni colaboradores inactivos.
- **Carencia de persistencia de cargo y notas (DS-06):** El formulario capturaba un rol o cargo que no tenía columna correspondiente en la tabla `public.profesionales` de la base de datos. Asimismo, la tabla `public.citas` requería la columna `notas_internas`.

---

## 2. Resumen de lo Implementado y Modificado

```
Agender
├── supabase/
│   ├── migrations/
│   │   └── 20260924000000_profesionales_cargo_and_citas_notas.sql  [NUEVO]
│   └── schema.sql                                                  [MODIFICADO]
├── apps/web/
│   ├── app/
│   │   ├── (negocio)/personal/page.tsx                             [MODIFICADO]
│   │   └── api/negocio/profesionales/route.ts                      [NUEVO]
│   ├── components/negocio/
│   │   ├── ModalNuevoColaborador.tsx                               [MODIFICADO]
│   │   ├── ModalEditarColaborador.tsx                              [NUEVO]
│   │   └── index.ts                                                [MODIFICADO]
│   ├── lib/
│   │   ├── hooks/use-negocio-data.ts                               [MODIFICADO]
│   │   └── types/index.ts                                          [MODIFICADO]
│   └── tests/
│       ├── profesionales-api.test.ts                               [NUEVO]
│       └── personal.test.tsx                                       [MODIFICADO]
├── docs/
│   └── OP-01_IMPLEMENTACION_PROFESIONALES.md                       [NUEVO]
└── README.md                                                       [MODIFICADO]
```

---

## 3. Detalle por Capas de la Aplicación

### 3.1. Base de Datos y Tipos TypeScript

#### A. Migración SQL ([supabase/migrations/20260924000000_profesionales_cargo_and_citas_notas.sql](/supabase/migrations/20260924000000_profesionales_cargo_and_citas_notas.sql))
1. **Columna `cargo` en `public.profesionales`:**
   ```sql
   ALTER TABLE public.profesionales
     ADD COLUMN IF NOT EXISTS cargo TEXT DEFAULT 'Especialista';
   ```
2. **Columna `notas_internas` en `public.citas` (Cierre DS-06):**
   ```sql
   ALTER TABLE public.citas
     ADD COLUMN IF NOT EXISTS notas_internas TEXT NULL;
   ```
3. **Actualización de la vista `public.profesionales_publicos`:**
   Se incorporó `cargo` a la proyección pública sin exponer información confidencial (PII) como `email` o `telefono`:
   ```sql
   CREATE OR REPLACE VIEW public.profesionales_publicos WITH (security_invoker = true) AS
   SELECT id, sucursal_id, nombre, apellido, avatar_url, activo, cargo
   FROM public.profesionales
   WHERE activo = true;

   REVOKE ALL PRIVILEGES ON TABLE public.profesionales_publicos FROM PUBLIC;
   GRANT SELECT ON TABLE public.profesionales_publicos TO anon, authenticated;
   ```
4. **Esquema canónico:** Se actualizó [supabase/schema.sql](/supabase/schema.sql) reflejando estas adiciones.

#### B. Tipos TypeScript ([apps/web/lib/types/index.ts](/apps/web/lib/types/index.ts))
- Se actualizó la interfaz `Profesional` con `cargo?: string | null;` y `serviciosIds?: string[];`.
- Se añadieron y exportaron los tipos `CreateProfesionalPayload` y `UpdateProfesionalPayload`.
- Se añadió `notas_internas?: string | null;` a la interfaz `Cita`.

---

### 3.2. Backend & Route Handlers

Se implementó el archivo [apps/web/app/api/negocio/profesionales/route.ts](/apps/web/app/api/negocio/profesionales/route.ts) con las siguientes rutas:

#### A. `GET /api/negocio/profesionales`
- **Seguridad & Multi-tenancy:** Obtiene la sesión de Supabase Auth, resuelve el negocio por `owner_id = user.id` y restringe la consulta a las sucursales pertenecientes a dicho negocio.
- **Relaciones M:N:** Consulta `public.profesional_servicios` y agrupa en lote los IDs de los servicios asignados (`serviciosIds`) en cada profesional retornado.
- **Filtros:** Admite parámetros opcionales `?sucursalId=...` y `?activo=true|false`.
- **Respuesta exitosa (200):**
  ```json
  {
    "success": true,
    "ok": true,
    "profesionales": [
      {
        "id": "uuid-profesional",
        "nombre": "Alejandro",
        "apellido": "Vargas",
        "cargo": "Especialista",
        "email": "ale@barber.com",
        "telefono": "+525511112222",
        "sucursal_id": "uuid-sucursal",
        "activo": true,
        "serviciosIds": ["uuid-servicio-1", "uuid-servicio-2"]
      }
    ]
  }
  ```

#### B. `POST /api/negocio/profesionales`
- **Validaciones:**
  - `nombre` y `apellido` obligatorios (máx. 120 caracteres).
  - `sucursal_id` obligatoria y validada contra las sucursales pertenecientes al `negocio_id` autenticado.
- **Guardas de Suscripción:**
  - Ejecuta `assertActiveSubscription(negocio.id)` (retorna `402` si la suscripción ha expirado).
  - Control de límites del plan: Si `profesionalesActivos >= suscripcion.limite_profesionales`, rechaza con `409 LIMIT_EXCEEDED`.
- **Persistencia atómica/transaccional:** Inserta en `public.profesionales` y registra las asociaciones válidas en `public.profesional_servicios`.
- **Respuesta exitosa (201):** Retorna el profesional creado con sus `serviciosIds`.

#### C. `PATCH /api/negocio/profesionales`
- **Aislamiento Multi-inquilino:** Comprueba que el profesional exista y que su sucursal pertenezca al negocio del usuario. Impide modificar colaboradores de negocios ajenos (`404`).
- **Campos modificables:** `nombre`, `apellido`, `cargo`, `email`, `telefono`, `avatar_url`, `sucursal_id`, `activo`.
- **Reactivación controlada:** Si se cambia `activo: false -> true`, valida nuevamente la vigencia de la suscripción y el límite de profesionales del plan.
- **Sincronización de servicios:** Si se envía `serviciosIds`, reemplaza atómicamente en `public.profesional_servicios` las asignaciones existentes por las nuevas validadas para el negocio.
- **Respuesta exitosa (200):** Retorna el profesional actualizado.

---

### 3.3. Capa de Datos en Frontend (React Query)

En [apps/web/lib/hooks/use-negocio-data.ts](/apps/web/lib/hooks/use-negocio-data.ts):
- **`useProfesionales(filtros)`**: Consulta `GET /api/negocio/profesionales`. Permite filtrar por sucursal y estado activo con `staleTime` de 30 segundos.
- **`useCreateProfesional()`**: Mutation para `POST /api/negocio/profesionales`. Al completar exitosamente invalida:
  - `["negocio", "profesionales"]`
  - `["negocio", "suscripcion"]` (para actualizar profesionales disponibles/usados en la barra de límites)
  - `["cliente", "catalogo"]` (para reflejar al colaborador en el portal público de citas)
- **`useUpdateProfesional()`**: Mutation para `PATCH /api/negocio/profesionales`. Invalida las mismas claves para reflejar cambios en tiempo real.

---

### 3.4. Interfaz de Usuario y Componentes

#### A. [apps/web/components/negocio/ModalNuevoColaborador.tsx](/apps/web/components/negocio/ModalNuevoColaborador.tsx)
- Reemplazada la generación local `prof-${Date.now()}...` por la invocación asíncrona a `useCreateProfesional()`.
- Mapeado el selector de rol al campo `cargo`.
- Agregado estado de carga (`isPending`) con spinner animado (`Loader2`), deshabilitación de controles durante el envío y manejo defensivo de errores vía `notify.error`.

#### B. [apps/web/components/negocio/ModalEditarColaborador.tsx](/apps/web/components/negocio/ModalEditarColaborador.tsx) [NUEVO]
- Modal accesible con soporte para tecla `Escape` y bloqueo de scroll.
- Pre-carga los datos existentes del colaborador (`nombre`, `apellido`, `sucursal_id`, `cargo`, `email`, `telefono`, switch de estado `activo` y multi-selector de especialidades).
- Ejecuta `useUpdateProfesional()` y notifica retroalimentación al usuario.
- Exportado en [apps/web/components/negocio/index.ts](/apps/web/components/negocio/index.ts).

#### C. [apps/web/app/(negocio)/personal/page.tsx](/apps/web/app/%28negocio%29/personal/page.tsx)
- **Fuente de verdad:** Conectada a `useProfesionales()` (manteniendo compatibilidad retroactiva con `useCatalogo` en caso de fallo de red o modo test).
- **Tarjetas de Colaboradores:**
  - Badge dinámico de estado: `Activo` (estilo menta/mint) vs `Inactivo` (estilo atenuado).
  - Cargo real persistido (`colab.cargo` / `colab.rol`).
  - Botón **Editar** (ícono lápiz) que abre `ModalEditarColaborador`.
  - Botón **Activar / Desactivar** con diálogo de confirmación accesible vía `useConfirmDialog` (`ConfirmDialog`).
- **Persistencia garantizada:** Todas las modificaciones sobreviven recargas de página (`F5`).

---

## 4. Pruebas Automatizadas y Validación

### 4.1. Pruebas de API ([apps/web/tests/profesionales-api.test.ts](/apps/web/tests/profesionales-api.test.ts))
Se creó una suite completa de 11 casos de prueba ejecutados con Bun Test:
- `GET`: rechaza solicitudes no autenticadas con `401`.
- `GET`: retorna profesionales del negocio autenticado con sus servicios asignados.
- `GET`: filtra por `sucursalId`.
- `POST`: rechaza campos obligatorios faltantes (`400`).
- `POST`: rechaza si la sucursal asignada no pertenece al negocio (`400`).
- `POST`: rechaza con `409 LIMIT_EXCEEDED` cuando se alcanza el límite del plan de suscripción.
- `POST`: crea exitosamente un profesional con cargo y servicios asignados (`201`).
- `PATCH`: rechaza peticiones sin `id` (`400`).
- `PATCH`: impide modificar profesionales de otros negocios (`404`).
- `PATCH`: actualiza perfil y sincroniza `profesional_servicios` (`200`).
- `PATCH`: permite desactivar un profesional (`activo = false`) (`200`).

### 4.2. Pruebas de Interfaz ([apps/web/tests/personal.test.tsx](/apps/web/tests/personal.test.tsx))
Se actualizaron los mocks y se añadieron casos de prueba (8 pruebas en total):
- Renderizado de encabezados, alternador de pestañas y matriz de horarios.
- Renderizado de botones de acción para editar y desactivar en cada tarjeta.
- Renderizado de badge `Inactivo` y botón de reactivación cuando un colaborador está desactivado.

### 4.3. Resultado de la Ejecución
```bash
bun test apps/web/tests/personal.test.tsx apps/web/tests/profesionales-api.test.ts
```
**Resultado:** 19 pruebas ejecutadas y aprobadas al 100% (0 fallos).

---

## 5. Tabla de Archivos Creados y Modificados

| Acción | Archivo | Descripción del Cambio |
| :--- | :--- | :--- |
| **Crear** | [supabase/migrations/20260924000000_profesionales_cargo_and_citas_notas.sql](/supabase/migrations/20260924000000_profesionales_cargo_and_citas_notas.sql) | Migración SQL para `cargo`, `notas_internas` y vista pública segura. |
| **Modificar** | [supabase/schema.sql](/supabase/schema.sql) | Sincronización del esquema canónico con las nuevas columnas. |
| **Modificar** | [apps/web/lib/types/index.ts](/apps/web/lib/types/index.ts) | Definición de `cargo` en `Profesional`, `notas_internas` en `Cita` y payloads de mutación. |
| **Crear** | [apps/web/app/api/negocio/profesionales/route.ts](/apps/web/app/api/negocio/profesionales/route.ts) | Route handler `GET/POST/PATCH` con multi-tenancy, guardas y límites de plan. |
| **Modificar** | [apps/web/lib/hooks/use-negocio-data.ts](/apps/web/lib/hooks/use-negocio-data.ts) | Implementación de `useProfesionales`, `useCreateProfesional` y `useUpdateProfesional`. |
| **Modificar** | [apps/web/components/negocio/ModalNuevoColaborador.tsx](/apps/web/components/negocio/ModalNuevoColaborador.tsx) | Persistencia real en Supabase, estado de carga y mapeo de cargo. |
| **Crear** | [apps/web/components/negocio/ModalEditarColaborador.tsx](/apps/web/components/negocio/ModalEditarColaborador.tsx) | Modal para edición de perfil, cargo, sucursal, estado y servicios. |
| **Modificar** | [apps/web/components/negocio/index.ts](/apps/web/components/negocio/index.ts) | Exportación de `ModalEditarColaborador`. |
| **Modificar** | [apps/web/app/(negocio)/personal/page.tsx](/apps/web/app/%28negocio%29/personal/page.tsx) | Integración de API de profesionales, acciones de edición, desactivación y diálogos. |
| **Crear** | [apps/web/tests/profesionales-api.test.ts](/apps/web/tests/profesionales-api.test.ts) | Suite de pruebas automatizadas de integración y seguridad del backend. |
| **Modificar** | [apps/web/tests/personal.test.tsx](/apps/web/tests/personal.test.tsx) | Pruebas de renderizado de UI, botones de acción y estado inactivo. |
| **Modificar** | [README.md](/README.md) | Actualización de bitácora marcando `OP-01` y `DS-06` como resueltos. |
| **Crear** | [docs/OP-01_IMPLEMENTACION_PROFESIONALES.md](/docs/OP-01_IMPLEMENTACION_PROFESIONALES.md) | Documento descriptivo completo de la solución técnica implementada. |
