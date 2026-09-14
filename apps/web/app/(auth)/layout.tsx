import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthBentoGrid } from "@/components/auth/AuthBentoGrid";
import { AuthBrandProvider } from "@/components/auth/AuthBrandContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthBrandProvider>
      <div className="min-h-screen flex w-full">
        {/* Left Column - Form */}
        <div className="flex-1 lg:w-1/2 flex flex-col bg-[#F7F5EF] dark:bg-[#17121B] transition-colors duration-200">
          <header className="px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <span className="font-bricolage font-semibold text-[32px] tracking-tight text-text-primary">
                Agendur
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Inicio
              </Link>
            </div>
          </header>

          <main className="flex-1 flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-[420px]">{children}</div>
          </main>
        </div>

        {/* Right Column - Brand Panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col bg-[#17121B] relative overflow-hidden border-l border-white/5">
          <AuthBentoGrid />
        </div>
      </div>
    </AuthBrandProvider>
  );
}
