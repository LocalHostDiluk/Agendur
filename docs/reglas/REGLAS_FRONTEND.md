# Reglas de construcción — Frontend (`apps/web`)

Estas reglas son obligatorias para todo código nuevo o modificado de frontend.
Alcance de este archivo: solo frontend. El servidor se rige por las
[reglas de construcción backend](REGLAS_BACKEND.md).

## 0. Antes de escribir código

1. Lee `docs/reglas/` y `docs/diseño/`.
2. Apariencia (colores, fuentes, espaciado, patrones visuales): manda el documento de estilo.
3. Estructura del código (tamaño, reutilización, ubicación): manda este archivo.
4. Si una regla de este archivo choca con lo que te pidió el usuario, avisa y espera respuesta. No la ignores en silencio.

## 1. Límites de tamaño (obligatorios)

| Archivo | Máximo de líneas |
|---|---|
| `page.tsx`, `layout.tsx`, `loading.tsx` | 100 |
| Componente `.tsx` | 150 |
| Hook o utilidad `.ts` | 100 |

- Un componente por archivo.
- `page.tsx` solo importa y compone. No define componentes, tipos ni funciones auxiliares.
- Si un archivo llega a 130 líneas, divídelo ANTES de seguir escribiendo.
- Nunca entregues un archivo que supere el límite.
- Más de 2 ternarios o `&&` anidados en el JSX: extrae esa parte a un componente.

## 2. Antes de crear cualquier componente, hook o función

1. Busca si ya existe:
   - `ls apps/web/components/ui apps/web/components/negocio apps/web/lib/hooks apps/web/lib/utils`
   - `grep -ril "<palabra clave>" apps/web/components apps/web/lib`
2. Si existe uno equivalente: úsalo.
3. Si existe pero le falta una variante: agrega una prop o variante a ese componente. El valor por defecto debe mantener el comportamiento actual. Busca todos sus usos con `grep` y confirma que siguen igual.
4. Si no existe: créalo en la ubicación de la sección 3.
5. Regla de dos: si un bloque JSX de 5+ líneas, o la misma lógica, aparece una segunda vez, extráelo antes de terminar.
6. Si el mismo conjunto de clases Tailwind aparece en 3+ lugares, conviértelo en una variante del componente de `components/ui/` que corresponda.

Usa SIEMPRE lo existente. Prohibido reescribirlo a mano:

| Necesitas | Usa |
|---|---|
| Botón, tarjeta, insignia | `components/ui/Button`, `Card`, `Badge` |
| Tabla | `components/ui/Table` |
| Modal | `components/ui/Modal` |
| Confirmación de acción | `components/ui/ConfirmDialog` + `lib/hooks/use-confirm-dialog` |
| Carga | `components/ui/Skeleton`, `ProcessingOverlay`, `lib/hooks/use-delayed-skeleton` |
| Aviso (toast) | `lib/utils/toast.ts` |
| Combinar clases | `cn` de `lib/utils.ts` |
| Peticiones a la API | `lib/query/api-client.ts` |
| Iconos | `lucide-react` |
| Animación | `motion` |
| Gráficas | `recharts` |

Antes de usar un componente de `ui/`, lee su archivo para conocer sus props. No adivines.

## 3. Dónde va cada cosa

| Qué | Ruta | Nombre |
|---|---|---|
| Componente de un dominio | `components/<dominio>/` | `PascalCase.tsx` |
| Componente usado en 2+ dominios | `components/ui/` | `PascalCase.tsx` |
| Hook | `lib/hooks/` | `use-nombre.ts` |
| Función pura | `lib/utils/` | `nombre.ts` |
| Tipo usado en 2+ archivos | `lib/types/index.ts` | — |
| Tipo o constante de 1 solo archivo | en ese archivo | — |

- Dominios existentes: `auth`, `cliente`, `errors`, `landing`, `negocio`, `providers`, `security`, `theme`, `ui`. Elige por el dominio de la pantalla.
- Al crear un archivo en una carpeta que tiene `index.ts` (`negocio`, `cliente`, `ui`, `lib/hooks`), agrega su export ahí, copiando el formato existente.
- Copia el estilo de imports del archivo vecino más cercano.
- PROHIBIDO sin que el usuario lo pida: carpetas nuevas, `_components`, `shared`, `common`, `helpers`, un `utils.ts` nuevo, mover o renombrar archivos.

## 4. Estructura de un componente

Orden fijo dentro del archivo:
1. `"use client"` (solo si aplica, ver sección 5)
2. imports
3. `interface <Nombre>Props`
4. constantes del archivo
5. el componente
6. export

- Props tipadas. Prohibido `any` y `@ts-ignore`.
- Un componente de presentación recibe sus datos por props y no hace peticiones.
- Las peticiones y queries van en `lib/hooks/use-*.ts`. Nunca `fetch` directo dentro de un componente.
- Tipos compartidos: revisa `lib/types/index.ts` antes de definir uno nuevo.

## 5. `"use client"`

Agrégalo solo si el archivo usa hooks de React, handlers de eventos, APIs del navegador, `motion`, `recharts` o `preline`.
Ponlo en el componente más pequeño que lo necesite. No lo pongas en un `page.tsx` si puedes evitarlo.

## 6. Estilos

- Solo Tailwind. Colores, fuentes y espaciado salen de `globals.css` y del documento de estilo.
- Prohibido: colores hex sueltos, `style={{ }}` (salvo valores dinámicos), CSS nuevo fuera de `globals.css`.
- Une clases con `cn`.

## 7. Calidad mínima

- Sin `console.log`, sin código comentado, sin imports ni variables sin usar.
- Componentes: `PascalCase`. Hooks: `useNombre`. Handlers: `handleNombre`. Booleanos: `isX` o `hasX`.
- Botones con texto o `aria-label`. Inputs con `label`. Imágenes con `alt`.
- No instales librerías. Si una ya instalada lo resuelve, úsala.
- No modifiques tests existentes para que pasen. Si tu cambio los rompe, corrige tu cambio.
- Componente nuevo con lógica (ramas o cálculos): agrega un test en `tests/<nombre>.test.tsx` siguiendo el de un test vecino. Componente solo de presentación: no requiere test.

## 8. No tocar sin orden explícita del usuario

`app/api/**`, `lib/backend/**`, `lib/supabase/**`, `lib/payments/**`, `lib/security/**`, `proxy.ts`, base de datos.

## 9. Antes de entregar (checklist)

1. `wc -l` de cada archivo tocado o creado. Todos dentro de los límites de la sección 1.
2. Tipos, lint y tests (scripts de `apps/web/package.json`) sin errores nuevos.
3. Ningún bloque JSX de 5+ líneas repetido en otro archivo.
4. Todo archivo nuevo tiene su export en el `index.ts` que corresponde.
5. Termina tu respuesta con este texto, completado:
   - `Busqué: <términos y carpetas>`
   - `Reutilicé: <archivos>`
   - `Creé: <archivos> — porque no existía equivalente`
   - `Líneas por archivo: <archivo: n>`
