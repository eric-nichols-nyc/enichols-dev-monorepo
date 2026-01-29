"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/data/projects";

type ProjectsProps = {
  projectCount: number;
  projects: Project[];
};

export function Projects({ projectCount, projects }: ProjectsProps) {
  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        Showing {projects.length} of {projectCount} projects
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
            href={project.url}
            key={project.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {project.image ? (
                <img
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  src={project.image}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
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
              <div className="mt-3 flex items-center gap-1 text-primary text-sm">
                <span>View project</span>
                <ExternalLink className="size-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
