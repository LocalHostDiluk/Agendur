import Link from "next/link";
import type { Negocio } from "@/lib/types";

export interface BookingMobileHeaderProps {
  negocio: Negocio;
}

export function BookingMobileHeader({ negocio }: BookingMobileHeaderProps) {
  return (
    <header className="lg:hidden h-[72px] bg-[#1D1720] text-[#F3EEDF] px-4 flex items-center justify-between border-b border-[#F3EEDF]/10 shrink-0">
      <div className="flex items-center gap-2.5">
        {negocio.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={negocio.logo_url}
            alt={negocio.nombre_comercial}
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-grape text-white font-bricolage font-bold text-sm flex items-center justify-center">
            {negocio.nombre_comercial.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="font-bricolage text-base font-bold text-[#F3EEDF] truncate max-w-[200px]">
          {negocio.nombre_comercial}
        </span>
      </div>

      <Link
        href="/"
        className="text-xs font-medium text-[#F3EEDF]/65 hover:text-[#F3EEDF] transition-colors"
      >
        Agendur
      </Link>
    </header>
  );
}
