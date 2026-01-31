"use client";

import { GreetingButton } from "./greeting-button";

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
      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent p-0"
      onClick={onClear}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClear();
        }
      }}
      tabIndex={0}
      type="button"
    >
      <GreetingButton
        aria-label="Clear chat and start fresh"
        className="h-8 w-8"
      />
      {!collapsed && (
        <span className="truncate font-semibold text-lg">{name}</span>
      )}
    </button>
  );
}
