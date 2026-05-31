"use client";

import { Shimmer } from "@repo/design-system/components/ai-elements/shimmer";
import { cn } from "@repo/design-system/lib/utils";
import { SparklesIcon } from "@/components/icons";

export type ThinkingMessageProps = {
  /** active = shimmer while waiting; complete = pinned header after content starts */
  variant?: "active" | "complete";
};

export function ThinkingMessage({ variant = "active" }: ThinkingMessageProps) {
  const isComplete = variant === "complete";

  return (
    <div
      className={cn("group/message w-full", isComplete && "mb-3 border-border/60 border-b pb-3")}
      data-role="assistant"
      data-testid={isComplete ? "message-assistant-thought" : "message-assistant-loading"}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-[calc(13px*1.65)] shrink-0 items-center">
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
            <SparklesIcon size={13} />
          </div>
        </div>

        <div className="flex h-[calc(13px*1.65)] items-center text-[13px] leading-[1.65]">
          {isComplete ? (
            <span className="font-medium text-muted-foreground">Thought</span>
          ) : (
            <Shimmer className="font-medium" duration={1}>
              Thinking...
            </Shimmer>
          )}
        </div>
      </div>
    </div>
  );
}
