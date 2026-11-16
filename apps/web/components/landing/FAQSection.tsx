"use client";

import React, { useRef } from "react";
import { useLandingLanguage } from "./LandingLanguageContext";

const ACCORDION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const ACCORDION_DURATION_MS = 320;

export function FAQSection() {
  const { t } = useLandingLanguage();
  const animationsRef = useRef(new WeakMap<HTMLDetailsElement, Animation>());

  const handleSummaryClick = (event: React.MouseEvent<HTMLElement>) => {
    if (
      typeof window === "undefined" ||
      typeof CSS === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (CSS.supports("interpolate-size", "allow-keywords") &&
        CSS.supports("selector(::details-content)"))
    ) {
      return;
    }

    const summary = event.currentTarget;
    const details = summary.parentElement;
    if (!(details instanceof HTMLDetailsElement)) return;

    event.preventDefault();
    animationsRef.current.get(details)?.cancel();
    details.style.overflow = "hidden";

    const borderHeight = details.offsetHeight - details.clientHeight;
    const isClosing = details.open;

    if (isClosing) {
      const startHeight = `${details.offsetHeight}px`;
      const endHeight = `${summary.offsetHeight + borderHeight}px`;
      details.dataset.closing = "true";
      const animation = details.animate(
        { height: [startHeight, endHeight] },
        { duration: ACCORDION_DURATION_MS, easing: ACCORDION_EASING },
      );
      animationsRef.current.set(details, animation);
      animation.onfinish = () => {
        details.open = false;
        delete details.dataset.closing;
        details.style.height = "";
        details.style.overflow = "";
      };
      animation.oncancel = () => {
        delete details.dataset.closing;
        details.style.height = "";
        details.style.overflow = "";
      };
      return;
    }

    const startHeight = `${details.offsetHeight}px`;
    details.style.height = startHeight;
    details.open = true;
    const contentHeight =
      details.lastElementChild instanceof HTMLElement
        ? details.lastElementChild.offsetHeight
        : 0;
    const endHeight = `${summary.offsetHeight + contentHeight + borderHeight}px`;
    const animation = details.animate(
      { height: [startHeight, endHeight] },
      { duration: ACCORDION_DURATION_MS, easing: ACCORDION_EASING },
    );
    animationsRef.current.set(details, animation);
    animation.onfinish = animation.oncancel = () => {
      details.style.height = "";
      details.style.overflow = "";
    };
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="faq-accordion landing-section-deferred bg-flame py-20 text-ink lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div>
          <p className="mb-4 text-xs font-bold">{t.faq.badge}</p>
          <h2
            id="faq-heading"
            className="font-bricolage text-5xl font-bold leading-[.98] tracking-tight text-balance sm:text-6xl"
          >
            {t.faq.title}
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-ink/75 text-pretty">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="border-t-2 border-ink">
          {t.faq.items.map((item, index) => (
            <details
              key={item.q}
              open={index === 0}
              className="group border-b-2 border-ink"
            >
              <summary
                onClick={handleSummaryClick}
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left font-bricolage text-xl font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-flame"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="relative grid size-11 shrink-0 place-items-center rounded-full border-2 border-current transition-transform duration-300 ease-out group-open:rotate-45 group-data-[closing=true]:rotate-0"
                >
                  <span className="h-0.5 w-4 bg-current" />
                  <span className="absolute h-4 w-0.5 bg-current" />
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-16 leading-relaxed text-pretty">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
