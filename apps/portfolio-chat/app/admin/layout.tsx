import type { ReactNode } from "react";
import { AdminSidebarLayout } from "@/components/admin-sidebar-layout";
import { isAdminSessionActive } from "@/features/project-publisher/lib/is-admin-session-active";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const showAdminNav = await isAdminSessionActive();

  return (
    <AdminSidebarLayout showAdminNav={showAdminNav}>
      {children}
    </AdminSidebarLayout>
  );
}
