# Sistema de diseño de Agendur

> Fuente única para decisiones de interfaz y experiencia de usuario.
> Revisado: 29 de septiembre de 2026. Alcance: dashboard, autenticación, portal público de reservas, errores, carga y confirmaciones.
> Este documento sustituye los tres documentos anteriores de `docs/diseño/`. Describe el diseño objetivo; su existencia no implica que cada regla esté implementada.

**Navegación:** [Intención](#1-intención-y-reglas-de-decisión) · [Base existente](#2-implementación-existente-y-reutilización) · [Tokens](#3-fundamentos-y-tokens) · [Componentes](#4-componentes-y-sus-estados) · [Dashboard](#5-dashboard-y-navegación) · [Autenticación](#6-autenticación-y-onboarding) · [Reservas](#7-portal-público-de-reservas) · [Carga](#8-carga-y-procesamiento) · [Confirmaciones](#9-confirmaciones-y-acciones-con-consecuencias) · [Errores](#10-páginas-de-error) · [Ticket y movimiento](#11-motivo-ticket-y-movimiento) · [Accesibilidad](#12-accesibilidad-y-calidad-de-la-experiencia) · [Mejoras](#13-mejoras-pendientes-y-criterios-de-aceptación) · [Mantenimiento](#14-mantenimiento-y-fuentes).

## 1. Intención y reglas de decisión

**Problema:** ¿Cómo dar a negocios y clientes una experiencia clara y reconocible, sin instrucciones de diseño contradictorias ni decoración que retrase sus tareas?

- **Resultado:** una guía aplicable por diseñadores, desarrolladores y agentes, con una sola definición por decisión.
- **Usuarios:** dueños, gerentes y recepcionistas que trabajan con la agenda; clientes que reservan desde el celular.
- **Motivo:** los documentos anteriores repetían tokens y discrepaban sobre ticket, animaciones, carga y stack.
- **Éxito:** una nueva pantalla reutiliza los mismos fundamentos, comunica sus estados y permite completar la tarea en móvil y con teclado.
- **Restricción:** conservar la identidad y los componentes existentes; añadir únicamente lo necesario para resolver una necesidad real.
- **Fuera de alcance de esta revisión:** implementar las mejoras en la aplicación, cambiar reglas comerciales, incorporar módulos nuevos o migrar de librería de componentes.

**Decisiones confirmadas con el usuario:** claridad primero y ticket en momentos puntuales; respuesta inmediata al terminar una operación y animación breve opcional.

### 1.1 Orden de prioridad

1. Evitar pérdida de datos y acciones accidentales.
2. Legibilidad, accesibilidad y comprensión de la siguiente acción.
3. Rapidez y consistencia entre pantallas.
4. Identidad visual y movimiento.

Una excepción de marca nunca reduce legibilidad, oculta información o bloquea una tarea. Los valores de las tablas son la referencia; una excepción necesaria se documenta aquí, no en otra guía paralela.

### 1.2 Personalidad visual y verbal

Agendur es cálido, preciso y profesional. Papel cálido, tinta oscura, morado de acción y naranja como acento construyen la identidad risográfica. El ticket sugiere turno, orden y comprobante.

Usar textos breves, específicos y en sentence case. Los botones describen su resultado: `Crear cita`, `Guardar cambios`, `Reintentar`. Evitar `¿Estás seguro?`, mensajes técnicos en el flujo del cliente y promesas no respaldadas. Español como referencia; conservar equivalentes en inglés cuando la superficie tenga traducción. Fechas, moneda y zona horaria deben corresponder al negocio.

### 1.3 Intensidad por superficie

| Superficie | Tratamiento | Ticket y efectos |
| --- | --- | --- |
| Dashboard diario | Sobrio, compacto y legible; superficies planas | Onboarding, ilustración de vacío y tarjeta de upgrade |
| Login y registro | Formulario dominante; panel de marca secundario | Bento y una entrada breve; decoración prescindible |
| Reserva pública | Una decisión por paso; controles grandes | Ticket de resumen y comprobante final |
| Errores | Salida clara y explicación breve | Ilustración de ticket o código; 403 sobrio |
| Procesamiento | Estado real y recuperación | Una tarjeta de ticket si se usa el overlay existente |
| Confirmación destructiva | Consecuencias claras y foco en la opción segura | Sin muescas, confetti ni tono festivo |

## 2. Implementación existente y reutilización

La implementación se comprueba en `apps/web/package.json` y en los archivos indicados. Las versiones dependen del manifiesto y de `bun.lock`; no se copian comandos de instalación a esta guía.

| Necesidad | Base existente | Regla |
| --- | --- | --- |
| Aplicación | Next.js App Router, React, TypeScript | Mantener estructura y rutas del proyecto |
| Estilos | Tailwind CSS 4 y `apps/web/app/globals.css` | Centralizar valores y consumir variables o utilidades mapeadas |
| Componentes | Preline y componentes propios en `apps/web/components/` | Buscar el componente existente antes de construir otro |
| Tema | `components/theme/ThemeProvider.tsx` | Tema claro/oscuro por clase; no instalar otro proveedor |
| Inicialización | `components/theme/PrelineScript.tsx` | Reutilizar la inicialización al navegar; comprobar también controles montados después de cargar datos |
| Toasts | Sileo y `components/theme/SileoToaster.tsx` | Reutilizarlo; no crear otro sistema de notificaciones |
| Movimiento | CSS y `motion/react` | CSS para estados simples; Motion solo cuando haga falta coordinación |
| Iconos | `lucide-react` | Stroke 1.75; 16, 20 y 24 px en UI; tamaños mayores solo en ilustraciones |
| Gráficas | Recharts | Mantener estilos y datos accesibles del sistema |
| Skeletons | `components/ui/Skeleton.tsx` | Reutilizar Block, Text y Circle |
| Confirmaciones | `components/ui/ConfirmDialog.tsx` | Reutilizar el diálogo y adaptar contenido real |
| Procesamiento | `components/ui/ProcessingOverlay.tsx` | Reutilizar; ajustar las esperas según sección 8 |
| Portal | `components/cliente/BookingPortal.tsx`, `BookingCalendar.tsx`, `PortalSkeletons.tsx` | Evolucionar estos componentes, sin un segundo wizard |
| Fechas | Utilidades existentes, `Date` e `Intl` | No añadir date-fns solo para contar días o formatear fechas |

El proyecto también declara Base UI y el CLI de shadcn; eso no exige convertir toda la interfaz a shadcn/Radix. Las habilidades de styling aportan principios de composición y accesibilidad, no una migración de stack.

**Tablas:** HTML semántico y patrones existentes primero. TanStack Table no está declarado en el manifiesto revisado: incorporarlo solo si clasificación, filtros o selección complejos lo justifican. No añadir DataTables, jQuery ni un calendario nuevo por una recomendación genérica de Preline.

**Calendario:** reutilizar el de reservas para selección de fecha y la agenda existente para citas. Un date picker simple puede ser nativo. Una librería de agenda se evalúa únicamente ante una carencia comprobada.

## 3. Fundamentos y tokens

### 3.1 Arquitectura mínima

Los fundamentos siguen tres niveles, dentro del CSS existente:

| Nivel | Contiene | Ejemplo |
| --- | --- | --- |
| Primitivo | Valores de marca y escalas | `--grape`, `--ink`, radios y tiempos |
| Semántico | Propósito y contraste en cada contexto | `--surface`, `--text-primary`, `--action-bg` |
| Componente | Una adaptación realmente necesaria | `--portal-accent`, `--ticket-cutout-bg` |

Conservar nombres existentes. Añadir un alias si resuelve una diferencia real de contexto; no generar una variable por cada propiedad de cada componente. Los hex de este documento viven en la definición central, nunca repartidos por componentes. Un color de negocio validado es una excepción de datos: se asigna a una variable local.

### 3.2 Paleta de marca

| Token | Claro | Oscuro | Propósito |
| --- | --- | --- | --- |
| `--paper` | #F3EEDF | #F3EEDF | Papel de superficies públicas de marca |
| `--paper-pure` | #FFFFFF | #FFFFFF | Comprobante de papel |
| `--ink` | #1D1720 | #1D1720 | Tinta; sidebar y shells de marca fijos |
| `--ink-soft` | #2A2130 | #2A2130 | Superficie sobre tinta |
| `--grape` | #6E49A6 | #8B67C4 | Identidad morada; no garantiza contraste como texto |
| `--grape-soft` | rgba(110,73,166,0.12) | rgba(139,103,196,0.18) | Acento suave |
| `--flame` | #FF5A36 | #FF7A57 | Acento decorativo |
| `--mint` | #46B88A | #5CC498 | Ilustración de éxito sobre tinta |

### 3.3 Paleta semántica objetivo

**Objetivo pendiente de implementación:** estas correcciones mantienen la marca y permiten texto pequeño legible. Las filas marcadas con † difieren del CSS revisado o añaden un rol necesario.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--background` | #F7F5EF | #17121B | Canvas del dashboard |
| `--surface` | #FFFFFF | #1F1926 | Cards, inputs y paneles |
| `--surface-alt` | #F0ECE0 | #241D2C | Alternancia y hover |
| `--border` | #E7E1D3 | #332B3D | Separador decorativo |
| `--text-primary` | #211A26 | #F1ECE2 | Texto principal |
| `--text-secondary` | #6B6355 | #A79FAE | Ayuda y texto secundario |
| `--text-muted` † | #736A5A | #A79FAE | Metadatos legibles |
| `--action-bg` † | #6E49A6 | #7854B2 | Fondo de acción primaria |
| `--action-fg` † | #FFFFFF | #FFFFFF | Texto de acción primaria |
| `--action-hover` † | #5E3E8F | #6B499F | Hover de acción primaria |
| `--link` † | #6E49A6 | #BDA0E8 | Enlaces, selección y foco sobre superficie del tema |
| `--success` | #3F9E76 | #5CC498 | Indicador de éxito |
| `--success-text` † | #246B4F | #5CC498 | Texto de éxito y badges |
| `--success-soft` | rgba(63,158,118,0.12) | rgba(92,196,152,0.16) | Fondo de éxito |
| `--warning` | #E8A23D | #F0B65E | Indicador de advertencia |
| `--warning-text` † | #80540B | #F0B65E | Texto de advertencia y badges |
| `--warning-soft` | rgba(232,162,61,0.12) | rgba(240,182,94,0.16) | Fondo de advertencia |
| `--danger` | #D14343 | #E9696B | Indicador de error |
| `--danger-text` † | #A82A36 | #F58B8D | Texto de error y badges |
| `--danger-action` † | #B93643 | #B93643 | Botón destructivo con texto blanco |
| `--danger-soft` | rgba(209,67,67,0.12) | rgba(233,105,107,0.16) | Fondo de error |

`--border` sirve para separación: un control cuya forma sea necesaria para reconocerlo requiere borde o indicador con contraste suficiente. No asumir que todo borde decorativo cumple ese propósito.

**Superficies fijas:** el sidebar usa `--sidebar-bg: #1D1720`, texto `#EDE7DD` y texto secundario `#948C7E` en ambos temas. Sobre tinta, usar `--text-on-ink: #F3EEDF`; secundario y metadatos informativos con al menos 60% de ese color. El 40% anterior queda reservado a decoración. El foco sobre tinta usa #BDA0E8, independientemente del tema global.

**Ticket y portal:** el papel público es un contexto claro fijo, incluso si el dashboard está oscuro. Un ticket blanco usa texto #211A26 y metadatos #736A5A; no hereda texto blanco de `.dark`. Aplicar roles locales, sin modificar el tema del documento completo.

### 3.4 Uso del color y contraste

- Morado comunica acción. El naranja aparece en logo, ilustración de vacío/error, anuncio de novedad o upgrade; nunca como error, estado de cita ni cambio negativo de KPI.
- La campana puede tener un indicador naranja de novedades, con cantidad o nombre accesible; no reutilizarlo como estado operacional.
- Éxito, advertencia y error tienen roles propios. Un badge combina texto e icono reconocible; el color es refuerzo.
- En badges, texto e icono usan el rol `--success-text`, `--warning-text` o `--danger-text`, y el fondo usa su variante `-soft`. Si un acento puro no alcanza 3:1 sobre el fondo, el indicador funcional usa también la variante de texto.
- `Completada` puede usar acento morado como categoría, con texto en `--link`; no se interpreta como pendiente ni error.
- En gráficas, la selección usa grosor, opacidad o contorno. No cambiar a naranja en hover ni usar colores de advertencia para distinguir sucursales sin significado de estado.
- Texto normal: al menos 4.5:1; texto grande: 3:1. Ver [WCAG: contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Indicadores funcionales y foco se revisan sobre su fondo real, también con transparencias.

**Hallazgos comprobados al consolidar:** `#A39C8C` sobre blanco da 2.73:1; `#766E82` sobre `#1F1926`, 3.53:1; blanco sobre `#8B67C4`, 4.34:1; blanco sobre `#E9696B`, 3.14:1. Por eso se elimina la afirmación anterior de que toda la paleta ya cumplía AA. Las combinaciones corregidas de metadatos claros, acción oscura y acción destructiva dan 4.89:1, 5.66:1 y 5.72:1 respectivamente sobre los fondos especificados; esto no certifica una pantalla completa.

### 3.5 Tipografía

| Rol | Fuente | Tamaño / interlineado | Peso |
| --- | --- | --- | --- |
| H1 dashboard / autenticación | Bricolage Grotesque | 28 px / 1.2 | 600 |
| H2 | Bricolage Grotesque | 20 px / 1.3 | 600 |
| Título de card funcional | Inter | 16 px / 1.4 | 600 |
| Cuerpo de dashboard | Inter | 14 px / 1.5 | 400 |
| Cuerpo y campos de reserva móvil | Inter | 16 px / 1.5 | 400 |
| Ayuda y metadatos | Inter | 13 px / 1.4 | 400 |
| Label visible | Inter | 12–14 px / 1.4 | 500 |
| KPI | Space Mono + tabular-nums | 32 px / 1.1 | 700 |
| Números de tabla | Inter + tabular-nums | 14 px / 1.5 | 500 |
| Fecha y hora del comprobante | Space Mono | 22 px / 1.3 | 700 |
| Código de error / confirmación | Space Mono | 12–14 px / 1.4 | 400 |

Bricolage se reserva a títulos y marca; Inter al texto de interfaz; Space Mono a cifras, fechas y códigos cortos. No usar Space Mono para frases de ayuda ni párrafos. Un sello puede contener un código breve. Los H3 funcionales usan Inter aunque sean encabezados semánticos. Mayúsculas solo en códigos o sellos breves, no en labels ni navegación.

### 3.6 Espaciado, radios y layout

- Escala de espacio: **4, 8, 12, 16, 24, 32, 48, 64 px**. Medidas de control, borde, fuente e ilustración son categorías separadas.
- Radios: `--radius-sm: 6px` en inputs; `--radius-md: 10px` en botones y cards; `--radius-lg: 16px` en modales y drawers. Círculos únicamente para avatar, stepper o sello.
- Sidebar: 264 px expandido y 72 px colapsado. Topbar: 64 px.
- Dashboard: padding 16 px en móvil, 24 px en tablet/desktop y 32 px desde 1440 px. Grid de 12 columnas y gap 24 px en escritorio.
- Cards: borde de 1 px y, como máximo, sombra `0 1px 2px rgba(0,0,0,0.04)`. Separar con espacio.
- Breakpoints de producto: móvil <640 px; tablet 640–1023 px; desktop 1024–1439 px; wide ≥1440 px. No asumir que coinciden todos con los breakpoints predeterminados de Tailwind.
- Reservas y autenticación cambian a dos columnas desde **1024 px**. Por debajo muestran una sola columna.

## 4. Componentes y sus estados

Todo control tiene estados normal, hover, focus-visible, pressed/seleccionado, disabled y, si envía datos, loading/error. Una acción principal domina cada bloque de tarea.

### 4.1 Botones

| Variante | Fondo / texto | Uso |
| --- | --- | --- |
| Primario | `--action-bg` / `--action-fg` | Siguiente acción principal |
| Secundario | `--surface`, borde / `--text-primary` | Alternativa |
| Ghost | Transparente / `--text-secondary` | Acción terciaria |
| Destructivo | `--danger-action` / blanco | Cancelación o eliminación confirmada |
| Destructivo ghost | Transparente / `--danger-text` | Descartar o abrir confirmación |

Radio md; altura visual 40 px en escritorio, 32 px para acción compacta y 44 px en superficies táctiles. El área interactiva de botones compactos se amplía a 44×44 px donde se usan con tacto. Hover del primario usa `--action-hover`; foco visible de 2 px y offset de 2 px; press opcional scale(0.98), 120 ms. Disabled usa atributo nativo y explicación cercana cuando el bloqueo no sea evidente. Loading conserva ancho y cambia el label a la tarea en curso; evita envíos duplicados.

### 4.2 Formularios y selección

- Label visible y asociado, placeholder de ejemplo, ayuda opcional y error concreto debajo. Campos opcionales identificados.
- Inputs con radio sm, superficie del contexto y foco visible; error con texto, icono si ayuda y `aria-invalid`/`aria-describedby`.
- Validar al continuar/enviar y después al corregir; no mostrar errores antes de que el usuario interactúe.
- Select nativo primero; usar el existente si aporta búsqueda o selección compleja. Checkbox y radio conservan semántica nativa.
- Pills y tarjetas seleccionables usan radio/checkbox o botón semántico con estado accesible. El usuario debe distinguir selección por borde/check, además de color.
- Conservar datos al volver, ante error de red y al reintentar. No bloquear gestores de contraseñas ni pegar texto.

### 4.3 Tablas y cards

Header de tabla con fondo alterno, 12 px y peso 500; filas de altura mínima 48 px que crecen con el contenido. Ordenamiento comunicado visualmente y con `aria-sort`. Acciones de fila accesibles con teclado y visibles en touch; no depender solo de hover. Paginación: `Mostrando 1–10 de 84`, anterior/siguiente y controles necesarios.

En móvil, registros operativos pasan a cards label:valor con la misma acción principal. Una tabla que necesite comparación entre columnas puede mantener scroll horizontal en su contenedor con encabezados legibles; nunca provocar scroll horizontal del documento.

### 4.4 Modales, drawers y toasts

- Modal: overlay de tinta al 50%, radio lg, ancho según tarea; drawer: 420 px en escritorio y ancho completo en móvil.
- Reutilizar el control existente de apertura/cierre. Un solo responsable maneja visibilidad y foco; no combinar dos motores de modal para la misma instancia.
- Foco dentro del diálogo, Escape para cerrar cuando corresponda, retorno al disparador y título/descripción asociados. Durante una operación irreversible, explicar cualquier cierre bloqueado.
- Usar Sileo para avisos breves. Los errores que requieren acción permanecen junto al campo o proceso; no desaparecen únicamente en un toast.
- No imponer barra de progreso o nueva animación si el sistema existente no la necesita.

### 4.5 Estados de datos

| Estado | Contenido necesario |
| --- | --- |
| Carga inicial | Skeleton con forma real y anuncio de carga |
| Actualización | Mantener datos anteriores válidos; indicar actualización |
| Vacío inicial | Título, explicación y acción útil |
| Sin resultados por filtro | Explicación y `Limpiar filtros` |
| Error recuperable | Qué falló, datos conservados y `Reintentar` |
| Datos disponibles | Jerarquía clara y acción siguiente |

Un vacío inicial no se confunde con error ni con filtro sin resultados. Las ilustraciones de ticket son ligeras y secundarias al mensaje.

## 5. Dashboard y navegación

### 5.1 Shell

Sidebar oscuro fijo en ambos temas. Logo de 32 px, selector de sucursal si hay más de una, navegación con iconos de 20 px. Activo: fondo morado suave, indicador izquierdo de 3 px y texto claro; añadir `aria-current`. Hover suave sobre tinta. Footer con usuario, salida y control de colapso.

Topbar con título o breadcrumb y, a la derecha, búsqueda cuando sea útil, sucursal si no está en sidebar, tema, notificaciones y usuario. Evitar duplicar selectores de sucursal sin necesidad.

### 5.2 Mapa funcional

| Módulo | Contenido y tratamiento |
| --- | --- |
| Inicio | Citas de hoy, ingresos del mes, ocupación e inasistencias; próximas citas y gráficas |
| Calendario | Agenda, filtros por sucursal/profesional, detalle en drawer y alta de cita |
| Servicios y sucursales | Sucursales, servicios, horarios y creación/edición |
| Personal | Equipo, horarios, roles y permisos |
| Pagos y facturación | Transacciones, anticipos y suscripción |
| Reportes | Rango de fechas, ocupación, servicios, inasistencias y exportación |
| Configuración | Negocio, usuarios, recordatorios, plan y preferencias |

Orden del sidebar: el de esta tabla. Usar rutas existentes: `/dashboard`, `/agendas`, `/sucursales`, `/personal`, `/configuracion`. Pagos y Reportes aparecen como pendientes en el README revisado; diseñarlos no los convierte en funciones disponibles. Clientes permanece dentro del detalle de cita y transacciones; un módulo independiente requiere necesidad validada.

### 5.3 KPI y gráficas

KPI: label → cifra Space Mono → contexto/tendencia. Destacar `Citas de hoy` con fondo morado suave; mantener el mismo ancho de las cards. Una subida de inasistencias es negativa aunque la flecha apunte arriba. Incluir periodo y base de comparación cuando estén disponibles.

| Dato | Visualización |
| --- | --- |
| Citas diarias, últimos 30 días | Línea morada |
| Ingresos mensuales, últimos 6 meses | Barras moradas |
| Ocupación por sucursal | Barras horizontales con etiquetas directas |
| Servicios más vendidos | Barras ordenadas; donut solo si facilita una comparación breve |
| Inasistencias | Línea o área de error con relleno suave |

Tooltip con superficie, borde y radio sm. Resumen textual y valores accesibles. Las series categóricas tienen asignación estable y se distinguen también con nombre, patrón o trazo; los colores semánticos solo expresan su significado. No incorporar una paleta extra si basta una serie.

### 5.4 Responsive

| Ancho | Navegación | Datos |
| --- | --- | --- |
| ≥1024 px | Sidebar expandido/colapsable | KPI en 4 columnas; tabla y gráficas completas |
| 640–1023 px | Sidebar de iconos; expansión con overlay | KPI en 2 columnas; tabla con scroll local |
| <640 px | Bottom bar: Inicio, Calendario, Pagos, Reportes, Más | KPI en una columna; listas operativas en cards |

`Más` abre la navegación completa: no duplicar otro drawer con idénticas opciones. Solo mostrar accesos disponibles. `Nueva cita` puede ser un FAB sobre la barra si no duplica el CTA visible. Reservar espacio para barra, FAB y safe area; ninguna acción ni última fila queda tapada.

## 6. Autenticación y onboarding

Shell de dos columnas desde 1024 px: formulario con máximo 380 px y panel de marca sobre tinta. Bajo ese ancho, solo formulario. El botón de login es rectangular estándar.

**Login, en orden:** logo; `Inicia sesión en tu cuenta`; explicación; correo; contraseña y `¿Olvidaste tu contraseña?`; `Iniciar sesión`; acceso con Google si está habilitado; `¿No tienes cuenta? Regístrate`. No mostrar proveedores que no funcionan.

El panel de marca puede combinar un feed de ejemplo, una métrica validada, un beneficio y logos con permiso. No presentar `+500 negocios`, `-30% inasistencias` ni clientes ficticios como prueba social real. Si faltan evidencias, mostrar una explicación del producto. Un solo efecto principal; el formulario funciona sin decorar.

**Registro, tres pasos:**

| Paso | Campos | Acción |
| --- | --- | --- |
| Cuenta | Correo, contraseña, términos | Continuar |
| Perfil | Nombre, apellido, teléfono y rol | Atrás / Continuar |
| Negocio | Nombre, industria, sucursales iniciales y ciudad | Atrás / Crear mi cuenta |

Stepper: Cuenta · Perfil · Negocio; activo, completado y futuro distinguibles sin solo color. La fortaleza de contraseña tiene texto además de segmentos. Usar dos columnas para nombre/apellido solo si hay espacio. Para 1 / 2–3 / 4+ sucursales, radios estilizados.

Validación por paso, conservación de datos y foco en el título al avanzar o en el primer error al fallar. Al éxito, navegar enseguida al destino válido; celebración opcional y no bloqueante. El checklist inicial puede usar perforación y sello de progreso.

## 7. Portal público de reservas

### 7.1 Tarea, pasos y navegación

El cliente reserva **sin cuenta**. Orden: **Sucursal → Fecha → Servicio → Hora → Datos → Confirmación**. Confirmación es un resultado, no un paso editable. Con una sola sucursal se autoselecciona y quedan cuatro pasos editables; con cero sucursales se muestra un estado sin reservas disponibles.

El profesional se elige dentro de Hora, con `Cualquier profesional disponible` preseleccionado. Volver a un paso no borra datos; cambiar una selección aplica la tabla siguiente. No se avanza con datos obligatorios incompletos; junto al CTA se indica qué falta.

| Cambio real | Selecciones que se invalidan |
| --- | --- |
| Sucursal | Servicio, profesional y hora |
| Fecha | Servicio, profesional y hora |
| Servicio | Profesional y hora |
| Profesional | Hora |
| Solo regresar o elegir el mismo valor | Ninguna |

Los datos de contacto se conservan siempre. Al invalidar, avisar `Actualizamos los horarios disponibles.` y reconsultar la disponibilidad necesaria. Un acceso a un próximo día puede restaurar el servicio anterior **solo después de validar que siga disponible**; no saltar a Hora con un servicio inválido.

### 7.2 Personalización y layout

Personalización: logo cuadrado hasta 200×200 px y un acento de una paleta cerrada. Sin configuración, nombre en Bricolage y morado de marca. Validar datos al guardarlos y al consumirlos; no interpolar CSS libre.

El acento se asigna a `--portal-accent` dentro del portal: CTA primario, selecciones de sucursal/servicio/día/hora/profesional y progreso del wizard. Su tono suave y foco son derivados de ese mismo acento. **No sobrescribir globalmente `--grape`** ni estados de error/éxito. La firma `Reservas con agendur` conserva el morado de Agendur y enlaza a `/`.

**Paleta propuesta, pendiente de conectar a configuración:** los 12 tonos siguientes superan 4.5:1 con blanco; eso valida texto blanco sobre el tono, no cualquier uso del color.

| Nombre | Hex | Blanco sobre tono |
| --- | --- | --- |
| Uva | #6E49A6 | 6.63:1 |
| Ciruela | #5B3E91 | 8.26:1 |
| Violeta | #5F4BB6 | 6.63:1 |
| Azul profundo | #1E40AF | 8.72:1 |
| Azul | #1D4ED8 | 6.70:1 |
| Petróleo | #0E5C76 | 7.47:1 |
| Teal | #0F766E | 5.47:1 |
| Bosque | #166534 | 7.13:1 |
| Ocre | #7A4D15 | 7.24:1 |
| Terracota | #9A3412 | 7.31:1 |
| Frambuesa | #9F1239 | 8.02:1 |
| Malva | #854D7A | 6.29:1 |

Desktop: columna de contexto de 380 px sobre tinta, con logo de 48 px, negocio, dirección y ticket; columna de tarea sobre papel, contenido máximo 560 px. Móvil/tablet: encabezado de 72 px con logo de 32 px, progreso, contenido con padding 16 px y barra inferior con resumen + CTA. Reservar altura y safe area; mantener `Atrás` accesible. El comprobante completo aparece en el resultado, no al pie de cada paso móvil.

Stepper: círculos visuales de 32 px con área interactiva de 44 px; checks en completados y nombre del paso actual. En móvil se puede ocultar la fila de labels, pero mostrar `Paso 2 de 4 · Servicio` y conservar nombres accesibles.

### 7.3 Ticket de resumen

Tarjeta blanca con muescas del color de su fondo real. Orden: `Tu reserva`; perforación; sucursal, fecha, servicio, hora y profesional; perforación; duración y precio. Labels Inter, fechas y horas Space Mono. Mostrar líneas punteadas para selecciones pendientes.

El ticket acompaña la tarea; no roba foco ni anuncia cada efecto visual. Una fila nueva puede entrar con fade breve. No requiere BlurText ni simulación literal de impresión.

### 7.4 Contenido de los pasos

| Paso | Título ES / EN | Contenido |
| --- | --- | --- |
| Sucursal | ¿En qué sucursal? / Which location? | Tarjetas con nombre, dirección y horario; cerradas con aviso y sin selección |
| Fecha | Elige el día / Pick a day | Calendario mensual y disponibilidad |
| Servicio | ¿Qué servicio necesitas? / What service do you need? | Nombre, descripción de hasta 2 líneas, duración y precio |
| Hora | Elige tu horario / Pick your time | Profesional y chips por Mañana, Tarde, Noche |
| Datos | Solo faltan tus datos / Just your details | Nombre, teléfono, correo opcional, notas opcionales y privacidad |

Servicios: listar los ofrecidos por la sucursal; disponibles seleccionables y sin cupo atenuados con `Sin horarios este día`. Más de ocho servicios pueden agruparse por categoría. No afirmar a la vez que se ocultan los agotados y que se muestran deshabilitados.

Horarios: mañana antes de 12:00; tarde de 12:00 a antes de 18:00; noche desde 18:00. Omitir franjas vacías. Chips de mínimo 44 px; 4 columnas en escritorio y hasta 3 en móvil, adaptadas al ancho.

Datos, en orden: nombre completo obligatorio; teléfono obligatorio con prefijo y teclado telefónico; correo opcional; notas de tres líneas; aceptación de privacidad y política aplicable. Labels visibles. Ayudas: `Aquí te enviaremos el recordatorio de tu cita.` y `Opcional, para enviarte el comprobante.`, únicamente cuando esos canales estén operativos. CTA final: `Confirmar mi cita`.

### 7.5 Calendario y disponibilidad

- Mes inicial actual; semana de lunes a domingo. Calcular los 28/29/30/31 días reales y alineación, también en el skeleton.
- No seleccionar días pasados ni posteriores a 90 días desde hoy. Navegación mensual limitada al rango; la última vista puede incluir días posteriores deshabilitados.
- Usar la fecha/zona horaria del negocio para disponibilidad, límites y comprobante; no la del equipo del desarrollador.
- Celda de 44×44 px mínima, 56×56 px en escritorio. A 320 px, el calendario ocupa el ancho disponible con padding lateral de 4 px y sin gap entre columnas; el resto del paso mantiene 16 px. Este ajuste evita comprimir las siete celdas o provocar scroll horizontal.
- Hoy: peso y borde; seleccionado: acento, texto blanco y estado accesible; sin disponibilidad: deshabilitado y explicación. Durante carga, números visibles y puntos en skeleton, sin permitir selección no validada.
- Pedir disponibilidad por mes como objetivo de eficiencia; no una petición por día. Recargar ante cambio de mes/sucursal, recuperación de error o disponibilidad obsoleta. Los horarios se consultan también al cambiar servicio/profesional. No aplicar un “en ningún otro caso” que impida recuperarse.
- Validar de nuevo la hora en servidor al confirmar. No prometer que un punto del calendario bloquea un cupo.

### 7.6 Casos de recuperación

| Situación | Mensaje y acción |
| --- | --- |
| Mes cargando | Cuadrícula estable y puntos en skeleton |
| Servicios/horarios cargando | Tres placeholders de su forma real |
| Mes sin cupo | `Sin horarios disponibles en [mes]` y próximo mes válido; si acaba el rango, contactar al negocio |
| Día sin hora para el servicio | `No hay horarios para este servicio el [día]` y hasta tres próximos días con disponibilidad real |
| Negocio sin servicios | `Este negocio aún no tiene servicios disponibles para reservar en línea` y teléfono si está configurado |
| Sucursal cerrada | Banner explicativo; otra sucursal o contacto |
| Hora ocupada al enviar | `Ese horario acaba de ocuparse. Elige otro, por favor.`; volver a Hora, limpiar hora y recargar; conservar contacto |
| Error de red | Error visible, formulario conservado y recuperación segura |
| Resultado de envío incierto | Comprobar si la reserva se creó antes de permitir otro envío; nunca duplicarla por un reintento |

### 7.7 Confirmación de reserva

Pantalla completa sobre tinta. Icono CircleCheck de 56 px; `¡Listo! Tu cita está confirmada.` / `Done! Your appointment is confirmed.`; ticket de máximo 400 px con negocio, sucursal, servicio, duración, **fecha/hora**, profesional, dirección y código real de confirmación.

Acciones visibles: `Agregar a mi calendario` (archivo .ics con zona horaria correcta), `Ver ubicación` y `Cancelar cita` (abre confirmación y respeta política real). Cancelación debe usar el enlace/token autorizado de la reserva; no requiere cuenta ni expone una acción sin autorización.

Aviso de recordatorio y comprobante solo para canales habilitados. El éxito de reserva depende de su persistencia, no de una animación ni de que se haya entregado el mensaje. Si el aviso falla, informar sin crear otra cita. Confetti opcional, una vez y hasta 2 s, sin bloquear botones ni descargarlo durante los primeros pasos.

## 8. Carga y procesamiento

### 8.1 Skeletons

Reutilizar Block, Text y Circle con `--surface-alt`, radio sm y shimmer de 1.4 s; brillo blanco al 35% en claro y 8% en oscuro. Sin perforación ni decoraciones. Piezas `aria-hidden`; el contenedor anuncia carga y usa `aria-busy`.

**Tiempo:** un retraso de aparición de 200 ms puede evitar parpadeo en recargas locales. Mostrar los datos en cuanto estén listos; se retira la permanencia mínima obligatoria de 400 ms. Reutilizar y ajustar `lib/hooks/use-delayed-skeleton.ts` al implementar esta mejora; no crear otro hook. Mantener datos anteriores válidos durante un refetch.

`loading.tsx` sirve como fallback de ruta inmediato y replica la estructura; no se promete aplicar ahí temporizadores manuales del cliente. Ver [Next.js: loading UI](https://nextjs.org/docs/app/api-reference/file-conventions/loading).

| Superficie | Forma de carga |
| --- | --- |
| KPI | Label 60×12, cifra 120×32 y tendencia 50×16 px |
| Tabla | Filas con altura y columnas del contenido real |
| Gráfica | Bloque de la altura reservada, sin barras inventadas |
| Agenda operativa | Grid/horas de la vista real; no copiar un calendario mensual si se usa semana o cronograma |
| Sidebar | Solo selector dinámico de sucursal; navegación estática disponible |
| Portal inicial | Logo/nombre y estructura del primer paso real; no calendario y servicios simultáneos |
| Portal, mes | Días reales y solo disponibilidad en carga |
| Portal, servicios | Tres tarjetas con medidas del componente real |
| Landing | Métricas/testimonios únicamente si se consultan en vivo; nada sobre contenido estático |

Si el negocio no existe, terminar carga y mostrar su error. Todo skeleton necesita salida de éxito, vacío o error; nunca queda congelado.

### 8.2 Operaciones largas

Mostrar estado inmediato en el botón. Usar ProcessingOverlay solo cuando el proceso necesite bloquear otra interacción o explicar una espera; no añadirlo a toda mutación.

Si se usa: overlay de tinta al 85%, ticket máximo 320 px, indicador discreto de tres cuadrados y mensaje de tarea. Variante modal para pago/reporte y pantalla completa para reserva cuando esté justificada. Máximo un indicador animado; la interfaz conserva datos.

| Proceso | ES | EN |
| --- | --- | --- |
| Pago | Procesando tu pago… | Processing your payment… |
| Reporte | Preparando tu reporte… | Preparing your report… |
| Reserva | Confirmando tu cita… | Confirming your appointment… |

- Mostrar etapas distintas únicamente si el backend informa ese avance. No rotar `Verificando → Confirmando → Enviando` por temporizador como progreso ficticio.
- A los 8 s: `Esto está tardando más de lo normal.` / `This is taking longer than usual.` con orientación disponible; no afirmar que sigue ejecutándose sin evidencia.
- Éxito: mostrar resultado o navegar de inmediato. Se retiran los mínimos de 1200 ms y la pausa obligatoria de éxito de 800 ms.
- Error: mensaje específico y recuperación conservando datos. En pago/reserva, comprobar estado e idempotencia antes de ofrecer repetir.
- Con movimiento reducido, indicador estático y actualizaciones informativas sin transición. Los errores y las instrucciones no desaparecen por timeout.

## 9. Confirmaciones y acciones con consecuencias

Dos niveles sobre ConfirmDialog: simple, máximo 400 px; crítica, máximo 460 px con borde superior de error de 3 px. Título específico, explicación/consecuencias y botones explícitos. Foco inicial en la opción segura; retorno al disparador al cerrar. Ver [WAI: diálogos modales](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

| Acción | Nivel | Copy y confirmación |
| --- | --- | --- |
| Cerrar sesión | Simple | `¿Ya te vas?` / `Heading out?`; `Vas a cerrar tu sesión. Puedes volver cuando quieras.`; `Cerrar sesión` morado |
| Cancelar cita | Simple con consecuencia | `¿Cancelar esta cita?` / `Cancel this appointment?`; indicar notificación y política reales; `Sí, cancelar cita` destructivo |
| Descartar cambios | Simple | `Tienes cambios sin guardar` / `You have unsaved changes`; `Si sales ahora, vas a perder lo que modificaste.`; `Seguir editando` / `Descartar cambios` |
| Eliminar sucursal | Crítica | `Vas a eliminar [sucursal]`; consecuencias reales; escribir nombre exacto; `Eliminar sucursal` |
| Eliminar servicio | Crítica | `Vas a eliminar [servicio]`; explicar reservas y reasignación aplicables; nombre exacto; `Eliminar servicio` |
| Eliminar personal | Crítica | `Vas a eliminar a [nombre] del equipo`; accesos y citas reales; nombre exacto; `Eliminar del equipo` |
| Eliminar negocio | Crítica | `Vas a eliminar tu cuenta de [negocio]`; alcance y permanencia reales; nombre exacto; `Eliminar mi cuenta` |
| Cancelar suscripción | Crítica en contenido | `Vas a cancelar tu plan [plan]`; fecha y funciones afectadas reales; sin escribir nombre; `Seguir con mi plan` / `Cancelar plan` |

- Cancelación de plan es reversible: no imponer escritura ni insinuar pérdida de datos que no ocurra.
- Eliminaciones críticas requieren nombre real exacto y botón bloqueado hasta coincidir; no usar una palabra genérica. La comparación y ayuda deben ser consistentes.
- No afirmar automáticamente que se borrará historial, que se cancelarán todas las citas o que se perderá acceso: las consecuencias vienen de la operación implementada.
- Confirmaciones de cancelación de cita usan los canales activos, sin prometer WhatsApp si es un stub.
- Upgrade no requiere diálogo de consecuencias negativas; un cobro sí informa importe y condiciones antes de aceptarlo.
- Sin botones con muesca en acciones destructivas. Iconos grandes de 40 px son ilustrativos, no una excepción general al tamaño de iconos de UI.
- Cierre de sesión conserva el diálogo existente como base; valorar retirarlo solo si no hay cambios sin guardar y la tarea lo justifica.

## 10. Páginas de error

### 10.1 Shell compartido

Reutilizar `components/errors/ErrorShell.tsx`: tinta fija, sin toggle, altura mínima del viewport, padding 24 px y contenido máximo 540 px. Logo arriba a 24 px. Ilustración/código de hasta 280 px en escritorio y 180 px en móvil; H1 32/24 px, Bricolage 700; descripción Inter 16 px, máximo 420 px; acciones con gap 12 px; perforación de 240 px; código final Space Mono 12 px.

Primario legible, secundario de contorno y ambos con área táctil de 44 px. Se permite muesca solo en el primario de estas páginas; siempre del fondo real y sin recortar foco. Todos los errores tienen salida visible y `noindex`.

### 10.2 Casos y copy

| Error | Título ES / EN | Descripción y acciones |
| --- | --- | --- |
| 404 | `Ese turno no existe.` / `That ticket doesn't exist.` | `La página que buscas no está aquí. Puede que el enlace esté mal escrito o que la página se haya movido.`; Volver al inicio; Ir a mi panel solo con sesión |
| 403 | `No tienes acceso a esta sección.` / `You don't have access to this section.` | `Tu rol actual no incluye permisos para ver esta página. Si crees que es un error, contacta al dueño de la cuenta.`; Volver a mi panel; Contactar soporte |
| 500 | `Algo se atascó de nuestro lado.` / `Something jammed on our end.` | `Intenta de nuevo en un momento.`; Reintentar con recuperación real; Volver al inicio |
| Negocio no encontrado | `No encontramos este negocio.` / `We couldn't find this business.` | `El enlace de reservas no existe o el negocio ya no está activo en Agendur. Te recomendamos contactar al negocio directamente para confirmar su enlace.`; Conocer Agendur → / |

404: código naranja e ilustración discreta. 403: ticket con sello `Sin acceso`, sin fondo animado. 500: código y fondo discreto opcional, con fallback estático; informar `Ya nos enteramos del problema` solo si el reporte está confirmado. Negocio inexistente: ticket vacío; sin links a login, registro o dashboard y sin logo enlazado aparte del CTA a la landing.

Rutas reales del proyecto: `apps/web/app/not-found.tsx`, `error.tsx`, `global-error.tsx`, `403/page.tsx` y portal bajo `reserva/[negocioSlug]`. No crear una ruta raíz `/[negocio]` copiando la guía anterior. Error local de una sección mantiene el shell y un mensaje recuperable; no sustituir toda la pantalla por un 500 si no hace falta.

## 11. Motivo ticket y movimiento

### 11.1 Lista única de usos

| Motivo | Lugares permitidos |
| --- | --- |
| Ticket/perforación/sello decorativo | Landing y panel de marca; onboarding; ilustración de vacío; upgrade; resumen/comprobante de reserva; tarjeta de procesamiento; ilustración/shell de error |
| Muesca en botón primario | Páginas de error y envío final `Confirmar mi cita` del portal |
| Sello de novedad | Anuncio de funcionalidad o notificación nueva, con texto/nombre accesible |
| Confetti opcional | Alta de cuenta o reserva persistida, una sola vez y sin retrasar navegación |

Todos los demás botones, inputs, filas, KPI y diálogos usan geometría estándar. Esta tabla reemplaza las listas incompatibles de “cuatro usos” de los documentos originales.

Reutilizar utilidades CSS existentes. Muescas: 24 px en tarjeta y 16 px en botón, con radio circular y fondo de recorte igual al contexto local (`--ticket-cutout-bg` si se necesita). Perforación: dashed de 2 px. Sello: hasta 88 px, borde 2 px y rotación estática de −12°. Estas medidas son de ilustración. No crear efectos SVG/canvas si CSS resuelve la forma; no duplicar una utilidad para cada página. La muesca no puede cubrir texto, reducir área táctil ni cortar el anillo de foco.

### 11.2 Tokens y catálogo de movimiento

| Token | Valor | Uso |
| --- | --- | --- |
| `--motion-fast` | 120 ms | Hover, selección y press |
| `--motion-base` | 200 ms | Fade y cambio simple de estado |
| `--motion-slow` | 320 ms | Modal/drawer |
| `--ease-out` | cubic-bezier(0.16,1,0.3,1) | Entradas |
| `--ease-in-out` | cubic-bezier(0.4,0,0.2,1) | Transiciones bidireccionales |

Sidebar: 200 ms; modal: fade/scale 0.95→1 y drawer: slide, ambos 320 ms; paso de wizard: fade o desplazamiento de hasta 24 px, 200 ms; toast: comportamiento existente. No esperar a una animación de salida completa antes de permitir la tarea siguiente.

KPI muestra el valor real desde el principio; no count-up obligatorio. Gráfica puede tener una entrada de hasta 600 ms, una vez, si no afecta lectura; no reiniciarla en refetch. El shimmer de carga dura 1.4 s por ciclo. `--motion-page` de 400 ms existe en CSS pero no se aplica automáticamente a cada ruta.

**Movimiento reducido:** renderizar directamente el estado final; sin shimmer, pulsos, desplazamientos, glitch, count-up ni confetti. No mantener un fade obligatorio de 100 ms. Las actualizaciones de estado y anuncios accesibles continúan. Si hay movimiento decorativo continuo, debe poder detenerse; evitarlo como opción predeterminada.

React Bits/Magic UI son referencias de efectos y componentes copiados, no requisitos de instalación. Reutilizar equivalentes locales/CSS/Motion. Un error siempre renderiza texto y salida aunque falle la decoración; el portal no descarga fondos interactivos.

## 12. Accesibilidad y calidad de la experiencia

- Semántica nativa, labels visibles, foco visible y nombre accesible en botones de icono. No usar divs clickeables como sustituto de controles.
- Navegación con teclado completa. Calendario: flechas, Enter/Espacio y etiqueta completa con fecha y disponibilidad; foco válido incluso cuando hoy no tenga cupo.
- Cambios de paso: enfocar título y anunciarlo sin duplicar mensajes. Error de formulario: enfocar primer campo inválido. Mensajes de proceso con live region adecuada, sin anunciar cada frame.
- Estado/selección distinguibles con texto, icono o forma; el aria-label del calendario complementa una indicación visual, no la sustituye.
- Diálogos con gestión completa del foco; no confiar en que una librería garantiza por sí sola la accesibilidad.
- Objetivo de producto: áreas táctiles de **44×44 px**. WCAG 2.2 AA establece 24×24 px con condiciones/excepciones; 44 px es nuestra elección más cómoda. Ver [WCAG: tamaño de objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Reflow a 320 px, zoom y texto ampliado sin pérdida de acciones; barras fijas no ocultan campos ni mensajes.
- Portal: objetivo de interacción inicial <2.5 s en una prueba 4G definida, no una garantía sin medición. CSS y HTML primero; animación opcional fuera del camino crítico.
- No afirmar conformidad AA o rendimiento a partir de una paleta o de esta revisión documental: validar la pantalla y el flujo reales.

## 13. Mejoras pendientes y criterios de aceptación

Esta es la lista para aplicar la guía, no una declaración de cambios ya realizados.

| Prioridad | Mejora | Evidencia de aceptación |
| --- | --- | --- |
| P0 | Corregir texto tenue, acciones oscuras y roles de estado | Contraste medido sobre fondos y transparencias reales |
| P0 | Aislar tema de papel/ticket y acento del negocio | Portal y comprobante legibles al entrar desde dashboard oscuro |
| P0 | Conservar datos y recuperar reserva/pago inciertos | Error de red o cupo ocupado no duplica operación ni borra contacto |
| P1 | Retirar mínimos de skeleton/procesamiento y éxito | Datos y resultado disponibles al terminar; sin demora artificial |
| P1 | Alinear carga con wizard y agenda reales | Mismo paso/grid antes y después; días/semana correctos |
| P1 | Revisar controles en 320 px, teclado y móvil | Calendario sin overflow, foco visible y CTA sin solapamientos |
| P1 | Unificar duración de modales y reducción de movimiento | Un solo motor y estado final estático con reducción activada |
| P2 | Dosificar ticket, simplificar bento y gráficas | La tarea domina; no hay métricas ficticias ni color semántico ambiguo |

### 13.1 Supuestos que necesitan evidencia

| Supuesto | Cómo comprobarlo |
| --- | --- |
| El orden Fecha → Servicio ayuda al cliente | Observar reservas reales; medir retrocesos y abandono por paso |
| Cuatro/cinco pasos se entienden en móvil | Prueba de tarea sin ayuda: reservar y modificar una selección |
| La bottom bar facilita operación diaria | Probar crear/consultar una cita y navegar sin acciones tapadas |
| El ticket ayuda a verificar la reserva | Pedir identificar fecha, lugar y profesional en el comprobante |
| Un aviso de privacidad/cancelación se entiende | Revisar copy y política efectiva con responsables del producto |

Cambiar un supuesto requiere evidencia o una decisión de producto registrada; no rediseñar el flujo solo para seguir una moda.

### 13.2 Alternativas evaluadas

| Alternativa | Valor / coste / diferenciación | Decisión |
| --- | --- | --- |
| Concatenar los tres documentos | Rápido; conserva contradicciones y repetición | Descartada |
| Un documento por superficie y tokens separados | Navegación cómoda; más lugares que mantener | Dividir solo si la guía resulta difícil de usar |
| Una guía con fundamentos, superficies y pendientes | Alta coherencia; coste bajo; identidad conservada | Elegida |
| Sistema neutral con todos los componentes nuevos | Coherencia posible; migración grande y pérdida de identidad | Fuera de alcance |
| Ticket y animación en toda la interfaz | Marca fuerte; más ruido, fricción y mantenimiento | Descartada por claridad primero |

**Límite de esta versión:** un Markdown y el CSS existente bastan. No generar paquetes de tokens, Storybook, un sitio documental, nuevos proveedores ni un catálogo de componentes especulativo. Añadirlos cuando una necesidad comprobada de colaboración o mantenimiento lo exija.

### 13.3 Checklist de una mejora visual

- [ ] Reutiliza el componente y los tokens existentes o documenta una necesidad concreta.
- [ ] Se distingue lo implementado de lo propuesto; copy refleja datos, canales y consecuencias reales.
- [ ] Normal, foco, selección, disabled, carga, vacío y error funcionan cuando aplican.
- [ ] Marca y estados tienen roles distintos; contraste se mide en ambos contextos.
- [ ] Ticket y efectos cumplen la lista única; movimiento reducido muestra estado final.
- [ ] No pierde datos, repite operaciones ni retrasa un resultado listo.
- [ ] Se puede completar la tarea con teclado y en móvil, incluidas barras fijas.
- [ ] La carga replica el contenido real y siempre tiene salida.
- [ ] Se verifican los archivos/links modificados y la prueba mínima correspondiente al cambio.

## 14. Mantenimiento y fuentes

Este Markdown define las decisiones; `apps/web/app/globals.css` y los componentes compartidos implementan los valores. Cuando divergen, la sección 13 indica el trabajo pendiente. Una mejora se considera aplicada después de cambiar y verificar la implementación, no después de editar la guía.

Actualizar aquí la regla, su contexto y su criterio de aceptación antes de extenderla a otra superficie. Eliminar la redacción sustituida. No crear un segundo documento normativo ni usar instrucciones antiguas en comentarios como una excepción vigente.

Referencias primarias para comprobar implementación y accesibilidad:

- [Preline con Next.js](https://preline.co/docs/guides/nextjs.html): inicialización cliente y navegación.
- [Next.js loading UI](https://nextjs.org/docs/app/api-reference/file-conventions/loading): fallback de ruta y streaming.
- [WCAG contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): umbrales de texto.
- [WCAG tamaño de objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): mínimo AA y excepciones.
- [WAI diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): foco y teclado.
