"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";

type TechEntry = {
  name: string;
  icon?: string;
  level?: string;
  years?: string;
};

type TechByCategory = Record<string, TechEntry[]>;

type TechStackProps = {
  tech: TechByCategory;
};

export function TechStackSkeleton() {
  return (
    <div className="w-full space-y-4">
      {[1, 2, 3].map((i) => (
        <div className="w-full space-y-2" key={i}>
          <Skeleton className="h-4 w-full" />
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton className="h-7 w-full rounded-md" key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TechStack({ tech }: TechStackProps) {
  const categories = Object.entries(tech);

  return (
    <div className="space-y-4">
      {categories.map(([category, items]) => (
        <div className="space-y-2" key={category}>
          <h3 className="font-medium text-muted-foreground text-sm">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-foreground text-sm"
                key={item.name}
              >
                {item.icon ? (
                  <span aria-hidden className="text-base">
                    {item.icon}
                  </span>
                ) : null}
                {item.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
