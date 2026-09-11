import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SileoToaster } from "@/components/theme/SileoToaster";
import { PrelineScript } from "@/components/theme/PrelineScript";
import "sileo/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "CitaSync - Software de Citas y Reservaciones para PyMEs y Múltiples Sucursales",
  description:
    "Permite a tus clientes agendar citas online 24/7 en cualquiera de tus sucursales. Reduce ausencias con recordatorios automáticos de WhatsApp y cobra anticipos en línea.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
        <ThemeProvider>
          {children}
          <SileoToaster />
          <PrelineScript />
        </ThemeProvider>
      </body>
    </html>
  );
}
