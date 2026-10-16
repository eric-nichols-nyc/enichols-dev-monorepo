"use client";

import { PortfolioMark } from "@/features/branding/components/portfolio-mark";

export function SidebarLogo() {
  return (
    <div aria-hidden className="flex size-10 shrink-0 items-center justify-center">
      <PortfolioMark />
    </div>
  );
}
