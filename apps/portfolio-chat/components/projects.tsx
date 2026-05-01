"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { projectPreviewSentence } from "@/lib/project-preview-sentence";

export type BoundingBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ProjectsProps = {
  copy?: string;
  projectCount: number;
  projects: Project[];
};

type ProjectCardProps = {
  project: Project;
};

const PROJECT_SKELETON_COUNT = 3;

export function ProjectsSkeleton() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-4 w-full" />
      <div className="-mx-4 flex w-full flex-col gap-4 px-4 pb-2">
        {Array.from(
          { length: PROJECT_SKELETON_COUNT },
          (_, i) => `skeleton-${i}`
        ).map((id) => (
          <div
            className="flex w-full flex-col overflow-hidden border border-border/70 bg-muted/10 sm:flex-row sm:items-stretch"
            key={id}
          >
            <Skeleton className="aspect-video w-full shrink-0 sm:aspect-auto sm:h-30 sm:w-44 lg:w-48" />
            <div className="flex min-w-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <div className="flex shrink-0 flex-row items-center justify-end gap-2 border-border/40 border-t px-3 py-2 sm:w-13 sm:flex-col sm:items-center sm:justify-end sm:border-border/40 sm:border-t-0 sm:border-l sm:py-4 dark:border-white/10">
              <Skeleton className="size-9 rounded-none" />
              <Skeleton className="size-9 rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Projects({ copy, projects }: ProjectsProps) {
  return (
    <div className="space-y-4">
      <div className="-mx-4 flex flex-col gap-4 px-4 pb-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      {copy ? <p className="text-foreground text-sm">{copy}</p> : null}
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const sentence = projectPreviewSentence(project.description);
  const imageSrc =
    project.image ||
    `https://placehold.co/800x450/1a1a1a/ffffff?text=${encodeURIComponent(project.title)}`;

  return (
    <article className="flex w-full flex-col overflow-hidden border border-border/70 bg-muted/10 sm:flex-row sm:items-stretch">
      {/* Column 1: preview */}
      <div className="relative aspect-video w-full shrink-0 bg-muted sm:aspect-auto sm:h-30 sm:w-44 lg:w-48">
        <Image
          alt={`${project.title} preview`}
          className="object-cover"
          fill
          sizes="(max-width: 639px) 100vw, 192px"
          src={imageSrc}
        />
      </div>

      {/* Column 2: copy */}
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3 sm:px-4 sm:py-4">
        <div className="min-w-0 space-y-1">
          <h3 className="font-semibold text-foreground text-sm leading-snug tracking-tight sm:text-base">
            {project.title}
          </h3>
          <p className="text-muted-foreground text-xs leading-snug sm:text-[13px]">
            {project.shortDescription}
          </p>
          {sentence ? (
            <p className="pt-0.5 text-[11px] text-muted-foreground/85 leading-relaxed sm:text-xs">
              {sentence}
            </p>
          ) : null}
        </div>
      </div>

      {/* Column 3: links pinned to bottom */}
      <div className="flex shrink-0 flex-row items-center justify-end gap-2 border-border/40 border-t px-3 py-2 sm:w-13 sm:flex-col sm:items-center sm:justify-end sm:border-border/40 sm:border-t-0 sm:border-l sm:px-2 sm:py-4 dark:border-white/10">
        {project.githubUrl ? (
          <Link
            aria-label={`View ${project.title} on GitHub (new tab)`}
            className="inline-flex size-9 items-center justify-center text-muted-foreground"
            href={project.githubUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Github aria-hidden className="size-4 opacity-80" />
          </Link>
        ) : null}
        <Link
          aria-label={`Open ${project.title} live site (new tab)`}
          className="inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground"
          href={project.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden className="size-4 opacity-80" />
        </Link>
      </div>
    </article>
  );
}
