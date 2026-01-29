"use client";

import { ExternalLink, Maximize2 } from "lucide-react";
import Image from "next/image";
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
      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
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
                  // TODO: Open project details modal
                  console.log("Open modal for project:", project.id);
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
    </div>
  );
}
