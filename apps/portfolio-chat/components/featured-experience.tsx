"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ExperienceEntry } from "@/data/experience";

type FeaturedExperienceProps = {
  experience: ExperienceEntry[];
};

export function FeaturedExperience({ experience }: FeaturedExperienceProps) {
  return (
    <article className="space-y-8">
      <h2 className="font-semibold text-foreground text-lg tracking-wide">
        EXPERIENCE
      </h2>
      <div className="space-y-8">
        {experience.map((entry) => (
          <div
            className="flex flex-col gap-2 sm:flex-row sm:gap-6"
            key={`${entry.company}-${entry.duration}`}
          >
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
        ))}
      </div>
    </article>
  );
}
