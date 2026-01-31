"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { ExternalLink, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

type ProjectsProps = {
  copy?: string;
  onExpand?: (project: Project) => void;
  projectCount: number;
  projects: Project[];
};

const PROJECT_SKELETON_COUNT = 3;

export function ProjectsSkeleton() {
  return (
    <div className="@container space-y-4">
      <Skeleton className="h-4 w-24" />
      <div className="-mx-4 flex flex-col gap-4 px-4 pb-2 @[500px]:mx-0 @[500px]:flex-row @[500px]:overflow-x-auto @[500px]:px-0">
        {Array.from(
          { length: PROJECT_SKELETON_COUNT },
          (_, i) => `skeleton-${i}`
        ).map((id) => (
          <div
            className="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card @[500px]:w-[280px]"
            key={id}
          >
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="flex flex-1 flex-col p-4">
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="mb-1 h-4 max-w-full" />
              <Skeleton className="mb-3 h-4 max-w-sm" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Projects({ copy, onExpand, projectCount, projects }: ProjectsProps) {
  return (
    <div className="@container space-y-4">
      <div className="text-muted-foreground text-sm">
        {projectCount} projects
      </div>
      <div className="-mx-4 flex flex-col gap-4 px-4 pb-2 @[500px]:mx-0 @[500px]:flex-row @[500px]:overflow-x-auto @[500px]:px-0">
        {projects.map((project) => (
          <div
            className="group relative flex w-full shrink-0 flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg @[500px]:w-[280px]"
            key={project.id}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                alt={project.title}
                className="object-cover transition-transform group-hover:scale-105"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                src={
                  project.image ||
                  `https://placehold.co/800x450/1a1a1a/ffffff?text=${encodeURIComponent(project.title)}`
                }
              />
              <button
                className="absolute top-2 right-2 flex items-center justify-center rounded-md bg-background/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-background"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExpand?.(project);
                }}
                type="button"
              >
                <Maximize2 className="size-5 text-foreground" />
              </button>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-2 font-semibold text-lg group-hover:text-primary">
                {project.title}
              </h3>
              <p className="mb-3 line-clamp-2 flex-1 text-muted-foreground text-sm">
                {project.shortDescription}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <Link
                  className="flex items-center gap-1 text-primary text-sm transition-colors hover:text-primary/80"
                  href={project.url}
                  onClick={(e) => e.stopPropagation()}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span>View project</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {copy ? <p className="text-foreground text-sm">{copy}</p> : null}
    </div>
  );
}
