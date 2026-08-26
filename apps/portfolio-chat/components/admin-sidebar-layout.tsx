"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebarShell } from "@/components/app-sidebar-shell";
import type { AdminNavLink } from "@/features/project-publisher/lib/get-admin-nav-link";

type AdminSidebarLayoutProps = {
  adminNavLink: AdminNavLink | null;
  children: ReactNode;
};

export function AdminSidebarLayout({
  adminNavLink,
  children,
}: AdminSidebarLayoutProps) {
  const pathname = usePathname();

  return (
    <AppSidebarShell
      activeAdminPath={pathname}
      adminNavLink={adminNavLink}
      navMode="link"
      onBrandClick={() => undefined}
      onExploreNavClick={() => undefined}
    >
      {children}
    </AppSidebarShell>
  );
}
