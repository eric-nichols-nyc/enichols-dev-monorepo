"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { ChevronLeft, Menu, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
import type { AdminNavLink } from "@/features/project-publisher/lib/get-admin-nav-link";
import { GreetingButton } from "./greeting-button";
import {
  NAV_ITEMS,
  type NavItemId,
  SIDEBAR_WIDTH,
  socialLinks,
} from "./constants";
import { SidebarBrand, SidebarBrandText } from "./sidebar-brand";

type SidebarNavLayout = "rail" | "drawer";

const NAV_ITEM_DRAWER_BASE =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors";

const NAV_ITEM_RAIL_BASE =
  "flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-colors";

const NAV_ITEM_INACTIVE_CLASS =
  "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground";

const NAV_ITEM_ACTIVE_CLASS = "bg-muted text-foreground";

const NAV_SECTION_LABEL_CLASS =
  "mb-2 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wide";

const SIDEBAR_ASIDE_CLASS =
  "bg-sidebar border-sidebar-r flex shrink-0 flex-col";

const SHELL_HEADER_CLASS =
  "flex h-[4.5rem] shrink-0 items-center border-border border-b px-3";

const SOCIAL_ICON_CLASS = "size-[1.125rem]";

export type AppSidebarNavMode = "chat" | "link";

function SidebarNavItemVisual({
  icon: Icon,
  label,
  layout,
}: {
  icon: LucideIcon;
  label: string;
  layout: SidebarNavLayout;
}) {
  return (
    <>
      <Icon className="size-4 shrink-0" />
      <span
        className={
          layout === "rail"
            ? "w-full text-center text-[10px] leading-tight"
            : "truncate"
        }
      >
        {label}
      </span>
    </>
  );
}

type SidebarNavListProps = {
  activeNavId?: NavItemId | null;
  activeAdminPath?: string | null;
  layout: SidebarNavLayout;
  navMode: AppSidebarNavMode;
  onExploreNavClick: (message: string) => void;
  adminNavLink?: AdminNavLink | null;
};

function SidebarNavList({
  activeNavId = null,
  activeAdminPath = null,
  layout,
  navMode,
  onExploreNavClick,
  adminNavLink = null,
}: SidebarNavListProps) {
  const isAdminLinkActive =
    adminNavLink !== null && activeAdminPath === adminNavLink.href;
  const itemBaseClass =
    layout === "rail" ? NAV_ITEM_RAIL_BASE : NAV_ITEM_DRAWER_BASE;

  return (
    <nav aria-label="Navigation" className="flex flex-1 flex-col overflow-y-auto p-2">
      <div className="flex-1">
        {layout === "drawer" ? (
          <p className={NAV_SECTION_LABEL_CLASS}>Explore</p>
        ) : null}
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon, message }) => {
            const isActive = navMode === "chat" && activeNavId === id;
            const itemClassName = cn(
              itemBaseClass,
              isActive ? NAV_ITEM_ACTIVE_CLASS : NAV_ITEM_INACTIVE_CLASS
            );

            return (
              <li key={id}>
                {navMode === "link" ? (
                  <Link className={itemClassName} href="/">
                    <SidebarNavItemVisual
                      icon={icon}
                      label={label}
                      layout={layout}
                    />
                  </Link>
                ) : (
                  <button
                    aria-current={isActive ? "page" : undefined}
                    className={itemClassName}
                    onClick={() => onExploreNavClick(message)}
                    type="button"
                  >
                    <SidebarNavItemVisual
                      icon={icon}
                      label={label}
                      layout={layout}
                    />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {adminNavLink ? (
        <div className="border-border mt-2 border-t pt-2">
          {layout === "drawer" ? (
            <p className={NAV_SECTION_LABEL_CLASS}>Admin</p>
          ) : null}
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                aria-current={isAdminLinkActive ? "page" : undefined}
                className={cn(
                  itemBaseClass,
                  isAdminLinkActive
                    ? NAV_ITEM_ACTIVE_CLASS
                    : NAV_ITEM_INACTIVE_CLASS
                )}
                href={adminNavLink.href}
              >
                <SidebarNavItemVisual
                  icon={Plus}
                  label={adminNavLink.label}
                  layout={layout}
                />
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
  const [mobileOpen, setMobileOpen] = useState(false);

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
        aria-label="Eric Nichols — home"
        className="flex items-center justify-center"
        href="/"
        onClick={() => setMobileOpen(false)}
      >
        <GreetingButton as="div" className="h-8 w-8 shrink-0" />
      </Link>
    ) : (
      <SidebarBrand name="Eric Nichols" onClear={onBrandClick} showText={false} />
    );

  return (
    <div className="flex h-dvh">
      <aside
        className={cn(SIDEBAR_ASIDE_CLASS, "hidden md:flex")}
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className={cn(SHELL_HEADER_CLASS, "justify-center")}>
            {sidebarHeaderBrand}
          </div>

          <SidebarNavList
            activeAdminPath={activeAdminPath}
            activeNavId={activeNavId}
            layout="rail"
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
            layout="drawer"
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
