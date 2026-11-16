import Link from "next/link";

export interface LanguageSwitchProps {
  lang: "es" | "en";
  setLang: (lang: "es" | "en") => void;
  inverted?: boolean;
  className?: string;
}

export function LanguageSwitch({
  lang,
  setLang,
  inverted = false,
  className = "",
}: LanguageSwitchProps) {
  return (
    <div
      className={`language-switch font-mono text-xs ${
        inverted ? "border-paper/40" : "border-ink/30"
      } ${className}`}
      aria-label="Selector de idioma"
    >
      {(["es", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLang(item)}
          aria-label={
            item === "es"
              ? "Cambiar idioma a Español"
              : "Switch language to English"
          }
          aria-pressed={lang === item}
          className={`font-bold transition-colors cursor-pointer ${
            lang === item
              ? inverted
                ? "bg-paper text-ink"
                : "bg-ink text-paper"
              : inverted
                ? "text-paper/70 hover:text-paper hover:bg-paper/10"
                : "text-ink/70 hover:text-ink hover:bg-ink/10"
          }`}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export interface NavbarMobileDrawerProps {
  links: readonly (readonly [string, string])[];
  lang: "es" | "en";
  setLang: (lang: "es" | "en") => void;
  loginLabel: string;
  ctaLabel: string;
  onClose: () => void;
}

export function NavbarMobileDrawer({
  links,
  lang,
  setLang,
  loginLabel,
  ctaLabel,
  onClose,
}: NavbarMobileDrawerProps) {
  return (
    <nav
      id="landing-mobile-menu"
      className="border-t-2 border-ink bg-paper px-5 py-5 sm:hidden"
      aria-label={lang === "en" ? "Mobile" : "Móvil"}
    >
      <div className="flex flex-col gap-4">
        {links.map(([label, href]) =>
          href.startsWith("/") ? (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="font-semibold text-ink hover:text-flame transition-colors"
            >
              {label}
            </Link>
          ) : (
            <a
              key={href}
              href={href}
              onClick={onClose}
              className="font-semibold text-ink hover:text-flame transition-colors"
            >
              {label}
            </a>
          ),
        )}
        <Link
          href="/login"
          onClick={onClose}
          className="font-semibold text-ink hover:text-flame transition-colors"
        >
          {loginLabel}
        </Link>
        <LanguageSwitch
          lang={lang}
          setLang={setLang}
          className="self-start"
        />
        <Link
          href="/register"
          onClick={onClose}
          className="ticket-button inline-flex items-center justify-center rounded-none bg-flame px-6 py-4 text-center font-semibold text-ink hover:bg-flame/90"
        >
          {ctaLabel}
        </Link>
      </div>
    </nav>
  );
}
