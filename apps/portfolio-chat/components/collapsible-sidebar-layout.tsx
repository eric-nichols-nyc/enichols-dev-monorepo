"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@repo/design-system/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { usePortfolioChat } from "@/contexts/chat-context";
import { useActiveNavSection } from "@/hooks/use-active-nav-section";
import {
  NAV_ITEMS,
  type NavItemId,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  socialLinks,
} from "./constants";
import { Chat } from "./chat";
import { SidebarBrand, SidebarBrandText } from "./sidebar-brand";
import { SidebarLogo } from "./sidebar-logo";

const NAV_ITEM_BUTTON_BASE =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors";

/** P5 inactive + hover; active tier (R20) used when P3 sets activeNavId */
const NAV_ITEM_INACTIVE_CLASS =
  "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground";

const NAV_ITEM_ACTIVE_CLASS = "bg-muted text-foreground";

const NAV_SECTION_LABEL_CLASS =
  "mb-2 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wide";

const SIDEBAR_ASIDE_CLASS =
  "bg-sidebar border-sidebar-r flex shrink-0 flex-col transition-[width] duration-200 ease-in-out";

/** Shared shell header height — sidebar brand row and main header align */
const SHELL_HEADER_CLASS =
  "flex h-[4.5rem] shrink-0 items-center border-border border-b px-3";

const SOCIAL_ICON_CLASS = "size-[1.125rem]";

type SidebarNavListProps = {
  activeNavId?: NavItemId | null;
  collapsed?: boolean;
  onNavClick: (message: string) => void;
};

function SidebarNavList({
  activeNavId = null,
  collapsed = false,
  onNavClick,
}: SidebarNavListProps) {
  return (
    <nav aria-label="Navigation" className="flex-1 overflow-y-auto p-2">
      {!collapsed ? (
        <p className={NAV_SECTION_LABEL_CLASS}>Explore</p>
      ) : null}
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon, message }) => {
          const isActive = activeNavId === id;

          return (
            <li key={id}>
              <button
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                className={cn(
                  NAV_ITEM_BUTTON_BASE,
                  isActive ? NAV_ITEM_ACTIVE_CLASS : NAV_ITEM_INACTIVE_CLASS
                )}
                onClick={() => onNavClick(message)}
                title={collapsed ? label : undefined}
                type="button"
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function CollapsibleSidebarLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingNavId, setPendingNavId] = useState<NavItemId | null>(null);
  const { clearMessages, messages, sendMessage } = usePortfolioChat();
  const activeNavFromMessages = useActiveNavSection(messages);
  const activeNavId = pendingNavId ?? activeNavFromMessages;

  useEffect(() => {
    if (activeNavFromMessages) {
      setPendingNavId(null);
    }
  }, [activeNavFromMessages]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  const sidebarWidth = collapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  const handleClear = useCallback(() => {
    setPendingNavId(null);
    clearMessages();
  }, [clearMessages]);

  const handleNavClick = useCallback(
    (message: string) => {
      const item = NAV_ITEMS.find((navItem) => navItem.message === message);
      if (item) {
        setPendingNavId(item.id);
      }
      sendMessage({ text: message, files: [] });
      setMobileOpen(false);
    },
    [sendMessage]
  );

  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <aside
        className={cn(SIDEBAR_ASIDE_CLASS, "hidden md:flex")}
        style={{ width: sidebarWidth }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div
            className={cn(
              SHELL_HEADER_CLASS,
              collapsed ? "flex-col justify-center gap-2" : "justify-between gap-2"
            )}
          >
            <SidebarBrand
              collapsed={collapsed}
              name="Eric Nichols"
              onClear={handleClear}
            />
            <button
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={toggle}
              type="button"
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </button>
          </div>

          <SidebarNavList
            activeNavId={activeNavId}
            collapsed={collapsed}
            onNavClick={handleNavClick}
          />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          SIDEBAR_ASIDE_CLASS,
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 md:hidden"
        )}
        style={{
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex h-full flex-col">
          <div className={cn(SHELL_HEADER_CLASS, "justify-between gap-2")}>
            <div className="flex min-w-0 items-center gap-2">
              <SidebarLogo />
              <SidebarBrandText name="Eric Nichols" />
            </div>
            <button
              aria-label="Close menu"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
          <SidebarNavList
            activeNavId={activeNavId}
            onNavClick={handleNavClick}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header
          className={cn(
            SHELL_HEADER_CLASS,
            "sticky top-0 z-10 justify-between bg-background px-4 md:justify-end"
          )}
        >
          <button
            aria-expanded={mobileOpen}
            aria-label="Open menu"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <Menu className="size-5" />
          </button>
          <nav
            aria-label="Social links"
            className="flex items-center gap-2 md:ml-0"
          >
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <Link
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-foreground"
                href={href}
                key={label}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon className={SOCIAL_ICON_CLASS} />
              </Link>
            ))}
          </nav>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Chat />
        </div>
      </div>
    </div>
  );
}
