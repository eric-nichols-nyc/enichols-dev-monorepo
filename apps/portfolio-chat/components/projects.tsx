"use client";

import { Skeleton } from "@repo/design-system/components/ui/skeleton";
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
  onExpand?: (project: Project, boundingBox?: BoundingBox) => void;
  projectCount: number;
  projects: Project[];
};

type ProjectCardProps = {
  onExpand?: (project: Project, boundingBox?: BoundingBox) => void;
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
            className="w-full rounded-md border border-border bg-background/80 p-2"
            key={id}
          >
            <Skeleton className="mb-2 h-5 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Projects({ copy, onExpand, projects }: ProjectsProps) {
  return (
    <div className="space-y-4">
      <div className="-mx-4 flex flex-col gap-4 px-4 pb-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} onExpand={onExpand} project={project} />
        ))}
      </div>
      {copy ? <p className="text-foreground text-sm">{copy}</p> : null}
    </div>
  );
}

export function ProjectCard({
  project,
}: ProjectCardProps) {
  const sentence = projectPreviewSentence(project.description);
  return (
    <div className="rounded-md border border-border bg-background/80 p-2">
      <p className="font-medium text-sm">{project.title}</p>
      <p className="text-muted-foreground text-xs">{project.shortDescription}</p>
      {sentence ? (
        <p className="mt-1 text-muted-foreground/90 text-xs leading-snug">
          {sentence}
        </p>
      ) : null}
    </div>
  );
}
