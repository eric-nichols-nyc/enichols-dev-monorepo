"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebarShell } from "@/components/app-sidebar-shell";

type AdminSidebarLayoutProps = {
  children: ReactNode;
  showAdminNav: boolean;
};

export function AdminSidebarLayout({
  children,
  showAdminNav,
}: AdminSidebarLayoutProps) {
  const pathname = usePathname();

  return (
    <AppSidebarShell
      activeAdminPath={pathname}
      navMode="link"
      onBrandClick={() => undefined}
      onExploreNavClick={() => undefined}
      showAdminNav={showAdminNav}
    >
      {children}
    </AppSidebarShell>
  );
}
