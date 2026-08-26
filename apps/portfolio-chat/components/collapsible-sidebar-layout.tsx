"use client";

import { useCallback, useEffect, useState } from "react";
import { AppSidebarShell } from "@/components/app-sidebar-shell";
import { Chat } from "@/components/chat";
import { NAV_ITEMS, type NavItemId } from "@/components/constants";
import { usePortfolioChat } from "@/contexts/chat-context";
import { useActiveNavSection } from "@/hooks/use-active-nav-section";
import type { AdminNavLink } from "@/features/project-publisher/lib/get-admin-nav-link";

type CollapsibleSidebarLayoutProps = {
  adminNavLink?: AdminNavLink | null;
};

export function CollapsibleSidebarLayout({
  adminNavLink = null,
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
      adminNavLink={adminNavLink}
      navMode="chat"
      onBrandClick={handleClear}
      onExploreNavClick={handleExploreNavClick}
    >
      <Chat />
    </AppSidebarShell>
  );
}
