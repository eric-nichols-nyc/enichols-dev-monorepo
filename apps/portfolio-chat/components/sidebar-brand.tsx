"use client";

import { GreetingButton } from "./greeting-button";
import { SIDEBAR_BRAND_SUBTITLE } from "./constants";

type SidebarBrandTextProps = {
  name: string;
  subtitle?: string;
};

export function SidebarBrandText({
  name,
  subtitle = SIDEBAR_BRAND_SUBTITLE,
}: SidebarBrandTextProps) {
  return (
    <span className="min-w-0 text-left">
      <span className="block truncate font-semibold text-lg">{name}</span>
      <span className="block truncate text-muted-foreground text-xs">
        {subtitle}
      </span>
    </span>
  );
}

type SidebarBrandProps = {
  collapsed?: boolean;
  name: string;
  onClear: () => void;
};

export function SidebarBrand({
  collapsed = false,
  name,
  onClear,
}: SidebarBrandProps) {
  return (
    <button
      aria-label="Clear chat and start fresh"
      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
      onClick={onClear}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClear();
        }
      }}
      tabIndex={0}
      type="button"
    >
      <GreetingButton as="div" className="h-8 w-8 shrink-0" />
      {!collapsed ? <SidebarBrandText name={name} /> : null}
    </button>
  );
}
