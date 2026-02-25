"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ShineBorder } from "@repo/design-system/components/ui/shine-border";
import { cn } from "@repo/design-system/lib/utils";
import { Zap } from "lucide-react";

const greetingIconClassName =
  "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#39383d] via-[#232225] to-purple-accent p-0";

type GreetingButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  className?: string;
  /** When "div", renders a non-interactive div (use when this is inside another button to avoid invalid nesting). */
  as?: "button" | "div";
};

export function GreetingButton({
  className,
  as = "button",
  ...props
}: GreetingButtonProps) {
  const resolvedClassName = cn(greetingIconClassName, className);
  const content = (
    <>
      <ShineBorder
        borderWidth={3}
        className="z-10 rounded-full"
        duration={8}
        shineColor={["#6366f1", "#a21caf", "#f472b6"]}
      />
      <Zap className="h-6 w-6" color="white" />
    </>
  );

  if (as === "div") {
    return <div className={resolvedClassName}>{content}</div>;
  }

  return (
    <Button className={resolvedClassName} {...props}>
      {content}
    </Button>
  );
}
