import type { ReactNode } from "react";
import { cn } from "@repo/design-system/lib/utils";

type SplitLayoutProperties = {
  readonly left: ReactNode;
  readonly right: ReactNode;
  readonly className?: string;
  readonly leftClassName?: string;
  readonly rightClassName?: string;
};

export const SplitLayout = ({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
}: SplitLayoutProperties) => (
  <div
    className={cn(
      "flex min-h-[calc(100vh-4rem)] flex-col gap-4 p-4 lg:flex-row",
      className
    )}
  >
    <div
      className={cn(
        "flex flex-1 flex-col overflow-auto rounded-lg border bg-card p-6",
        leftClassName
      )}
    >
      {left}
    </div>
    <div
      className={cn(
        "flex flex-1 flex-col overflow-auto rounded-lg border bg-card p-6",
        rightClassName
      )}
    >
      {right}
    </div>
  </div>
);

