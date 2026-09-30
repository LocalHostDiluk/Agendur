# Plan de refactorización de archivos — Frontend

Ámbito: `apps/web`. Primer archivo: `apps/web/app/(negocio)/dashboard/page.tsx`.
Objetivo: dividir archivos grandes en archivos pequeños (componentes, hooks, utilidades). La pantalla debe verse y funcionar IGUAL que antes.

## 0. Reglas que no se rompen

PERMITIDO:
- Crear archivos nuevos, solo en las ubicaciones de la sección 1.
- Cambiar código solo para: quitar código muerto, quitar duplicados, quitar `any`, simplificar condicionales. Siempre con el mismo resultado.

PROHIBIDO:
- Rediseñar. No cambiar clases Tailwind, textos, orden del DOM, atributos `aria-*` ni `key`.
- Cambiar lógica, llamadas a API, query keys, dependencias de `useEffect`/`useMemo`, orden de hooks.
- Crear carpetas. Mover o renombrar archivos existentes.
- Instalar librerías.
- Tocar: `app/api/**`, `lib/backend/**`, `lib/supabase/**`, `lib/payments/**`, `lib/security/**`, `proxy.ts`, `tests/**`.
- Modificar un test para que pase. Si un test falla, tu cambio está mal: revierte.

## 1. Dónde va cada cosa

| Qué | Ruta | Nombre |
|---|---|---|
| Sección o pieza del dashboard | `components/negocio/` | `Dashboard<Nombre>.tsx` (PascalCase) |
| Pieza genérica sin datos de negocio (sirve en 2+ dominios) | `components/ui/` | `<Nombre>.tsx` (PascalCase) |
| Hook con estado local o lógica | `lib/hooks/` | `use-<nombre>.ts` (kebab-case) |
| Función pura (formato, cálculo) | `lib/utils/` | `<nombre>.ts` (kebab-case) |
| Tipo usado en 2+ archivos | `lib/types/index.ts` | añadir al final |
| Tipo o constante usada en 1 solo archivo | en ese mismo archivo | — |

Después de crear un archivo en `components/negocio/`, `components/ui/` o `lib/hooks/`, agrega su export en el `index.ts` de esa carpeta, copiando el formato de las líneas que ya existen.
No existe la carpeta `_components`. No la crees.
Un componente por archivo.

## 2. Preparación (sin editar nada)

1. Lee `docs/reglas/`.
2. Lee el documento de estilo: `docs/diseño/`.
3. Lee `components/negocio/index.ts`, `components/ui/index.ts`, `lib/hooks/index.ts`.
4. Ejecuta `git status`. Si hay cambios sin commit, detente y avisa al usuario.
5. Crea rama: `git switch -c refactor/front-dashboard`.
6. Lee `apps/web/package.json`. Ejecuta los scripts de tipos, lint y tests que existan. Anota el resultado. Si algo ya falla antes de tocar código, NO lo arregles; solo anótalo. No ejecutes e2e.

## 3. Inventario de `page.tsx` (sin editar nada)

Lee el archivo COMPLETO. Escribe en tu respuesta una lista con:
- Cada bloque JSX de primer nivel (ej. KPIs, gráfica, lista de citas): líneas de inicio y fin.
- Cada `useState`, `useEffect`, `useMemo`, handler, constante, tipo y función definidos dentro del archivo.
- Cada bloque JSX que se repite (mismo JSX en 2+ lugares).
- Por cada bloque: qué variables usa del archivo (serán sus props) y si ya existe un componente equivalente en `components/ui/` o `components/negocio/`.

No sigas a la sección 4 hasta tener esa lista completa.

## 4. Orden de extracción (siempre este orden, una pieza a la vez)

1. Tipos y constantes → según la tabla de la sección 1.
2. Funciones puras → `lib/utils/`.
3. Estado local de UI (abrir/cerrar, pestaña activa) que usa un solo bloque → hook en `lib/hooks/` o dentro del componente del bloque.
4. Piezas pequeñas (una tarjeta KPI, una fila, un indicador de estado).
5. Secciones completas (KPIs, gráfica, lista de citas, etc.).
6. `page.tsx` queda solo importando y componiendo.

Si una pieza ya existe en `components/ui/` o `components/negocio/`, úsala en vez de crear otra.

## 5. Cómo extraer un componente

1. Copia el bloque JSX completo al archivo nuevo.
2. Lista las variables del archivo original que el bloque usa. Esas son sus props.
3. Declara `interface <Nombre>Props` arriba del componente. Sin `any`. Pasa solo lo que el bloque usa.
4. Deja en `page.tsx` los hooks de datos (queries, `lib/hooks/use-negocio-data`, realtime). Pasa su resultado por props.
5. Agrega `"use client"` en el archivo nuevo solo si usa hooks de React, handlers de eventos, APIs del navegador, `motion`, `recharts` o `preline`. Si no, no lo agregues.
6. Copia SIN CAMBIOS: clases, textos, orden, `aria-*`, `key`.
7. Reemplaza el bloque en `page.tsx` por el componente con sus props.
8. Ejecuta la verificación (sección 6).

Si el mismo JSX aparece 2+ veces: crea UN componente y pasa la diferencia por props.
Si un `.map` tiene más de 15 líneas de JSX por elemento: extrae el elemento a su propio componente, con la misma `key`.

## 6. Verificación (después de CADA extracción)

1. Tipos, lint y tests (los scripts de la sección 2, paso 6). Deben dar el mismo resultado que la línea base.
2. `wc -l` de cada archivo tocado o creado. Límites: `page.tsx` ≤ 100, cualquier otro `.tsx` ≤ 150, `.ts` ≤ 100.
3. Si todo pasa: `git add` de los archivos tocados y commit con mensaje `refactor(dashboard): extrae <Nombre>`.
4. Si algo falla: `git restore .` revierte los archivos modificados sin commit (solo esa pieza, porque las anteriores ya tienen commit). Borra a mano los archivos nuevos de esa pieza y quita sus líneas del `index.ts`. Repite con una pieza más pequeña. No arregles el fallo cambiando lógica.

## 7. Terminado cuando

- `page.tsx` ≤ 100 líneas y solo importa y compone.
- Ningún archivo nuevo supera los límites.
- Ningún bloque JSX de 5+ líneas está repetido.
- Tipos, lint y tests iguales a la línea base.
- `git diff` de la rama no toca nada de la lista PROHIBIDO.
- Tu reporte final lista: archivos creados, archivos modificados, líneas antes → después de `page.tsx`.

## 8. Siguiente archivo

NO pases al siguiente archivo sin que el usuario lo pida. Cuando lo pida, lista candidatos con:
`find apps/web/app apps/web/components -name "*.tsx" | xargs wc -l | sort -rn | head -20`
y repite las secciones 3 a 7 con el archivo que el usuario elija.
