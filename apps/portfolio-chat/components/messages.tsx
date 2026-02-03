"use client";

import { ConversationEmptyState } from "@repo/design-system/components/ai-elements/conversation";
import { Loader } from "@repo/design-system/components/ai-elements/loader";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import type { UIMessage } from "ai";
import { ArrowDownIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ExperienceBoundingBox } from "./experience";
import { Greeting } from "./greeting";
import { ChatMessage } from "./message";
import type { BoundingBox } from "./projects";

const NEAR_BOTTOM_THRESHOLD = 70;

type MessagesProps = {
  error: unknown;
  messages: UIMessage[];
  onExperienceExpand?: (
    experience: import("@/data/experience").ExperienceEntry[],
    boundingBox?: ExperienceBoundingBox
  ) => void;
  onProjectExpand?: (
    project: import("@/data/projects").Project,
    boundingBox?: BoundingBox
  ) => void;
  onSuggestionClick: (suggestion: string) => void;
  status: "streaming" | "submitted" | "ready" | "error";
};

export function Messages({
  error,
  messages,
  onExperienceExpand,
  onProjectExpand,
  onSuggestionClick,
  status,
}: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom <= NEAR_BOTTOM_THRESHOLD);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // Scroll to bottom when status changes to submitted/streaming
  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      scrollToBottom();
      setIsAtBottom(true);
    }
  }, [status, scrollToBottom]);

  // Scroll to bottom as content streams in (messages update frequently during streaming)
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages must trigger scroll during streaming
  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      scrollToBottom();
    }
  }, [messages, status, scrollToBottom]);

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        ref={scrollRef}
        role="log"
      >
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 p-4">
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <Greeting />
            </ConversationEmptyState>
          ) : (
            messages.map((msg) => (
              <div
                className={cn(
                  "flex w-full gap-2",
                  msg.role === "user" && "ml-auto"
                )}
                key={msg.id}
              >
                <ChatMessage
                  msg={msg}
                  onExperienceExpand={onExperienceExpand}
                  onProjectExpand={onProjectExpand}
                  onSuggestionClick={onSuggestionClick}
                />
              </div>
            ))
          )}
          {status === "submitted" && (
            <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
              <Loader size={14} />
              <span>Thinking…</span>
            </div>
          )}
          {typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof (error as { message: unknown }).message === "string" && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                {(error as { message: string }).message}
              </div>
            )}
        </div>
      </div>
      {!isAtBottom && (
        <Button
          aria-label="Scroll to bottom"
          className="-translate-x-1/2 absolute bottom-10 left-[50%] z-20 rounded-full"
          onClick={scrollToBottom}
          size="icon"
          type="button"
          variant="outline"
        >
          <ArrowDownIcon className="size-4" />
        </Button>
      )}
    </div>
  );
}
