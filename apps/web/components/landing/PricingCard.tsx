import { Check } from "lucide-react";

export interface PricingPlan {
  name: string;
  detail: string;
  price: number | null;
  features: string[];
}

export interface PricingCardProps {
  plan: PricingPlan;
  index: number;
  annual: boolean;
  lang: "es" | "en";
}

export function PricingCard({ plan, index, annual, lang }: PricingCardProps) {
  return (
    <article className={`plan-ticket p-${index}`}>
      <div className="plan-head">
        <div className="plan-title-row">
          <span className="plan-name">{plan.name}</span>
          {index === 1 && (
            <span className="popular">
              {lang === "en" ? "Most popular" : "Más elegido"}
            </span>
          )}
        </div>
        <p>{plan.detail}</p>
        {plan.price === null ? (
          <div className="price">
            <strong>
              {lang === "en" ? "Contact the team" : "Contacta al equipo"}
            </strong>
          </div>
        ) : (
          <div className="price">
            <small>$</small>
            <strong>
              {annual ? Math.round(plan.price * 0.8) : plan.price}
            </strong>
            <span>{lang === "en" ? " / mo" : " / mes"}</span>
          </div>
        )}
      </div>
      <div className="perforation">
        <i />
        <span>{lang === "en" ? "Includes:" : "Incluye:"}</span>
        <i />
      </div>
      <ul>
        {plan.features.map((f) => (
          <li key={f}>
            <Check size={16} strokeWidth={1.75} />
            {f}
          </li>
        ))}
      </ul>
      <a
        className="outline-button"
        href={plan.price === null ? "#contacto" : "/register"}
      >
        {plan.price === null
          ? lang === "en"
            ? "Contact the team"
            : "Contacta al equipo"
          : lang === "en"
            ? "Start for free"
            : "Empieza gratis"}
      </a>
    </article>
  );
}
