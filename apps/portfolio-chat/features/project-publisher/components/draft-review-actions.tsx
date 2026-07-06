"use client";

import { Button } from "@repo/design-system/components/ui/button";

type DraftReviewActionsProps = {
  canPublish: boolean;
  hasDraft: boolean;
  isPublishing: boolean;
  onPublish: () => void;
  onReset: () => void;
};

export function DraftReviewActions({
  canPublish,
  hasDraft,
  isPublishing,
  onPublish,
  onReset,
}: DraftReviewActionsProps) {
  if (!hasDraft) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        disabled={isPublishing}
        onClick={onReset}
        type="button"
        variant="outline"
      >
        Cancel / reset
      </Button>
      <Button
        disabled={!canPublish || isPublishing}
        onClick={onPublish}
        type="button"
      >
        {isPublishing ? "Publishing…" : "Approve & publish"}
      </Button>
      {canPublish ? null : (
        <p className="text-muted-foreground text-sm">
          Fix validation errors before publishing.
        </p>
      )}
    </div>
  );
}
