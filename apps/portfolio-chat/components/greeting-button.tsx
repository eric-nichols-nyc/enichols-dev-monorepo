"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ShineBorder } from "@repo/design-system/components/ui/shine-border";
import { cn } from "@repo/design-system/lib/utils";
import { Zap } from "lucide-react";

type GreetingButtonProps = {
  className?: string;
};

export function GreetingButton({ className }: GreetingButtonProps) {
  return (
    <Button
      className={cn(
        "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#39383d] via-[#232225] to-purple-accent p-0",
        className
      )}
    >
      <ShineBorder
        borderWidth={3}
        className="z-10 rounded-full"
        duration={8}
        shineColor={["#6366f1", "#a21caf", "#f472b6"]}
      />
      <Zap className="h-6 w-6" color="white" />
    </Button>
  );
}
