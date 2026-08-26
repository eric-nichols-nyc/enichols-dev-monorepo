"use client";

import { ChevronLeft, ChevronRight, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import {
  NAV_ITEMS,
  type NavItemId,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  socialLinks,
} from "./constants";
import { SidebarBrand, SidebarBrandText } from "./sidebar-brand";
import { GreetingButton } from "./greeting-button";
import type { AdminNavLink } from "@/features/project-publisher/lib/get-admin-nav-link";

const NAV_ITEM_BUTTON_BASE =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors";

const NAV_ITEM_INACTIVE_CLASS =
  "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground";

const NAV_ITEM_ACTIVE_CLASS = "bg-muted text-foreground";

const NAV_SECTION_LABEL_CLASS =
  "mb-2 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wide";

const SIDEBAR_ASIDE_CLASS =
  "bg-sidebar border-sidebar-r flex shrink-0 flex-col transition-[width] duration-200 ease-in-out";

const SHELL_HEADER_CLASS =
  "flex h-[4.5rem] shrink-0 items-center border-border border-b px-3";

const SOCIAL_ICON_CLASS = "size-[1.125rem]";

export type AppSidebarNavMode = "chat" | "link";

type SidebarNavListProps = {
  activeNavId?: NavItemId | null;
  activeAdminPath?: string | null;
  collapsed?: boolean;
  navMode: AppSidebarNavMode;
  onExploreNavClick: (message: string) => void;
  adminNavLink?: AdminNavLink | null;
};

function SidebarNavList({
  activeNavId = null,
  activeAdminPath = null,
  collapsed = false,
  navMode,
  onExploreNavClick,
  adminNavLink = null,
}: SidebarNavListProps) {
  const isAdminLinkActive =
    adminNavLink !== null && activeAdminPath === adminNavLink.href;

  return (
    <nav aria-label="Navigation" className="flex flex-1 flex-col overflow-y-auto p-2">
      <div className="flex-1">
        {!collapsed ? (
          <p className={NAV_SECTION_LABEL_CLASS}>Explore</p>
        ) : null}
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, message }) => {
            const isActive = navMode === "chat" && activeNavId === id;
            const itemClassName = cn(
              NAV_ITEM_BUTTON_BASE,
              isActive ? NAV_ITEM_ACTIVE_CLASS : NAV_ITEM_INACTIVE_CLASS
            );

            return (
              <li key={id}>
                {navMode === "link" ? (
                  <Link
                    aria-label={collapsed ? label : undefined}
                    className={itemClassName}
                    href="/"
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed ? <span className="truncate">{label}</span> : null}
                  </Link>
                ) : (
                  <button
                    aria-current={isActive ? "page" : undefined}
                    aria-label={collapsed ? label : undefined}
                    className={itemClassName}
                    onClick={() => onExploreNavClick(message)}
                    title={collapsed ? label : undefined}
                    type="button"
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed ? <span className="truncate">{label}</span> : null}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {adminNavLink ? (
        <div className="border-border mt-2 border-t pt-2">
          {!collapsed ? (
            <p className={NAV_SECTION_LABEL_CLASS}>Admin</p>
          ) : null}
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                aria-current={isAdminLinkActive ? "page" : undefined}
                aria-label={collapsed ? adminNavLink.label : undefined}
                className={cn(
                  NAV_ITEM_BUTTON_BASE,
                  isAdminLinkActive
                    ? NAV_ITEM_ACTIVE_CLASS
                    : NAV_ITEM_INACTIVE_CLASS
                )}
                href={adminNavLink.href}
                title={collapsed ? adminNavLink.label : undefined}
              >
                <Plus className="size-4 shrink-0" />
                {!collapsed ? (
                  <span className="truncate">{adminNavLink.label}</span>
                ) : null}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}

type AppSidebarShellProps = {
  activeAdminPath?: string | null;
  activeNavId?: NavItemId | null;
  children: ReactNode;
  navMode: AppSidebarNavMode;
  onBrandClick: () => void;
  onExploreNavClick: (message: string) => void;
  adminNavLink?: AdminNavLink | null;
};

export function AppSidebarShell({
  activeAdminPath = null,
  activeNavId = null,
  adminNavLink = null,
  children,
  navMode,
  onBrandClick,
  onExploreNavClick,
}: AppSidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => setCollapsed((current) => !current), []);
  const sidebarWidth = collapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  const handleExploreNavClick = useCallback(
    (message: string) => {
      onExploreNavClick(message);
      setMobileOpen(false);
    },
    [onExploreNavClick]
  );

  const sidebarHeaderBrand =
    navMode === "link" ? (
      <Link
        className="flex min-w-0 flex-1 items-center gap-2"
        href="/"
        onClick={() => setMobileOpen(false)}
      >
        <GreetingButton as="div" className="h-8 w-8 shrink-0" />
        {!collapsed ? <SidebarBrandText name="Eric Nichols" /> : null}
      </Link>
    ) : (
      <SidebarBrand
        collapsed={collapsed}
        name="Eric Nichols"
        onClear={onBrandClick}
      />
    );

  return (
    <div className="flex h-dvh">
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
            {sidebarHeaderBrand}
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
            activeAdminPath={activeAdminPath}
            activeNavId={activeNavId}
            collapsed={collapsed}
            navMode={navMode}
            adminNavLink={adminNavLink}
            onExploreNavClick={handleExploreNavClick}
          />
        </div>
      </aside>

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
            <Link
              className="flex min-w-0 items-center gap-2"
              href="/"
              onClick={() => setMobileOpen(false)}
            >
              <GreetingButton as="div" className="h-8 w-8 shrink-0" />
              <SidebarBrandText name="Eric Nichols" />
            </Link>
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
            activeAdminPath={activeAdminPath}
            activeNavId={activeNavId}
            adminNavLink={adminNavLink}
            navMode={navMode}
            onExploreNavClick={handleExploreNavClick}
          />
        </div>
      </aside>

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
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
