import type { ReactNode } from "react";
import { AdminSidebarLayout } from "@/components/admin-sidebar-layout";
import { getAdminNavLink } from "@/features/project-publisher/lib/get-admin-nav-link";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const adminNavLink = await getAdminNavLink();

  return (
    <AdminSidebarLayout adminNavLink={adminNavLink}>{children}</AdminSidebarLayout>
  );
}
