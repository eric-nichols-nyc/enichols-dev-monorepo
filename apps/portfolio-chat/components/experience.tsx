"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { ExternalLink, Maximize2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import type { ExperienceEntry } from "@/data/experience";
import { ShineButton } from "./shine-button";

export type ExperienceBoundingBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ExperienceProps = {
  experience: ExperienceEntry[];
  onExpand?: (
    experience: ExperienceEntry[],
    boundingBox?: ExperienceBoundingBox
  ) => void;
};

export function ExperienceSkeleton() {
  return (
    <div className="h-[400px] w-full min-w-[800px] space-y-6 overflow-hidden rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-5 w-28" />
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div className="flex gap-6" key={i}>
            <Skeleton className="h-4 w-24 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Experience({ experience, onExpand }: ExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    onExpand?.(
      experience,
      rect
        ? {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }
        : undefined
    );
  };

  return (
    <div
      className="relative h-[400px] w-full overflow-y-auto rounded-lg border border-border bg-muted/50 p-4 dark:bg-muted"
      ref={containerRef}
    >
      <ShineButton
        className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-md bg-background/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
        onClick={handleExpand}
      >
        <Maximize2 className="size-5 text-foreground" />
      </ShineButton>
      <div className="space-y-6">
        <h2 className="font-semibold text-foreground text-lg tracking-wide">
          EXPERIENCE
        </h2>
        <div className="space-y-8">
          {experience.map((entry) => (
            <ExperienceEntryCard
              entry={entry}
              key={`${entry.company}-${entry.duration}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExperienceEntryCard({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="group flex flex-col gap-2 sm:flex-row sm:gap-6">
      <div className="shrink-0 text-muted-foreground text-sm sm:w-24">
        {entry.duration}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h3 className="font-semibold text-foreground">
            {entry.titles[0]} • {entry.company}
          </h3>
          {entry.titles.length > 1 ? (
            <div className="mt-0.5 space-y-0.5 text-muted-foreground text-sm">
              {entry.titles.slice(1).map((title) => (
                <div key={title}>{title}</div>
              ))}
            </div>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {entry.description}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {entry.technologies.map((tech) => (
            <Badge
              className="rounded-full font-normal"
              key={tech}
              variant="secondary"
            >
              {tech}
            </Badge>
          ))}
          {entry.links?.map((link) => (
            <Link
              className="inline-flex items-center gap-1 rounded-full border border-border bg-transparent px-2.5 py-0.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
              href={link.url}
              key={link.name}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-3" />
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
