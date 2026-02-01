"use client";

import type { Project } from "@/data/projects";
import { ExternalLink, Github, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useWindowSize } from "@/hooks/use-window-size";
import type { BoundingBox } from "./projects";
import { Chat } from "./chat";

type ArtifactProps = {
  boundingBox?: BoundingBox | null;
  onClose: () => void;
  onProjectSelect?: (project: Project) => void;
  open: boolean;
  project: Project | null;
};

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
  exit: { opacity: 0 },
};

const backdropTransition = {
  type: "tween" as const,
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as const,
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const exitTransition = {
  type: "spring" as const,
  stiffness: 600,
  damping: 30,
  delay: 0.1,
};

function ArtifactProjectContent({ project }: { project: Project }) {
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

export function Artifact({
  boundingBox,
  onClose,
  onProjectSelect,
  open,
  project,
}: ArtifactProps) {
  const { width: windowWidth, height: windowHeight } = useWindowSize();

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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate="open"
          aria-labelledby="artifact-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
          exit="exit"
          initial="closed"
          role="dialog"
          transition={backdropTransition}
          variants={backdropVariants}
        >
          {/* Backdrop - fades with root container */}
          <button
            aria-label="Close modal"
            className="fixed inset-0 size-full bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            type="button"
          />

          {/* Modal panel - expands from card or slides from right */}
          <motion.div
            animate={
              boundingBox
                ? {
                    x: 0,
                    y: 0,
                    width: windowWidth || "100vw",
                    height: windowHeight || "100dvh",
                    borderRadius: 0,
                    opacity: 1,
                    transition: springTransition,
                  }
                : {
                    opacity: 1,
                    x: 0,
                    width: windowWidth || "100vw",
                    height: windowHeight || "100dvh",
                    transition: backdropTransition,
                  }
            }
            className="fixed top-0 left-0 z-10 flex max-w-full flex-col overflow-hidden bg-background shadow-2xl"
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: exitTransition,
            }}
            initial={
              boundingBox
                ? {
                    x: boundingBox.left,
                    y: boundingBox.top,
                    width: boundingBox.width,
                    height: boundingBox.height,
                    borderRadius: 12,
                    opacity: 1,
                  }
                : {
                    opacity: 0,
                    x: "100%",
                    width: windowWidth || "100vw",
                    height: windowHeight || "100dvh",
                  }
            }
          >
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
          {/* Column 1: Chat - 400px fixed width, slides in from left and fades after main animation */}
          <motion.div
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: 0.35, duration: 0.3 },
            }}
            className="flex w-[400px] shrink-0 flex-col border-border border-r bg-muted/30"
            initial={{ opacity: 0, x: -24 }}
          >
            <Chat
              embedded
              onProjectExpand={onProjectSelect}
            />
          </motion.div>

          {/* Column 2: Project content - fills rest, max-w 800px */}
          <div className="min-w-0 flex-1 overflow-auto bg-background">
            <div className="mx-auto max-w-[800px] p-6" id="artifact-title">
              {project ? (
                <ArtifactProjectContent project={project} />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center text-muted-foreground text-sm">
                  Select a project to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
