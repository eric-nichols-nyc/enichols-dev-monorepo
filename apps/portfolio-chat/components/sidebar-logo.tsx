"use client";

import { Zap } from "lucide-react";

export function SidebarLogo() {
  return (
    <div
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10"
    >
      <Zap className="size-5 animate-logo-glow text-primary" />
    </div>
  );
}
