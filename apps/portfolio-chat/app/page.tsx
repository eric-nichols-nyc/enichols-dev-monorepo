import { PortfolioChatProvider } from "@/contexts/chat-context";
import { CollapsibleSidebarLayout } from "@/components/collapsible-sidebar-layout";

const HomePage = () => (
  <PortfolioChatProvider>
    <CollapsibleSidebarLayout />
  </PortfolioChatProvider>
);

export default HomePage;
