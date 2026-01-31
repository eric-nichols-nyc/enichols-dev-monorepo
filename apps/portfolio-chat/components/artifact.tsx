"use client";

import type { Project } from "@/data/projects";
import { ExternalLink, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Chat } from "./chat";

type ArtifactProps = {
  onClose: () => void;
  onProjectSelect?: (project: Project) => void;
  open: boolean;
  project: Project | null;
};

export function Artifact({
  onClose,
  onProjectSelect,
  open,
  project,
}: ArtifactProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby="artifact-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
    >
      {/* Backdrop */}
      <button
        aria-label="Close modal"
        className="fixed inset-0 size-full bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      {/* Modal */}
      <div className="relative z-10 flex size-full max-w-full flex-col bg-background shadow-2xl">
        {/* Header with close button */}
        <div className="flex shrink-0 items-center justify-end border-border border-b p-4">
          <button
            aria-label="Close"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Two columns */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Column 1: Chat - 400px fixed width */}
          <div className="flex w-[400px] shrink-0 flex-col border-border border-r bg-muted/30">
            <Chat
              embedded
              onProjectExpand={onProjectSelect}
            />
          </div>

          {/* Column 2: Project content - fills rest, max-w 800px */}
          <div className="min-w-0 flex-1 overflow-auto bg-background">
            <div className="mx-auto max-w-[800px] p-6" id="artifact-title">
              {project ? (
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
                    <h2 className="mb-2 font-semibold text-2xl">
                      {project.title}
                    </h2>
                    <p className="mb-3 text-muted-foreground text-sm">
                      {project.date}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <Link
                      className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
                      href={project.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span>View project</span>
                      <ExternalLink className="size-4" />
                    </Link>
                  </div>
                </article>
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center text-muted-foreground text-sm">
                  Select a project to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
