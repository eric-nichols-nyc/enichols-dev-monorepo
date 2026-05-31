"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { usePortfolioChat } from "@/contexts/chat-context";
import {
  NAV_ITEMS,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  socialLinks,
} from "./constants";
import { Chat } from "./chat";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarLogo } from "./sidebar-logo";

const NAV_ITEM_BUTTON_CLASS =
  "flex w-full items-center gap-3 rounded-lg bg-muted/30 px-3 py-2 text-left text-foreground text-sm transition-colors hover:bg-muted";

export function CollapsibleSidebarLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clearMessages, sendMessage } = usePortfolioChat();

  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  const sidebarWidth = collapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;
  const handleNavClick = useCallback(
    (message: string) => {
      sendMessage({ text: message, files: [] });
      setMobileOpen(false);
    },
    [sendMessage]
  );

  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <aside
        className="bg-sidebar hidden shrink-0 flex-col border-border border-r transition-[width] duration-200 ease-in-out md:flex"
        style={{ width: sidebarWidth }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div
            className={`flex shrink-0 items-center border-border border-b p-3 ${
              collapsed ? "flex-col gap-2" : "justify-between gap-2"
            }`}
          >
            <SidebarBrand
              collapsed={collapsed}
              name="Eric Nichols"
              onClear={clearMessages}
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

          <nav aria-label="Navigation" className="flex-1 overflow-y-auto p-2">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon, message }) => (
                <li key={id}>
                  <button
                    aria-label={collapsed ? label : ""}
                    className={NAV_ITEM_BUTTON_CLASS}
                    onClick={() => handleNavClick(message)}
                    title={collapsed ? label : ""}
                    type="button"
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
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
        className="bg-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-border border-r transition-transform duration-200 md:hidden"
        style={{
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-border border-b p-3">
            <div className="flex items-center gap-2">
              <SidebarLogo />
              <span className="font-semibold text-lg">Eric Nichols</span>
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
          <nav aria-label="Navigation" className="flex-1 overflow-y-auto p-2">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon, message }) => (
                <li key={id}>
                  <button
                    className={NAV_ITEM_BUTTON_CLASS}
                    onClick={() => handleNavClick(message)}
                    type="button"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-border border-b bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              aria-expanded={mobileOpen}
              aria-label="Open menu"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Menu className="size-5" />
            </button>
            <nav aria-label="Social links" className="flex items-center gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  aria-label={label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href={href}
                  key={label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="size-5" />
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Chat />
        </div>
      </div>
    </div>
  );
}
