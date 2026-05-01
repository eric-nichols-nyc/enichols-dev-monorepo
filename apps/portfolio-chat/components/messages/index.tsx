"use client";

import { ConversationEmptyState } from "@repo/design-system/components/ai-elements/conversation";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import type { UIMessage } from "ai";
import { ArrowDownIcon } from "lucide-react";
import type { MutableRefObject } from "react";
import type { ExperienceBoundingBox } from "../experience";
import { Greeting } from "../greeting";
import { ChatMessage } from "../message";
import type { BoundingBox } from "../projects";
import { getTurnKey, useChatMessagesScroll } from "./use-chat-messages-scroll";

export type MessagesProps = {
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
  /** Latest turn wrapper element. Defaults to an internal ref if omitted. */
  activeTurnRef?: MutableRefObject<HTMLDivElement | null>;
};

export function Messages({
  error,
  messages,
  onExperienceExpand,
  onProjectExpand,
  onSuggestionClick,
  status,
  activeTurnRef: activeTurnRefProp,
}: MessagesProps) {
  const {
    scrollRef,
    isAtBottom,
    scrollLatestTurnIntoView,
    messageTurns,
    getTurnWrapperProps,
  } = useChatMessagesScroll({
    messages,
    status,
    activeTurnRef: activeTurnRefProp,
  });

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
            messageTurns.map((turn, turnIndex) => {
              const turnCount = messageTurns.length;
              const turnKey = getTurnKey(turn, turnIndex);
              const { ref: turnRef, style: turnStyle } = getTurnWrapperProps(
                turnIndex,
                turnCount
              );

              return (
                <div
                  className="flex flex-col gap-8"
                  key={turnKey}
                  ref={turnRef}
                  style={turnStyle}
                >
                  {turn.map(({ globalIndex: i, msg }) => {
                    const isLastAssistant =
                      i === messages.length - 1 && msg.role === "assistant";
                    const isStreaming =
                      status === "submitted" || status === "streaming";
                    const isStreamingContainer = isLastAssistant
                      ? isStreaming
                      : false;

                    return (
                      <div
                        className={cn(
                          "flex w-full gap-2",
                          msg.role === "user" ? "ml-auto" : ""
                        )}
                        key={msg.id}
                      >
                        <ChatMessage
                          isStreamingContainer={isStreamingContainer}
                          msg={msg}
                          onExperienceExpand={onExperienceExpand}
                          onProjectExpand={onProjectExpand}
                          onSuggestionClick={onSuggestionClick}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })
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
          onClick={scrollLatestTurnIntoView}
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
