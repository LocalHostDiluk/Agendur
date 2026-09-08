# CitaSync 🗓️✨

> **Plataforma SaaS Multi-Tenant para Gestión de Citas, Agendas y Sucursales.**  
> Diseñada para negocios de servicios: clínicas médicas, consultorios dentales, barberías, spas, centros estéticos y profesionales independientes.

---

## 🚀 Características Principales

### 🏢 1. Arquitectura Multi-Tenant & Multi-Sucursal

- Aislamiento estricto de datos en base de datos mediante **PostgreSQL Row Level Security (RLS)**.
- Soporte para negocios con múltiples sedes/sucursales, horarios personalizados por sede y profesionales asignados.

### 🌐 2. Portal Público de Reservas (`/reserva/[negocioSlug]`)

- Página personalizada de auto-reserva con URL amigable basada en el `slug` del negocio.
- Catálogo interactivo de servicios con duración y precios oficiales.
- Selección de especialista y cálculo inteligente de bloques horarios disponibles (UTC-safe).
- Confirmación de citas con bloqueo contra sobreventa (_double-booking prevention_).

### 📊 3. Panel de Administración del Negocio (`/dashboard`)

- Interfaz moderna con soporte completo para **Tema Claro** (predeterminado) y **Modo Oscuro** persistente en `localStorage`.
- Métricas clave en tiempo real: citas del día, ocupación de sedes, límites del plan contratado e ingresos estimados.
- Copiado rápido del enlace directo de reservas y acceso al portal público.

### 💳 4. Motor de Suscripciones y Pagos Desacoplado

- **Patrón Adapter**: Soporte nativo para cobros en línea con **Stripe** (Checkout Sessions, Customer Billing Portal y Webhooks con verificación criptográfica) y soporte para cobros directos/offline (**ManualGatewayAdapter**).
- Planes escalables (**Emprendedor**, **PyME**, **Enterprise**) con control estricto de cuotas de sucursales y profesionales.

### 🛡️ 5. Capa de Seguridad y Anti-Abuso

- **Control de Tráfico**: Rate Limiting por IP (_Sliding Window_) para prevenir ataques de fuerza bruta en registro, login y reservas.
- **Defensa Anti-Spam**: Integración con **Cloudflare Turnstile** para bloquear bots automatizados sin fricción de CAPTCHA invasivo.
- **Auth Guard**: Middleware oficial de Next.js 16 (`proxy.ts`) para protección y redirección de rutas privadas.
- **Observabilidad**: Rastreo y captura centralizada de errores con `@sentry/nextjs`.

---

## 🛠️ Stack Tecnológico

| Componente                       | Tecnología                                                                          |
| :------------------------------- | :---------------------------------------------------------------------------------- |
| **Framework Web**                | [Next.js 16.3.4](https://nextjs.org/) (App Router, Turbopack, `proxy.ts`)           |
| **Biblioteca UI**                | [React 19.2.8](https://react.dev/)                                                  |
| **Estilos & Diseño**             | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)   |
| **Runtime & Gestor de Paquetes** | [Bun 1.3.14](https://bun.sh/) _(Solo Bun, no usar npm/yarn/pnpm)_                   |
| **Base de Datos & Auth**         | [Supabase](https://supabase.com/) (PostgreSQL 15+, Auth SSR, RLS Policies, Storage) |
| **Pasarelas de Pago**            | Stripe API + Adaptador Manual                                                       |
| **Seguridad & Anti-Spam**        | Cloudflare Turnstile + IP Rate Limiter (Memory / Upstash Redis)                     |
| **Monitoreo & Logs**             | [Sentry](https://sentry.io/)                                                        |

---

## 📂 Estructura del Proyecto

```
my-app/
├── app/
│   ├── (auth)/             # Páginas de inicio de sesión (/login) y registro (/register)
│   ├── (cliente)/          # Portal público de reservas para clientes (/reserva/[negocioSlug])
│   ├── (negocio)/          # Panel administrativo: /dashboard, /sucursales, /agendas
│   ├── api/
│   │   ├── auth/           # Endpoints de autenticación (register, login, me, logout)
│   │   ├── cliente/        # Endpoints públicos de catálogo, disponibilidad y reserva
│   │   ├── negocio/        # Configuración, sucursales y suscripciones del negocio
│   │   └── webhooks/       # Webhook criptográfico de Stripe
│   ├── globals.css         # Tailwind CSS v4 (@theme inline y modo oscuro)
│   └── layout.tsx          # Layout raíz con ThemeProvider
├── components/
│   ├── cliente/            # Componentes del portal público (BookingPortal)
│   ├── landing/            # Componentes de la página de inicio pública
│   ├── negocio/            # Sidebar, Header y métricas del panel administrativo
│   ├── security/           # Componente Cloudflare TurnstileWidget
│   └── theme/              # ThemeProvider y ThemeToggle (useSyncExternalStore)
├── lib/
│   ├── backend/            # Lógica de dominio: reservas, sucursales y notificaciones
│   ├── payments/           # Motor de pagos desacoplado (Stripe y Manual adapters)
│   ├── security/           # Rate limiting por IP y validación de Turnstile
│   ├── supabase/           # Clientes server, browser y admin (service-role)
│   └── utils/              # Funciones auxiliares de tiempo, días y generador de slugs
├── proxy.ts                # Interceptor de rutas y Auth Guard (Next.js 16)
├── supabase/
│   ├── schema.sql          # DDL completo de PostgreSQL, índices y políticas RLS
│   └── migrations/         # Migraciones incrementales de seguridad y privacidad
└── tests/                  # Suite de pruebas automatizadas con bun test
```

---

## 🚦 Guía de Inicio Rápido

### Requisitos Previos

- Tener instalado [Bun](https://bun.sh/) (v1.3.14 o superior).
- Proyecto configurado en [Supabase](https://supabase.com/).

### 1. Clonar e Instalar Dependencias

```bash
bun install
```

### 2. Variables de Entorno

Copia el archivo de ejemplo o configura tu `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe (Opcional en desarrollo)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare Turnstile (Opcional, en local utiliza claves de prueba automáticas)
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=tu_site_key
CLOUDFLARE_TURNSTILE_SECRET_KEY=tu_secret_key

# Upstash Redis (Opcional, fallback automático a memoria)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 3. Levantar Servidor de Desarrollo

```bash
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Pruebas y Calidad de Código

```bash
# Ejecutar suite de pruebas unitarias y de integración
bun test

# Verificar tipado estricto con TypeScript
bun x tsc --noEmit

# Ejecutar el linter (ESLint 9 Flat Config)
bun run lint

# Compilar para producción (Turbopack)
bun run build
```

---

## 📄 Licencia

Desarrollado para **CitaSync SaaS**. Todos los derechos reservados.
