"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { Maximize2 } from "lucide-react";

export type TechEntry = {
  name: string;
  icon?: string;
  knows?: string;
};

type TechByCategory = Record<string, TechEntry[]>;

type TechStackProps = {
  tech: TechByCategory;
};

const TECH_STACK_CARD_CLASS =
  "relative flex h-[400px] w-full max-w-full flex-col overflow-hidden rounded-lg border border-border";

const ROW_GRID_CLASS =
  "grid grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)] gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]";
const ROW_CELL_CLASS = "py-2.5 text-sm text-foreground";
const HEADER_CELL_CLASS = "py-2 font-medium text-muted-foreground text-xs";

function cellValue(value: string | undefined): string {
  return value?.trim() ? value : "—";
}

function TechStackExpandButton() {
  return (
    <Button
      aria-label="Expand tech stack"
      className="size-8 text-muted-foreground hover:bg-white/10 hover:text-foreground"
      size="icon"
      type="button"
      variant="ghost"
    >
      <Maximize2 aria-hidden className="size-4" />
    </Button>
  );
}

function TechCategoryTable({
  category,
  items,
}: {
  category: string;
  items: TechEntry[];
}) {
  const tableId = `tech-stack-${category.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section aria-labelledby={`${tableId}-heading`} className="space-y-2">
      <h3
        className="font-medium text-muted-foreground text-sm"
        id={`${tableId}-heading`}
      >
        {category}
      </h3>
      <div className="overflow-hidden rounded-md border border-border/50 bg-black">
        <div className="divide-y divide-border/50">
          <div className={`${ROW_GRID_CLASS} bg-zinc-950/90 px-3`} role="row">
            <div className={HEADER_CELL_CLASS} role="columnheader">
              Technology
            </div>
            <div className={HEADER_CELL_CLASS} role="columnheader">
              What I know
            </div>
          </div>
          {items.map((item) => (
            <div className={`${ROW_GRID_CLASS} px-3`} key={item.name} role="row">
              <div className={`${ROW_CELL_CLASS} font-medium`} role="cell">
                <span className="inline-flex items-center gap-1.5">
                  {item.icon ? (
                    <span aria-hidden className="text-base">
                      {item.icon}
                    </span>
                  ) : null}
                  {item.name}
                </span>
              </div>
              <div
                className={`${ROW_CELL_CLASS} text-muted-foreground leading-snug`}
                role="cell"
              >
                {cellValue(item.knows)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechCategoryTableSkeleton({ rowCount = 4 }: { rowCount?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32 bg-zinc-800" />
      <div className="divide-y divide-border/50 overflow-hidden rounded-md border border-border/50 bg-black">
        <div className={`${ROW_GRID_CLASS} bg-zinc-950/90 px-3 py-2`}>
          <Skeleton className="h-3 w-20 bg-zinc-800" />
          <Skeleton className="h-3 w-40 bg-zinc-800" />
        </div>
        {Array.from({ length: rowCount }, (_, i) => (
          <div className={`${ROW_GRID_CLASS} px-3 py-2.5`} key={i}>
            <Skeleton className="h-3 w-20 bg-zinc-800" />
            <Skeleton className="h-3 w-full max-w-xs bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TechStackCardHeader({ skeleton }: { skeleton?: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-border border-b bg-zinc-950/90 px-3 py-2.5">
      {skeleton ? (
        <Skeleton className="h-6 w-36 bg-zinc-800" />
      ) : (
        <h2 className="font-semibold text-foreground text-lg tracking-wide">
          TECH STACK
        </h2>
      )}
      {skeleton ? (
        <Skeleton className="size-8 rounded-md bg-zinc-800" />
      ) : (
        <TechStackExpandButton />
      )}
    </div>
  );
}

export function TechStackSkeleton() {
  return (
    <div className={TECH_STACK_CARD_CLASS}>
      <TechStackCardHeader skeleton />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-black p-3">
        <TechCategoryTableSkeleton rowCount={4} />
        <TechCategoryTableSkeleton rowCount={3} />
      </div>
    </div>
  );
}

export function TechStack({ tech }: TechStackProps) {
  const categories = Object.entries(tech);

  return (
    <div className={TECH_STACK_CARD_CLASS}>
      <TechStackCardHeader />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-black p-3">
        {categories.map(([category, items]) => (
          <TechCategoryTable category={category} items={items} key={category} />
        ))}
      </div>
    </div>
  );
}
