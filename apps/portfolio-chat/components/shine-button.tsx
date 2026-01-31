"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ShineBorder } from "@repo/design-system/components/ui/shine-border";
import { cn } from "@repo/design-system/lib/utils";

type ShineButtonProps = {
  children: React.ReactNode;
  className?: string;
  border?: number;
  colors?: string[];
  onClick: () => void;
};

export function ShineButton({
  border = 2,
  colors = ["#6366f1", "#000", "#fff"],
  children,
  className,
  onClick,
}: ShineButtonProps) {
  return (
    <Button
      className={cn("group relative overflow-hidden", className)}
      onClick={onClick}
      type="button"
    >
      <ShineBorder
        borderWidth={border}
        className="z-10 rounded-md"
        duration={8}
        shineColor={colors}
      />
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
