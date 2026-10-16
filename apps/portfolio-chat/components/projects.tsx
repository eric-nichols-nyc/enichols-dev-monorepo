"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { cn } from "@repo/design-system/lib/utils";
import { ExternalLink, Github, Maximize2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef } from "react";
import type { Project } from "@/data/projects";
import { projectPreviewSentence } from "@/lib/project-preview-sentence";

export type BoundingBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function getElementBoundingBox(element: HTMLElement): BoundingBox {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

type ProjectsProps = {
  copy?: string;
  onProjectSelect?: (project: Project, boundingBox?: BoundingBox) => void;
  projectCount: number;
  projects: Project[];
};

type ProjectCardProps = {
  onSelect?: (project: Project, boundingBox?: BoundingBox) => void;
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
            className="flex w-full flex-col overflow-hidden border border-border/70 bg-muted/10"
            key={id}
          >
            <Skeleton className="aspect-video w-full shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2 border-border/40 border-t px-3 py-2 sm:px-4 dark:border-white/10">
              <Skeleton className="size-9 rounded-none" />
              <Skeleton className="size-9 rounded-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Projects({ copy, onProjectSelect, projects }: ProjectsProps) {
  return (
    <div className="space-y-4">
      <div className="-mx-4 flex flex-col gap-4 px-4 pb-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            onSelect={onProjectSelect}
            project={project}
          />
        ))}
      </div>
      {copy ? <p className="text-foreground text-sm">{copy}</p> : null}
    </div>
  );
}

export function ProjectCard({ onSelect, project }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const sentence = projectPreviewSentence(project.description);
  const imageSrc =
    project.image ||
    `https://placehold.co/800x450/1a1a1a/ffffff?text=${encodeURIComponent(project.title)}`;

  const handleOpenDetail = useCallback(() => {
    if (!onSelect) {
      return;
    }
    const element = cardRef.current;
    const boundingBox = element ? getElementBoundingBox(element) : undefined;
    onSelect(project, boundingBox);
  }, [onSelect, project]);

  return (
    <article
      className={cn(
        "flex w-full flex-col overflow-hidden border border-border/70 bg-muted/10",
        onSelect &&
          "cursor-pointer transition-colors hover:border-border hover:bg-muted/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      )}
      onClick={onSelect ? handleOpenDetail : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenDetail();
              }
            }
          : undefined
      }
      ref={cardRef}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* Preview */}
      <div className="relative aspect-video w-full shrink-0 bg-muted">
        <Image
          alt={`${project.title} preview`}
          className="object-cover"
          fill
          sizes="(max-width: 767px) 100vw, 720px"
          src={imageSrc}
        />
        {onSelect ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-lg border border-border/70 bg-background/90 text-foreground shadow-sm"
          >
            <Maximize2 className="size-4" />
          </span>
        ) : null}
      </div>

      {/* Details */}
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

      {/* Links */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-border/40 border-t px-3 py-2 sm:px-4 dark:border-white/10">
        {project.githubUrl ? (
          <Link
            aria-label={`View ${project.title} on GitHub (new tab)`}
            className="inline-flex size-9 items-center justify-center text-muted-foreground"
            href={project.githubUrl}
            onClick={(event) => event.stopPropagation()}
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
          onClick={(event) => event.stopPropagation()}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden className="size-4 opacity-80" />
        </Link>
      </div>
    </article>
  );
}
