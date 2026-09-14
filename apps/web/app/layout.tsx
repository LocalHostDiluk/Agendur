import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SileoToaster } from "@/components/theme/SileoToaster";
import { PrelineScript } from "@/components/theme/PrelineScript";
import "sileo/styles.css";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Agendur - Software de Citas y Reservaciones para PyMEs y Múltiples Sucursales",
  description:
    "Permite a tus clientes agendar citas online 24/7 en cualquiera de tus sucursales. Reduce ausencias con recordatorios automáticos de WhatsApp y cobra anticipos en línea.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${inter.variable} ${spaceMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary font-sans transition-colors duration-200">
        <ThemeProvider>
          {children}
          <SileoToaster />
          <PrelineScript />
        </ThemeProvider>
      </body>
    </html>
  );
}
