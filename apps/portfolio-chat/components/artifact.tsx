"use client";

import { Loader } from "@repo/design-system/components/ai-elements/loader";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import type { Project } from "@/data/projects";
import { useWindowSize } from "@/hooks/use-window-size";
import { Chat } from "./chat";
import type { BoundingBox } from "./projects";

type ArtifactProps = {
  boundingBox?: BoundingBox | null;
  content: ReactNode;
  isLoading?: boolean;
  onClose: () => void;
  onProjectSelect?: (project: Project) => void;
  open: boolean;
};

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
      delay: 0.1,
    },
  },
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

export function Artifact({
  boundingBox,
  content,
  isLoading = false,
  onClose,
  onProjectSelect,
  open,
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
                <Chat embedded />
              </motion.div>

              {/* Column 2: Content slot - parent injects project, experience, etc. */}
              <div className="min-w-0 flex-1 overflow-auto bg-background">
                <div
                  className="mx-auto flex max-w-[800px] flex-col p-6"
                  id="artifact-title"
                >
                  {isLoading ? (
                    <div className="flex min-h-[200px] flex-1 items-center justify-center">
                      <Loader size={24} />
                    </div>
                  ) : (
                    content
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
