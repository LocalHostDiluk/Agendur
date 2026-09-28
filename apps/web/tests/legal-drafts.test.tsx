import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import TermsPage, { metadata as termsMetadata } from "@/app/(landing)/legal/terminos/page";
import PrivacyPage, { metadata as privacyMetadata } from "@/app/(landing)/legal/privacidad/page";

function render(page: React.ReactElement) {
  return renderToStaticMarkup(
    React.createElement(ThemeProvider, null, page),
  );
}

describe("borradores legales", () => {
  it("publica términos navegables sin presentarlos como vigentes", () => {
    const html = render(React.createElement(TermsPage));
    expect(html).toContain('href="/legal/terminos"');
    expect(html).toContain('href="/legal/privacidad"');
    expect(html).toContain("Por completar:");
    expect(html).toContain("Starter");
    expect(html).toContain("Pro");
    expect(html).toContain("Stripe");
    expect(html).toContain("Cloudflare Turnstile");
    expect(html).not.toContain("BORRADOR — NO VIGENTE");
    expect(html).not.toContain("Agendur Technologies Inc.");
    expect(termsMetadata.robots).toEqual({ index: false, follow: false });
  });

  it("señala los datos, proveedores y vacíos del aviso", () => {
    const html = render(React.createElement(PrivacyPage));
    expect(html).toContain('href="/legal/terminos"');
    expect(html).toContain('href="/legal/privacidad"');
    expect(html).toContain("Por completar:");
    expect(html).toContain("Supabase");
    expect(html).toContain("Cloudflare Turnstile");
    expect(html).toContain("Stripe");
    expect(html).toContain("Sentry");
    expect(html).toContain("LFPDPPP");
    expect(html).not.toContain("BORRADOR — NO VIGENTE");
    expect(privacyMetadata.robots).toEqual({ index: false, follow: false });
  });
});
