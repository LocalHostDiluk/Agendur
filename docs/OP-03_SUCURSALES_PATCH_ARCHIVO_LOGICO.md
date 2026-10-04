# Documentación de Implementación: OP-03 — Sucursales PATCH y Archivo Lógico

**Fecha:** 3 de octubre de 2026  
**Módulos Afectados:** Backend Route Handler (`/api/negocio/sucursales`), Hooks de Datos (`use-negocio-data.ts`), Componentes UI (`ModalEditarSucursal.tsx`), Vista (`/sucursales`), Pruebas Automatizadas y Documentación.  
**Estado:** Implementado y Validado

---

## 1. Contexto y Problema Resuelto

### 1.1. Diagnóstico Previo (OP-03)
- **Carencia de método PATCH:** El módulo de sucursales únicamente exponía métodos `GET`, `POST` y `DELETE`. No existía una vía para actualizar el nombre, dirección, teléfono ni estado de la sucursal.
- **Riesgo de eliminación física destructiva:** Al utilizar `DELETE` en una sucursal que ya contaba con citas históricas o personal asignado, se producían fallos por restricciones de clave foránea (`foreign key constraint`) o, en caso de cascada, se perdía la información financiera, contable y de auditoría de citas pasadas.
- **Necesidad de archivo lógico:** Se requería implementar soporte formal para archivar lógicamente una sede desactivando el campo booleano `activa`, preservando intacto todo el historial de citas y estadísticas del negocio.

---

## 2. Resumen de lo Implementado y Modificado

```
Agender
├── apps/web/
│   ├── app/
│   │   ├── (negocio)/sucursales/page.tsx       [MODIFICADO - BOTÓN EDITAR EN DESKTOP/MOBILE]
│   │   └── api/negocio/sucursales/route.ts     [MODIFICADO - PATCH Y GUARDIA 409 EN DELETE]
│   ├── components/negocio/
│   │   ├── ModalEditarSucursal.tsx             [NUEVO - 142 LÍNEAS]
│   │   └── index.ts                            [MODIFICADO]
│   ├── lib/
│   │   └── hooks/
│   │       └── use-negocio-data.ts             [MODIFICADO - useUpdateSucursal()]
│   └── tests/
│       ├── sucursales-api.test.ts              [NUEVO - 7 TESTS]
│       └── sucursales-servicios.test.tsx       [VALIDADO - 7 TESTS]
└── docs/
    └── OP-03_SUCURSALES_PATCH_ARCHIVO_LOGICO.md [NUEVO]
```

---

## 3. Detalle de Arquitectura e Implementación

### 3.1. Backend: `PATCH /api/negocio/sucursales`
Implementado en `apps/web/app/api/negocio/sucursales/route.ts`:
- **Autorización:** Requiere capacidad `branches:write` y sesión activa del negocio.
- **Validación de Identificador:** Exige `id` válido de sucursal perteneciente al `negocio_id` autenticado (rechazando con 404 si es ajena o inexistente).
- **Validaciones de Entrada:**
  - `nombre`: Requerido, máximo 120 caracteres.
  - `direccion`: Requerido, máximo 250 caracteres.
  - `ciudad`: Requerido, máximo 120 caracteres.
  - `telefono`: Requerido, máximo 20 caracteres.
  - `estado_provincia`: Opcional, máximo 120 caracteres.
  - `codigo_postal`: Opcional, formato alfanumérico de 3 a 10 caracteres.
  - `zona_horaria`: Opcional, validada contra `Intl.DateTimeFormat`.
  - `activa`: Booleano estricto.

### 3.2. Backend: Protección y Archivo Lógico en `DELETE /api/negocio/sucursales`
Se blindó la operación de borrado físico para prevenir inconsistencias:
- Se realiza un conteo exacto de dependencias:
  - Citas registradas en la sucursal (`citas.sucursal_id = id`).
  - Profesionales vinculados a la sede (`profesionales.sucursal_id = id`).
- Si existe al menos un registro asociado, el servidor bloquea la operación y retorna **HTTP 409 Conflict** con el código de error `CANNOT_DELETE_ACTIVE_BRANCH` y un mensaje específico según el tipo de dependencia:
  - **Con citas registradas:** *"No se puede eliminar la sucursal porque tiene citas pendientes o registradas. Desactívala para archivarla lógicamente sin perder historial."*
  - **Con colaboradores asignados:** *"No se puede eliminar la sucursal porque tiene profesionales asociados. Desactívala para archivarla lógicamente sin perder historial."*
  - **Con ambos:** *"No se puede eliminar la sucursal porque tiene citas registradas y profesionales asociados. Desactívala para archivarla lógicamente sin perder historial."*
- **Traducción en Notificaciones (Toast):** En [toast.ts](file:///home/mario_lira/Documents/Universidad/Cuatrimestre_9/Desarrollo%20web%20integral/Agender/apps/web/lib/utils/toast.ts) se mapea este error para mostrar el título *"No se puede eliminar la sucursal"* y la descripción detallada, asegurando que el usuario entienda con total claridad la razón del bloqueo.
- Si la sucursal no tiene dependencias, se procede con la eliminación física limpia.

### 3.3. Hook de Mutación: `useUpdateSucursal()`
Agregado en `apps/web/lib/hooks/use-negocio-data.ts`:
- Ejecuta petición `PATCH /api/negocio/sucursales`.
- Invalida las queries de `["negocio", "sucursales"]` y `["cliente", "catalogo"]` para reflejar inmediatamente los cambios en la interfaz de administración y en el portal público de reservas.

### 3.4. Componente: `ModalEditarSucursal.tsx` (142 líneas)
- Ubicación: `apps/web/components/negocio/ModalEditarSucursal.tsx`.
- Formulario modal accesible estructurado con tokens oficiales de diseño.
- Inicialización por clave (`key={sucursal.id}`) que evita renders en cascada y garantiza reseteo limpio entre selecciones.
- Switch para el estado `activa`: cuando el usuario lo desmarca, se despliega un panel de advertencia informativa indicando que la sucursal quedará archivada lógicamente, cesando de recibir nuevas reservas pero preservando su historial completo.

### 3.5. Integración en UI: `sucursales/page.tsx`
- **Escritorio:** Se agregó la acción "Editar" con icono `Pencil` en la columna derecha de cada fila de la tabla de sucursales.
- **Móvil:** Se integró el botón "Editar" en la barra inferior de acciones de cada tarjeta de sucursal (`block sm:hidden`).

---

## 4. Validación y Criterio de Aceptación

1. **Persistencia y Actualización:** La edición de campos de sucursales y la modificación de su estado activo se persisten en base de datos y sobreviven a la recarga de la página.
2. **Archivo Lógico Verificado:** Las sucursales con `activa: false` permanecen visibles en el panel de administración con badge "INACTIVA", mientras que el portal público de reservas excluye las sedes inactivas.
3. **Protección de Datos:** Las sucursales con citas no pueden eliminarse físicamente, garantizando la integridad de auditoría.
4. **Pruebas Automatizadas:**
   - `bun test tests/sucursales-api.test.ts`: 7/7 pruebas pasando (validación de ID, 404 en sucursal ajena, actualización exitosa de datos y estado activo, 409 al intentar eliminar con citas o personal, 200 en sucursal limpia, listado GET).
   - `bun test tests/sucursales-servicios.test.tsx`: 7/7 pruebas pasando.
5. **Calidad:** 0 errores en compilación TypeScript (`bunx tsc --noEmit`) y 0 errores en ESLint (`bun run lint`).
