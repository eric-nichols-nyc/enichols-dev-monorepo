import { CollapsibleSidebarLayout } from "@/components/collapsible-sidebar-layout";
import { PortfolioChatProvider } from "@/contexts/chat-context";
import { isAdminSessionActive } from "@/features/project-publisher/lib/is-admin-session-active";

const HomePage = async () => {
  const showAdminNav = await isAdminSessionActive();

  return (
    <PortfolioChatProvider>
      <CollapsibleSidebarLayout showAdminNav={showAdminNav} />
    </PortfolioChatProvider>
  );
};

export default HomePage;
