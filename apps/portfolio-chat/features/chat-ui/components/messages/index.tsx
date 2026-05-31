"use client";

import { ConversationEmptyState } from "@repo/design-system/components/ai-elements/conversation";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import type { UIMessage } from "ai";
import { ArrowDownIcon } from "lucide-react";
import { Fragment } from "react";
import type { MutableRefObject } from "react";
import type { ExperienceBoundingBox } from "@/components/experience";
import type { BoundingBox } from "@/components/projects";
import type { Project } from "@/data/projects";
import { Greeting } from "@/features/chat-ui/components/greeting";
import { ChatMessage } from "@/features/chat-ui/components/message";
import { ThinkingMessage } from "@/features/chat-ui/components/thinking-message";
import { getTurnKey, useChatMessagesScroll } from "./use-chat-messages-scroll";

export type MessagesProps = {
  error: unknown;
  messages: UIMessage[];
  onExperienceExpand?: (
    experience: import("@/data/experience").ExperienceEntry[],
    boundingBox?: ExperienceBoundingBox
  ) => void;
  onProjectSelect?: (project: Project, boundingBox?: BoundingBox) => void;
  onSuggestionClick: (suggestion: string) => void;
  status: "streaming" | "submitted" | "ready" | "error";
  /** Latest turn wrapper element. Defaults to an internal ref if omitted. */
  activeTurnRef?: MutableRefObject<HTMLDivElement | null>;
};

export function Messages({
  error,
  messages,
  onExperienceExpand,
  onProjectSelect,
  onSuggestionClick,
  status,
  activeTurnRef: activeTurnRefProp,
}: MessagesProps) {
  const lastMessageIndex = messages.length - 1;

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
      <div className="flex-1 overflow-y-auto overscroll-contain" ref={scrollRef} role="log">
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
                    const showInlineSubmittedLoader =
                      status === "submitted" &&
                      i === lastMessageIndex &&
                      msg.role === "user";

                    return (
                      <Fragment key={msg.id}>
                        <div
                          className={cn(
                            "flex w-full gap-2",
                            msg.role === "user" ? "ml-auto" : ""
                          )}
                        >
                          <ChatMessage
                            msg={msg}
                            onExperienceExpand={onExperienceExpand}
                            onProjectSelect={onProjectSelect}
                            onSuggestionClick={onSuggestionClick}
                          />
                        </div>
                        {showInlineSubmittedLoader ? (
                          <ThinkingMessage />
                        ) : null}
                      </Fragment>
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
