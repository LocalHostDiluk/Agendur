import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface DashboardAtajoProps {
  href: string;
  iconContainerClassName: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export function DashboardAtajo({ href, iconContainerClassName, icon, title, description }: DashboardAtajoProps) {
  return (
    <Link
      href={href}
      className="group bg-surface hover:bg-surface-alt/60 border border-border hover:border-grape/40 rounded-xl p-4 flex items-start justify-between gap-3 transition-all shadow-2xs"
    >
      <div className="flex items-start gap-3">
        <div className={iconContainerClassName}>
          {icon}
        </div>
        <div>
          <h2 className="text-xs font-semibold text-text-primary group-hover:text-grape transition-colors">
            {title}
          </h2>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-grape group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
    </Link>
  );
}
