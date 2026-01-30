"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type ArtifactProps = {
  onClose: () => void;
  open: boolean;
};

export function Artifact({ onClose, open }: ArtifactProps) {
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

        {/* Content area - empty for now */}
        <div className="flex-1 overflow-auto p-6" id="artifact-title">
          {/* Empty - content will be added later */}
        </div>
      </div>
    </div>
  );
}
