export type Language = "es" | "en";

export const landingCopy = {
  es: {
    priceTitle: "Un plan que sí te queda.",
    nav: {
      product: "Producto",
      pricing: "Precios",
      forBusiness: "Para tu negocio",
      contact: "Contacto",
      login: "Iniciar sesión",
      cta: "Reclama tus 14 días gratis",
    },
    hero: {
      h1: "Deja de perseguir citas. Que te busquen a ti.",
      subtitle:
        "Agendur organiza tu negocio, tus sucursales y tus recordatorios — tú solo abres la puerta.",
      ctaPrimary: "Reclama tus 14 días gratis",
      ctaNote: "Sin tarjeta.",
      secondaryLink: "Ve cómo funciona",
      ticketLabel: "Ticket de turno",
      ticketService: "Corte & Barba Master · Sucursal Centro",
      ticketStaff: "Atendido por: Mateo Silva",
      ticketDate: "Hoy, 16:30 hrs",
      ticketDeposit: "Anticipo: $150 MXN (Pagado)",
      ticketStatus: "Confirmado",
      stampText: "Turno",
    },
    howItWorks: {
      badge: "Secuencia simple",
      title: "Cómo funciona",
      subtitle:
        "Tres pasos claros para que tu mostrador funcione con orden impecable.",
      steps: [
        {
          num: "1",
          title: "Registra tu negocio",
          desc: "Clínica, barbería, spa, nutriólogo, el que sea.",
          industries: [
            "Clínica",
            "Barbería",
            "Spa",
            "Nutriólogo",
            "Salón",
            "Consultorio",
          ],
        },
        {
          num: "2",
          title: "Comparte tu link",
          desc: "Ellos reservan solos, 24/7.",
          note: "Enlace en Instagram, WhatsApp o código QR en mostrador.",
        },
        {
          num: "3",
          title: "Agendur les recuerda por ti",
          desc: "Menos ausencias, cero esfuerzo.",
          note: "Confirmación y avisos automáticos directos a su teléfono.",
        },
      ],
    },
    features: {
      badge: "Diferenciadores",
      title: "Construido para el día a día de tu mostrador",
      subtitle:
        "Herramientas pensadas para negocios con clientes reales, no para salas de juntas.",
      big: {
        tag: "Tu portal público",
        title: "Tu negocio, tu link",
        subtitle:
          "Página de reservas personalizada lista en segundos. Sin que tus clientes tengan que descargar aplicaciones raras.",
        url: "negocio.agendur.app",
        previewService: "Consulta de Valoración",
        previewDuration: "40 min · $500 MXN",
        previewAction: "Reservar ahora",
      },
      cards: [
        {
          id: "multi-branch",
          title: "Multi-sucursal, un solo panel",
          desc: "Coordina diferentes ubicaciones, asigna especialistas y define horarios independientes sin cruzar agendas jamás.",
          badge: "Control total",
        },
        {
          id: "reminders",
          title: "WhatsApp/SMS que sí llegan",
          desc: "Recordatorios automáticos con confirmación en un toque. Quien no confirma libera el turno a tiempo.",
          badge: "-30% faltas",
        },
        {
          id: "deposits",
          title: "Cobra un anticipo, no pierdas el lugar",
          desc: "Pagos y depósitos directos a tu cuenta al agendar. Compromiso real del cliente antes de apartar tu tiempo.",
          badge: "Pagos en línea",
        },
      ],
    },
    socialProof: {
      metrics: [
        { value: "+500", label: "negocios ya usan Agendur" },
        { value: "-30%", label: "de inasistencias" },
        { value: "12,000+", label: "citas al mes" },
      ],
      testimonials: [
        {
          quote:
            "Antes perdíamos 4 o 5 turnos a la semana porque la gente simplemente lo olvidaba. Desde que los recordatorios salen por WhatsApp, las cancelaciones de sorpresa desaparecieron.",
          name: "Dr. Alejandro Ramos",
          role: "Director Dental",
          business: "Clínica Dental Ramos",
          city: "Guadalajara",
          ticketNo: "T-019",
        },
        {
          quote:
            "El cobro de anticipo para los sábados cambió todo. Los clientes valoran más la cita y nosotros ya no nos quedamos con la silla vacía esperando.",
          name: "Mateo Silva",
          role: "Head Barber",
          business: "Barbería El Galgo",
          city: "CDMX",
          ticketNo: "T-042",
        },
        {
          quote:
            "Manejar dos sucursales con 8 terapeutas era un infierno de hojas de cálculo. Ahora cada quien ve su agenda en el móvil y yo veo el negocio completo.",
          name: "Valeria Ríos",
          role: "Fundadora",
          business: "Spa & Nutrición Holística",
          city: "Monterrey",
          ticketNo: "T-088",
        },
      ],
      clientLogos: [
        "Clínica San Lucas",
        "Barbería El Galgo",
        "Aura Med Spa",
        "Nutrición Activa",
        "Studio 9 Salón",
        "Fisioterapia Del Valle",
      ],
    },
    pricing: {
      badge: "Boletos de acceso",
      title: "Precios directos. Elige tu boleto.",
      subtitle:
        "Sin comisiones sorpresa por cita. Todos los planes incluyen 14 días de prueba completa.",
      monthly: "Mensual",
      annual: "Anual",
      discountBadge: "Ahorra 20%",
      cta: "Empieza gratis",
      plans: [
        {
          id: "starter",
          name: "Starter",
          priceMonthly: "$29",
          priceAnnual: "$23",
          period: "/mes",
          desc: "Ideal para consultorios individuales, barberos y terapeutas independientes.",
          highlight: false,
          features: [
            { label: "Sucursales", value: "1 sucursal" },
            { label: "Servicios", value: "Ilimitados" },
            { label: "WhatsApp/SMS", value: "100 / mes" },
            { label: "Página de reservas", value: "negocio.agendur.app" },
            { label: "Pagos en línea", value: "Opcional" },
            { label: "Reportes", value: "Básicos" },
            { label: "Soporte", value: "Por correo" },
          ],
        },
        {
          id: "pro",
          name: "Pro",
          priceMonthly: "$59",
          priceAnnual: "$47",
          period: "/mes",
          desc: "Para negocios consolidados con equipo de especialistas y alta demanda.",
          highlight: true,
          badge: "Boleto más elegido",
          features: [
            { label: "Sucursales", value: "Hasta 3 sucursales" },
            { label: "Servicios", value: "Ilimitados" },
            { label: "WhatsApp/SMS", value: "500 / mes" },
            { label: "Página de reservas", value: "Personalizada + QR" },
            { label: "Pagos en línea", value: "Anticipos y total" },
            { label: "Reportes", value: "Completos y exportables" },
            { label: "Soporte", value: "Prioritario por WhatsApp" },
          ],
        },
        {
          id: "business",
          name: "Business",
          priceMonthly: "$119",
          priceAnnual: "$95",
          period: "/mes",
          desc: "Para franquicias, cadenas y clínicas con múltiples ubicaciones activas.",
          highlight: false,
          features: [
            { label: "Sucursales", value: "Ilimitadas" },
            { label: "Servicios", value: "Ilimitados" },
            { label: "WhatsApp/SMS", value: "Ilimitados" },
            { label: "Página de reservas", value: "Marca blanca" },
            { label: "Pagos en línea", value: "Múltiples cuentas Stripe" },
            { label: "Reportes", value: "Avanzados multi-sede" },
            { label: "Soporte", value: "Asesor dedicado 24/7" },
          ],
        },
      ],
    },
    faq: {
      badge: "Sin vueltas",
      title: "Preguntas frecuentes",
      subtitle:
        "Respuestas directas antes de que comiences tus 14 días sin costo.",
      items: [
        {
          q: "¿Necesito tarjeta para probarlo?",
          a: "No. Puedes activar tu cuenta y comenzar a agendar de inmediato sin ingresar ningún dato bancario ni tarjeta de crédito.",
        },
        {
          q: "¿Puedo tener varias sucursales con un solo plan?",
          a: "Sí. El plan Pro incluye hasta 3 sucursales con horarios y equipo independiente, y el plan Business te permite conectar sucursales ilimitadas bajo la misma administración.",
        },
        {
          q: "¿Cómo llegan los recordatorios a mis clientes?",
          a: "Llegan directamente como mensajes oficiales a su WhatsApp o SMS con los datos exactos del turno, mapa de llegada y botón para confirmar o avisar con anticipación.",
        },
        {
          q: "¿Puedo cambiar de plan o cancelar cuando quiera?",
          a: "Sí, sin contratos forzosos ni penalizaciones. Puedes subir de nivel, bajar o cancelar tu suscripción con un solo clic desde tu panel de configuración.",
        },
        {
          q: "¿Mis datos y los de mis clientes están seguros?",
          a: "Totalmente. Utilizamos infraestructura cifrada de grado bancario, copias de seguridad continuas y cumplimiento estricto de privacidad para tus clientes.",
        },
      ],
    },
    cta: {
      title: "¿Seguimos perdiendo citas o las ordenamos?",
      subtitle:
        "Tus clientes quieren agendar ahora mismo. Dales el link y llena tu calendario.",
      button: "Reclama tus 14 días gratis",
      note: "Sin tarjeta · Listo en 5 minutos · Cancela cuando quieras",
    },
    footer: {
      tagline:
        "Software de agendamiento para clínicas, barberías, spas y consultorios que valoran su tiempo.",
      columns: {
        product: {
          title: "Producto",
          links: [
            "Página de reservas",
            "Multi-sucursal",
            "Recordatorios WhatsApp",
            "Cobro de anticipos",
            "Reportes",
          ],
        },
        industries: {
          title: "Industrias",
          links: [
            "Clínicas dentales",
            "Barberías",
            "Spas & estética",
            "Nutriólogos",
            "Consultorios médicos",
          ],
        },
        company: {
          title: "Empresa",
          links: ["Acerca de", "Contacto", "Blog", "Prensa"],
        },
        legal: {
          title: "Legal",
          links: ["Privacidad", "Términos de servicio", "Seguridad"],
        },
      },
      langLabel: "Idioma:",
      copyright: "© 2026 Agendur Inc. Todos los derechos reservados.",
    },
  },
  en: {
    priceTitle: "A plan that fits.",
    nav: {
      product: "Product",
      pricing: "Pricing",
      forBusiness: "For your business",
      contact: "Contact",
      login: "Log in",
      cta: "Claim your 14-day free trial",
    },
    hero: {
      h1: "Stop chasing appointments. Let them come to you.",
      subtitle:
        "Agendur organizes your business, your locations and your reminders — you just open the door.",
      ctaPrimary: "Claim your 14-day free trial",
      ctaNote: "No card needed.",
      secondaryLink: "See how it works",
      ticketLabel: "Service ticket",
      ticketService: "Master Haircut & Beard · Downtown Branch",
      ticketStaff: "Specialist: Mateo Silva",
      ticketDate: "Today, 16:30 hrs",
      ticketDeposit: "Deposit: $150 MXN (Paid)",
      ticketStatus: "Confirmed",
      stampText: "Queue",
    },
    howItWorks: {
      badge: "Simple flow",
      title: "How it works",
      subtitle:
        "Three clear steps to run your appointment desk with zero friction.",
      steps: [
        {
          num: "1",
          title: "Register your business",
          desc: "Clinic, barbershop, spa, nutritionist, any of them.",
          industries: [
            "Clinic",
            "Barbershop",
            "Spa",
            "Nutritionist",
            "Salon",
            "Office",
          ],
        },
        {
          num: "2",
          title: "Share your link",
          desc: "They book by themselves, 24/7.",
          note: "Direct link in Instagram, WhatsApp or front-desk QR code.",
        },
        {
          num: "3",
          title: "Agendur reminds them for you",
          desc: "Fewer no-shows, zero effort.",
          note: "Automated confirmation and reminder directly to their phone.",
        },
      ],
    },
    features: {
      badge: "Key advantages",
      title: "Built for the reality of your front desk",
      subtitle:
        "Practical tools crafted for real clients walking in, not for boardroom meetings.",
      big: {
        tag: "Your public portal",
        title: "Your business, your link",
        subtitle:
          "Personalized booking page ready in seconds. No apps or downloads required for your clients.",
        url: "business.agendur.app",
        previewService: "Assessment Session",
        previewDuration: "40 min · $50 USD",
        previewAction: "Book now",
      },
      cards: [
        {
          id: "multi-branch",
          title: "Multi-location, one single dashboard",
          desc: "Coordinate branches, assign staff and manage independent schedules without ever overlapping calendars.",
          badge: "Full control",
        },
        {
          id: "reminders",
          title: "WhatsApp/SMS that actually get read",
          desc: "Automated reminders with 1-tap confirmation. Unconfirmed slots get released in time for others.",
          badge: "-30% no-shows",
        },
        {
          id: "deposits",
          title: "Collect a deposit, keep the slot secured",
          desc: "Online deposits directly to your account. Real client commitment before blocking your working hours.",
          badge: "Online payments",
        },
      ],
    },
    socialProof: {
      metrics: [
        { value: "+500", label: "businesses already use Agendur" },
        { value: "-30%", label: "reduction in no-shows" },
        { value: "12,000+", label: "monthly appointments booked" },
      ],
      testimonials: [
        {
          quote:
            "We used to lose 4 to 5 client slots each week simply because people forgot. Since reminders go through WhatsApp, sudden no-shows dropped to zero.",
          name: "Dr. Alejandro Ramos",
          role: "Dental Director",
          business: "Ramos Dental Clinic",
          city: "Guadalajara",
          ticketNo: "T-019",
        },
        {
          quote:
            "Collecting weekend deposits was a game changer. Clients respect their booking and we never end up standing around with an empty chair.",
          name: "Mateo Silva",
          role: "Head Barber",
          business: "El Galgo Barbershop",
          city: "Mexico City",
          ticketNo: "T-042",
        },
        {
          quote:
            "Managing two spas with 8 therapists used to be a spreadsheet disaster. Now everyone checks their calendar on mobile and I run the whole shop.",
          name: "Valeria Ríos",
          role: "Founder",
          business: "Holistic Spa & Nutrition",
          city: "Monterrey",
          ticketNo: "T-088",
        },
      ],
      clientLogos: [
        "San Lucas Clinic",
        "El Galgo Barbershop",
        "Aura Med Spa",
        "Active Nutrition",
        "Studio 9 Salon",
        "Del Valle Physical Therapy",
      ],
    },
    pricing: {
      badge: "Access tickets",
      title: "Transparent pricing. Pick your ticket.",
      subtitle:
        "No hidden fees per booking. All plans include a full 14-day free trial.",
      monthly: "Monthly",
      annual: "Annual",
      discountBadge: "Save 20%",
      cta: "Start for free",
      plans: [
        {
          id: "starter",
          name: "Starter",
          priceMonthly: "$29",
          priceAnnual: "$23",
          period: "/mo",
          desc: "Perfect for solo practitioners, barbers, and independent consultancies.",
          highlight: false,
          features: [
            { label: "Locations", value: "1 location" },
            { label: "Services", value: "Unlimited" },
            { label: "WhatsApp/SMS", value: "100 / mo" },
            { label: "Booking page", value: "business.agendur.app" },
            { label: "Online payments", value: "Optional" },
            { label: "Analytics", value: "Basic" },
            { label: "Support", value: "Email support" },
          ],
        },
        {
          id: "pro",
          name: "Pro",
          priceMonthly: "$59",
          priceAnnual: "$47",
          period: "/mo",
          desc: "For growing businesses with teams of specialists and high customer demand.",
          highlight: true,
          badge: "Most popular ticket",
          features: [
            { label: "Locations", value: "Up to 3 locations" },
            { label: "Services", value: "Unlimited" },
            { label: "WhatsApp/SMS", value: "500 / mo" },
            { label: "Booking page", value: "Custom + QR code" },
            { label: "Online payments", value: "Deposits & full pay" },
            { label: "Analytics", value: "Comprehensive & exportable" },
            { label: "Support", value: "Priority WhatsApp" },
          ],
        },
        {
          id: "business",
          name: "Business",
          priceMonthly: "$119",
          priceAnnual: "$95",
          period: "/mo",
          desc: "For multi-branch groups and franchises needing centralized oversight.",
          highlight: false,
          features: [
            { label: "Locations", value: "Unlimited" },
            { label: "Services", value: "Unlimited" },
            { label: "WhatsApp/SMS", value: "Unlimited" },
            { label: "Booking page", value: "White-label" },
            { label: "Online payments", value: "Multiple Stripe accounts" },
            { label: "Analytics", value: "Multi-branch intelligence" },
            { label: "Support", value: "Dedicated 24/7 advisor" },
          ],
        },
      ],
    },
    faq: {
      badge: "No fluff",
      title: "Frequently asked questions",
      subtitle: "Straight answers before you start your 14-day free trial.",
      items: [
        {
          q: "Do I need a credit card to try it?",
          a: "No. You can activate your account and start scheduling appointments immediately without entering any payment or card details.",
        },
        {
          q: "Can I manage multiple locations with one plan?",
          a: "Yes. The Pro plan includes up to 3 branches with independent staff and hours, and the Business plan allows you to link unlimited locations under one management account.",
        },
        {
          q: "How do reminders reach my clients?",
          a: "They arrive as official WhatsApp or SMS messages with exact appointment details, a location map link, and an easy button to confirm or reschedule.",
        },
        {
          q: "Can I change plans or cancel anytime?",
          a: "Yes, there are no locked contracts or hidden cancellation fees. Upgrade, downgrade, or cancel anytime with one click in your settings panel.",
        },
        {
          q: "Are my data and my clients' data safe?",
          a: "Absolutely. We use bank-grade encrypted infrastructure, continuous backups, and strict privacy controls for your customer records.",
        },
      ],
    },
    cta: {
      title: "Still losing appointments, or ready to get organized?",
      subtitle:
        "Your clients are ready to book right now. Give them your link and keep your calendar full.",
      button: "Claim your 14-day free trial",
      note: "No card needed · Ready in 5 minutes · Cancel anytime",
    },
    footer: {
      tagline:
        "Appointment software for clinics, barbershops, spas and consultancies that respect their time.",
      columns: {
        product: {
          title: "Product",
          links: [
            "Booking page",
            "Multi-location",
            "WhatsApp reminders",
            "Online deposits",
            "Analytics",
          ],
        },
        industries: {
          title: "Industries",
          links: [
            "Dental clinics",
            "Barbershops",
            "Spas & beauty",
            "Nutritionists",
            "Medical practices",
          ],
        },
        company: {
          title: "Company",
          links: ["About us", "Contact", "Blog", "Press"],
        },
        legal: {
          title: "Legal",
          links: ["Privacy", "Terms of service", "Security"],
        },
      },
      langLabel: "Language:",
      copyright: "© 2026 Agendur Inc. All rights reserved.",
    },
  },
};
