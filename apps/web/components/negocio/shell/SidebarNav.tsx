"use client";

import Link from "next/link";
import { navModules } from "@/lib/utils/shell-navigation";

export interface SidebarNavProps {
  pathname: string;
  isCollapsed: boolean;
  onClose?: () => void;
}

export function SidebarNav({
  pathname,
  isCollapsed,
  onClose,
}: SidebarNavProps) {
  return (
    <nav className="space-y-1" aria-label="Módulos de navegación">
      {navModules.map((item) => {
        if (item.disabled) {
          return (
            <div
              key={item.name}
              className="group relative flex items-center gap-x-3 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed select-none px-3 py-2.5 h-10 w-full text-[#A79FAE]"
              aria-disabled="true"
            >
              <item.icon
                className="w-5 h-5 shrink-0 text-[#A79FAE]"
                strokeWidth={1.75}
              />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out flex items-center gap-2 ${
                  isCollapsed
                    ? "max-w-[160px] md:max-w-0 md:opacity-0 md:-translate-x-1 md:pointer-events-none"
                    : "max-w-[160px] opacity-100 translate-x-0"
                }`}
              >
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-[#A79FAE]">
                    {item.badge}
                  </span>
                )}
              </span>
              {isCollapsed && (
                <div className="hidden md:flex absolute left-full ml-3 px-2.5 py-1.5 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 items-center gap-1.5 font-sans font-normal">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-[#A79FAE]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        }

        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`group relative flex items-center gap-x-3 rounded-lg text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#B99CE8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#110D15] px-3 py-2.5 h-10 w-full ${
              isActive
                ? "border-l-[3px] border-grape bg-grape-soft text-sidebar-text font-semibold"
                : "border-l-[3px] border-transparent text-[#A79FAE] hover:bg-white/[0.04] hover:text-sidebar-text"
            }`}
            aria-label={item.name}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon
              className={`w-5 h-5 shrink-0 transition-colors ${
                isActive
                  ? "text-sidebar-text"
                  : "text-[#A79FAE] group-hover:text-sidebar-text"
              }`}
              strokeWidth={isActive ? 2 : 1.75}
            />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out flex items-center justify-between gap-2 flex-1 ${
                isCollapsed
                  ? "max-w-[160px] md:max-w-0 md:opacity-0 md:-translate-x-1 md:pointer-events-none"
                  : "max-w-[160px] opacity-100 translate-x-0"
              }`}
            >
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-grape/25 text-[#D1BEE8] border border-grape/30 leading-none">
                  {item.badge}
                </span>
              )}
            </span>
            {isCollapsed && (
              <div className="hidden md:flex absolute left-full ml-3 px-2.5 py-1.5 bg-[#17121B] border border-white/10 text-xs text-[#F1ECE2] rounded-md shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 items-center gap-1.5 font-sans font-normal">
                <span>{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-grape/25 text-[#D1BEE8] border border-grape/30 leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
