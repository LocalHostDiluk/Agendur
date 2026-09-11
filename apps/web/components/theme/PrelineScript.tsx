"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PrelineScript() {
  const pathname = usePathname();

  useEffect(() => {
    const initPreline = async () => {
      await import("preline");
      window.HSStaticMethods?.autoInit();
    };

    initPreline();
  }, [pathname]);

  return null;
}
