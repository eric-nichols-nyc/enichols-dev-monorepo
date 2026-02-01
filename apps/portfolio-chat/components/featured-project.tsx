"use client";

import type { Project } from "@/data/projects";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type FeaturedProjectProps = {
  project: Project;
};

export function FeaturedProject({ project }: FeaturedProjectProps) {
  return (
    <article className="space-y-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <Image
          alt={project.title}
          className="object-cover"
          fill
          sizes="800px"
          src={
            project.image ||
            `https://placehold.co/800x450/1a1a1a/ffffff?text=${encodeURIComponent(project.title)}`
          }
        />
      </div>
      <div>
        <h2 className="mb-1 font-semibold text-2xl">{project.title}</h2>
        {project.subtitle ? (
          <p className="mb-2 font-medium text-muted-foreground text-sm">
            {project.subtitle}
          </p>
        ) : null}
        <p className="mb-3 text-muted-foreground text-sm">{project.date}</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {(project.badges ?? project.tags).map((tag) => (
            <span
              className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mb-4 leading-relaxed">{project.description}</p>

        {project.problem ? (
          <div className="mb-4 space-y-2">
            <h3 className="font-medium text-sm">Problem</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {project.problem}
            </p>
          </div>
        ) : null}
        {project.solution ? (
          <div className="mb-4 space-y-2">
            <h3 className="font-medium text-sm">Solution</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {project.solution}
            </p>
          </div>
        ) : null}

        {(project.tech?.length ?? 0) > 0 ? (
          <div className="mb-4 space-y-2">
            <h3 className="font-medium text-sm">Tech Stack</h3>
            <p className="text-muted-foreground text-sm">
              {(project.tech ?? []).join(" · ")}
            </p>
          </div>
        ) : null}

        {(project.features?.length ?? 0) > 0 ? (
          <div className="mb-4 space-y-2">
            <h3 className="font-medium text-sm">Features</h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
              {(project.features ?? []).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {(project.metrics?.length ?? 0) > 0 ? (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(project.metrics ?? []).map((m) => (
              <div
                className="rounded-lg border bg-muted/50 p-3 text-center"
                key={m.label}
              >
                <div className="font-semibold text-foreground">{m.value}</div>
                <div className="text-muted-foreground text-xs">{m.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {(project.highlights?.length ?? 0) > 0 ? (
          <div className="mb-4 space-y-2">
            <h3 className="font-medium text-sm">Highlights</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              {(project.highlights ?? []).map((h) => (
                <li className="flex items-start gap-2" key={h}>
                  <span className="text-primary">→</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
            href={project.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>View project</span>
            <ExternalLink className="size-4" />
          </Link>
          {project.githubUrl ? (
            <Link
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              href={project.githubUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>GitHub</span>
              <Github className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
