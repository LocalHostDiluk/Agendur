import { describe, expect, it } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import TermsPage, { metadata as termsMetadata } from "@/app/(landing)/terminos/page";
import PrivacyPage, { metadata as privacyMetadata } from "@/app/(landing)/privacidad/page";

function render(page: React.ReactElement) {
  return renderToStaticMarkup(
    React.createElement(ThemeProvider, null, page),
  );
}

describe("borradores legales", () => {
  it("publica términos navegables sin presentarlos como vigentes", () => {
    const html = render(React.createElement(TermsPage));
    expect(html).toContain('href="/terminos"');
    expect(html).toContain('href="/privacidad"');
    expect(html).toContain("BORRADOR — NO VIGENTE");
    expect(html).toContain("nombre o razón social del operador");
    expect(html).not.toContain("CitaSync Technologies Inc.");
    expect(termsMetadata.robots).toEqual({ index: false, follow: false });
  });

  it("señala los datos, proveedores y vacíos del aviso", () => {
    const html = render(React.createElement(PrivacyPage));
    expect(html).toContain("BORRADOR — NO VIGENTE");
    expect(html).toContain("Supabase");
    expect(html).toContain("Cloudflare Turnstile");
    expect(html).toContain("Stripe");
    expect(html).toContain("Sentry");
    expect(html).toContain("Pendiente:");
    expect(privacyMetadata.robots).toEqual({ index: false, follow: false });
  });
});
