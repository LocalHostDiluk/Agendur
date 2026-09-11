"use client";

import { useCallback, useState } from "react";
import { Sidebar } from "@/components/negocio/Sidebar";
import { Header } from "@/components/negocio/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default function NegocioLayout({ children }: LayoutProps<"/">) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-800 dark:text-neutral-200 transition-colors duration-200">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuToggle={toggleSidebar} />
          <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
