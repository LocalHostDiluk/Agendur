      <section id="pricing" className="section-pad bg-paper">
        <div className="page-shell"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><SectionHeading eyebrow={t.pricingEyebrow} title={t.pricingTitle} /><div className="price-toggle"><button type="button" onClick={() => setAnnual(false)} className={!annual ? "is-active" : ""}>{t.monthly}</button><button type="button" onClick={() => setAnnual(true)} className={annual ? "is-active" : ""}>{t.yearly}<span>{t.save}</span></button></div></div>
          <div className="grid items-start gap-6 lg:grid-cols-3">
            {plans.map((plan, planIndex) => { const price = annual ? Math.round(plan.monthly * .8) : plan.monthly; return <article key={plan.name} className={`price-ticket ${plan.featured ? "featured" : ""}`}>{plan.featured && <span className="popular-stamp">{t.popular}</span>}<div className="p-7 md:p-8"><p className="font-display text-2xl font-semibold">{plan.name}</p><div className="mt-6 flex items-end gap-1"><span className="text-lg">$</span><span className="font-display text-6xl font-bold">{price}</span><span className="mb-2 text-mist">MXN{t.perMonth}</span></div>{annual && <p className="mt-2 text-xs text-mist">{t.billedYearly}</p>}</div><div className="ticket-divider"/><div className="p-7 md:p-8"><ul className="space-y-4">{t.featureLabels.map((label, i) => <li key={label} className="flex items-start justify-between gap-4 border-b border-dashed border-ink/20 pb-3 text-sm"><span>{label}</span><span className="text-right font-semibold">{plan.features[i] === true ? <Check className="size-4 text-mint"/> : plan.features[i] === false ? "—" : plan.features[i]}</span></li>)}</ul><TicketButton className={`mt-7 w-full ${plan.featured ? "bg-flame text-ink" : "bg-ink text-paper"}`}>{t.start}</TicketButton></div></article> })}
          </div>
        </div>
      </section>


      @import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: 0; --radius-md: 0; --radius-lg: 0; --radius-xl: 0;
  --font-display: "Bricolage Grotesque", sans-serif;
  --font-sans: "Inter", sans-serif;
  --font-mono-ticket: "Space Mono", monospace;
  --color-background: var(--background); --color-foreground: var(--foreground);
  --color-card: var(--card); --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover); --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive); --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);
  --color-paper: var(--paper); --color-ink: var(--ink); --color-grape: var(--grape);
  --color-flame: var(--flame); --color-mint: var(--mint); --color-mist: var(--mist);
}

:root {
  --radius: 0; --paper: oklch(0.94 0.025 87); --ink: oklch(0.19 0.025 310);
  --grape: oklch(0.52 0.15 305); --flame: oklch(0.68 0.22 35); --mint: oklch(0.7 0.13 161); --mist: oklch(0.58 0.025 79);
  --background: var(--paper); --foreground: var(--ink); --card: var(--paper); --card-foreground: var(--ink);
  --popover: var(--paper); --popover-foreground: var(--ink); --primary: var(--grape); --primary-foreground: var(--paper);
  --secondary: var(--flame); --secondary-foreground: var(--ink); --muted: oklch(0.89 0.025 87); --muted-foreground: var(--mist);
  --accent: var(--mint); --accent-foreground: var(--ink); --destructive: var(--flame); --destructive-foreground: var(--ink);
  --border: var(--ink); --input: var(--mist); --ring: var(--grape);
}

@layer base {
  * { border-color: var(--color-border); }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--font-sans); letter-spacing: 0; }
  h1,h2,h3,p { margin: 0; }
  a,button { transition: color 160ms ease, background-color 160ms ease, transform 160ms ease; }
  :focus-visible { outline: 3px solid var(--flame); outline-offset: 3px; }
}

