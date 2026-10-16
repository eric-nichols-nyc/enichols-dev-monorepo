"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { PortfolioMark } from "@/features/branding/components/portfolio-mark";

const greetingIconClassName =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-transparent p-0 text-foreground shadow-none";

type GreetingButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  className?: string;
  /** When "div", renders a non-interactive div (use when this is inside another button to avoid invalid nesting). */
  as?: "button" | "div";
};

export function GreetingButton({ className, as = "button", ...props }: GreetingButtonProps) {
  const resolvedClassName = cn(greetingIconClassName, className);
  const content = <PortfolioMark />;

  if (as === "div") {
    return <div className={resolvedClassName}>{content}</div>;
  }

  return (
    <Button variant="ghost" className={resolvedClassName} {...props}>
      {content}
    </Button>
  );
}
