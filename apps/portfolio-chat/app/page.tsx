import { CollapsibleSidebarLayout } from "@/components/collapsible-sidebar-layout";
import { PortfolioChatProvider } from "@/contexts/chat-context";
import { getAdminNavLink } from "@/features/project-publisher/lib/get-admin-nav-link";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const adminNavLink = await getAdminNavLink();

  return (
    <PortfolioChatProvider>
      <CollapsibleSidebarLayout adminNavLink={adminNavLink} />
    </PortfolioChatProvider>
  );
};

export default HomePage;