@utility page-shell { width: min(1180px, calc(100% - 2.5rem)); margin-inline: auto; }
@utility section-pad { padding-block: clamp(5rem, 9vw, 8rem); }
@utility font-display { font-family: var(--font-display); }

.brand-mark { display:inline-flex; align-items:center; gap:.15rem; font-family:var(--font-display); font-size:1.65rem; font-weight:700; }
.brand-mark span { display:grid; place-items:center; width:2rem; height:2rem; color:var(--paper); background:var(--grape); clip-path:polygon(0 0,100% 0,100% 72%,72% 100%,0 100%); }
.nav-link { font-size:.9rem; font-weight:600; border-bottom:2px solid transparent; padding-block:.3rem; }
.nav-link:hover { border-color:var(--flame); }
.ticket-button { clip-path:polygon(0 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px,14px 0); }
.ticket-button:hover { transform:translateY(-2px); }
.language-switch { display:inline-flex; border:1px solid; }
.language-switch button { padding:.45rem .6rem; font-size:.7rem; font-weight:700; cursor:pointer; }
.eyebrow { margin-bottom:1rem; font-size:.78rem; font-weight:700; text-transform:none; }
.section-title { max-width:760px; font-family:var(--font-display); font-size:clamp(2.8rem,6vw,5.6rem); font-weight:700; line-height:.98; letter-spacing:-.035em; }
.hero-title { font-family:var(--font-display); font-size:clamp(3.5rem,7.5vw,7rem); font-weight:700; line-height:.9; letter-spacing:-.045em; }
.hero-ticket { clip-path:polygon(0 0,100% 0,100% 100%,0 100%,0 92%,4% 90%,0 88%,0 76%,4% 74%,0 72%,0 60%,4% 58%,0 56%,0 44%,4% 42%,0 40%,0 28%,4% 26%,0 24%,0 12%,4% 10%,0 8%); }
.turn-number { font-family:var(--font-mono-ticket); font-size:clamp(5rem,12vw,8.5rem); font-weight:700; line-height:1; }
.perforation { position:relative; border-top:2px dashed currentColor; opacity:.45; }
.perforation::before,.perforation::after { content:""; position:absolute; top:50%; width:.55rem; height:.55rem; border-radius:50%; background:currentColor; transform:translateY(-50%); }
.perforation::before { left:-.25rem; } .perforation::after { right:-.25rem; }
.riso-orbit { position:absolute; width:58%; aspect-ratio:1; border-radius:50%; mix-blend-mode:multiply; }
.riso-orbit-grape { left:0; top:0; background:var(--grape); } .riso-orbit-flame { right:0; bottom:0; background:var(--flame); }
.hero-stamp { position:absolute; right:2%; top:2%; display:grid; place-items:center; width:7.5rem; aspect-ratio:1; border:3px solid var(--ink); border-radius:50%; background:var(--flame); color:var(--ink); font-weight:800; transform:rotate(9deg); mix-blend-mode:multiply; }
.step-item { position:relative; min-height:320px; border-bottom:2px solid var(--ink); }
.step-item:last-child { border-bottom:0; }
.step-number { display:grid; place-items:center; width:4rem; aspect-ratio:1; border-radius:50%; font-family:var(--font-display); font-size:1.3rem; font-weight:700; }
.industry-icon { display:grid; place-items:center; width:2rem; aspect-ratio:1; border:1px solid var(--ink); border-radius:50%; }
.bento-grid { display:grid; gap:1rem; }
.bento-item { min-height:280px; padding:2rem; display:flex; flex-direction:column; justify-content:space-between; background:var(--paper); color:var(--ink); }
.bento-1 { min-height:420px; clip-path:polygon(0 0,100% 0,100% calc(100% - 42px),calc(100% - 42px) 100%,0 100%); }
.bento-2 { clip-path:polygon(0 0,calc(100% - 32px) 0,100% 32px,100% 100%,0 100%); background:var(--flame); }
.bento-3 { position:relative; background:var(--mint); } .bento-3::after { content:""; position:absolute; right:-1px; top:-1px; width:42px; height:42px; border-radius:0 0 0 100%; background:var(--grape); }
.bento-4 { clip-path:polygon(32px 0,100% 0,100% 100%,0 100%,0 32px); }
.bento-icon { display:grid; place-items:center; width:3.2rem; aspect-ratio:1; border:2px solid currentColor; border-radius:50%; }
.metrics-strip { border-block:2px dashed var(--paper); }
.metrics-strip p { padding:1.5rem; text-align:center; font-family:var(--font-display); font-size:1.35rem; font-weight:700; }
.testimonial { overflow:hidden; background:var(--paper); color:var(--ink); }
.testimonial img { width:100%; aspect-ratio:1.15; object-fit:cover; filter:saturate(.9); }
.testimonial-1 { clip-path:polygon(0 0,100% 0,100% calc(100% - 28px),calc(100% - 28px) 100%,0 100%); }
.testimonial-2 { clip-path:polygon(28px 0,100% 0,100% 100%,0 100%,0 28px); }
.testimonial-3 { clip-path:polygon(0 0,calc(100% - 28px) 0,100% 28px,100% 100%,0 100%); }
.client-logos { display:flex; flex-wrap:wrap; justify-content:space-between; gap:2rem; font-family:var(--font-display); font-size:1.2rem; font-weight:700; color:color-mix(in oklab,var(--paper) 55%,transparent); }
.price-toggle { display:flex; align-items:stretch; border:2px solid var(--ink); align-self:flex-start; }
.price-toggle button { padding:.75rem 1rem; font-weight:700; cursor:pointer; }
.price-toggle button.is-active { background:var(--ink); color:var(--paper); }
.price-toggle span { display:block; font-size:.62rem; font-weight:500; }
.price-ticket { position:relative; border:2px solid var(--ink); background:var(--paper); clip-path:polygon(0 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%); }
.price-ticket.featured { border:4px solid var(--flame); }
.ticket-divider { height:18px; background:radial-gradient(circle at 0 50%,var(--paper) 0 8px,transparent 9px),radial-gradient(circle at 100% 50%,var(--paper) 0 8px,transparent 9px); border-top:2px dashed var(--ink); }
.popular-stamp { position:absolute; z-index:2; right:-.3rem; top:-1.2rem; display:grid; place-items:center; width:5.2rem; aspect-ratio:1; border-radius:50%; background:var(--flame); font-size:.68rem; font-weight:800; text-align:center; transform:rotate(8deg); }
.faq-trigger { width:100%; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; padding-block:1.5rem; text-align:left; font-family:var(--font-display); font-size:1.2rem; font-weight:650; cursor:pointer; }
.faq-seal { position:relative; flex:0 0 auto; display:grid; place-items:center; width:2.7rem; aspect-ratio:1; border:2px solid currentColor; border-radius:50%; transition:transform 200ms ease; }
.faq-trigger[data-state="open"] .faq-seal { transform:rotate(45deg); }

@media (min-width:768px) {
  .step-item { border-bottom:0; border-right:2px dashed var(--ink); } .step-item:last-child { border-right:0; }
  .metrics-strip p + p { border-left:1px dashed var(--paper); }
}
@media (min-width:1024px) {
  .bento-grid { grid-template-columns:1.2fr .8fr .8fr; grid-template-rows:1fr 1fr; }
  .bento-1 { grid-row:span 2; } .bento-4 { grid-column:span 2; }
}
@media (max-width:640px) { .page-shell { width:min(100% - 1.5rem,1180px); } .hero-stamp { width:5.5rem; right:0; } .section-title { font-size:2.7rem; } }
@media (prefers-reduced-motion:reduce) { html { scroll-behavior:auto; } *,*::before,*::after { animation-duration:.01ms!important; transition-duration:.01ms!important; } }
