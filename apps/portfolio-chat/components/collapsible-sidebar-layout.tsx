"use client";

import { useCallback, useEffect, useState } from "react";
import { AppSidebarShell } from "@/components/app-sidebar-shell";
import { Chat } from "@/components/chat";
import { NAV_ITEMS, type NavItemId } from "@/components/constants";
import { usePortfolioChat } from "@/contexts/chat-context";
import { useActiveNavSection } from "@/hooks/use-active-nav-section";

type CollapsibleSidebarLayoutProps = {
  showAdminNav?: boolean;
};

export function CollapsibleSidebarLayout({
  showAdminNav = false,
}: CollapsibleSidebarLayoutProps) {
  const [pendingNavId, setPendingNavId] = useState<NavItemId | null>(null);
  const { clearMessages, messages, sendMessage } = usePortfolioChat();
  const activeNavFromMessages = useActiveNavSection(messages);
  const activeNavId = pendingNavId ?? activeNavFromMessages;

  useEffect(() => {
    if (activeNavFromMessages) {
      setPendingNavId(null);
    }
  }, [activeNavFromMessages]);

  const handleClear = useCallback(() => {
    setPendingNavId(null);
    clearMessages();
  }, [clearMessages]);

  const handleExploreNavClick = useCallback(
    (message: string) => {
      const item = NAV_ITEMS.find((navItem) => navItem.message === message);
      if (item) {
        setPendingNavId(item.id);
      }
      sendMessage({ text: message, files: [] });
    },
    [sendMessage]
  );

  return (
    <AppSidebarShell
      activeNavId={activeNavId}
      navMode="chat"
      onBrandClick={handleClear}
      onExploreNavClick={handleExploreNavClick}
      showAdminNav={showAdminNav}
    >
      <Chat />
    </AppSidebarShell>
  );
}
