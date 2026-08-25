/**
 * Human-in-the-loop chat UI for the LangGraph refund demo.
 *
 * Not using AI SDK `useChat` — HITL needs an explicit pause/resume with a
 * threadId, so we call `/api/chat/human-in-the-loop` with fetch:
 *
 *   1. User sends "I want a refund" → action: "start"
 *   2. API returns status: "interrupted" → show Continue under last message
 *   3. User clicks Continue → action: "continue" + threadId
 *   4. API returns status: "complete" → "Your refund has been issued"
 *
 * Page: `app/human-in-the-loop/page.tsx`
 */
"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@repo/design-system/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@repo/design-system/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@repo/design-system/components/ai-elements/prompt-input";
import {
  Suggestion,
  Suggestions,
} from "@repo/design-system/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolOutput,
} from "@repo/design-system/components/ai-elements/tool";
import { Button } from "@repo/design-system/components/ui/button";
import { MessageSquareIcon } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import type {
  HitlChatMessage,
  HitlInvokeResult,
} from "@/lib/ai/agents/hitl-refund-agent";

const DEFAULT_SUGGESTIONS = ["I want a refund"];

type ChatStatus = "ready" | "submitted" | "error";

export function HumanInTheLoopChat() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<HitlChatMessage[]>([]);
  /** Must match the graph checkpoint — sent back on Continue */
  const [threadId, setThreadId] = useState<string | null>(null);
  /** True while the graph is paused at interrupt() */
  const [awaitingContinue, setAwaitingContinue] = useState(false);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [error, setError] = useState<string | null>(null);

  const isBusy = status === "submitted";

  /** Sync UI from API result (interrupted → show Continue; complete → hide it). */
  const applyResult = (result: HitlInvokeResult) => {
    setThreadId(result.threadId);
    setMessages(result.messages);
    setAwaitingContinue(result.status === "interrupted");
  };

  /** Kick off the graph — runs until interrupt, then waits for Continue. */
  const startFlow = async (message: string) => {
    setStatus("submitted");
    setError(null);
    setAwaitingContinue(false);

    // Optimistic user bubble while the server runs the first nodes
    setMessages([
      {
        id: `local-user-${Date.now()}`,
        role: "user",
        content: message,
      },
    ]);

    try {
      const response = await fetch("/api/chat/human-in-the-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", message }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const result = (await response.json()) as HitlInvokeResult;
      applyResult(result);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Something went wrong. Try sending again.");
    }
  };

  /** Resume the paused graph — same threadId hits the MemorySaver checkpoint. */
  const continueFlow = async () => {
    if (!threadId || isBusy) {
      return;
    }

    setStatus("submitted");
    setError(null);

    try {
      const response = await fetch("/api/chat/human-in-the-loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "continue", threadId }),
      });

      if (!response.ok) {
        throw new Error("Continue failed");
      }

      const result = (await response.json()) as HitlInvokeResult;
      applyResult(result);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Could not continue. Try again.");
    }
  };

  const handleSubmit = (message: PromptInputMessage) => {
    const next = message.text?.trim();
    // Block new messages while paused — user must Continue first
    if (!next || isBusy || awaitingContinue) {
      return;
    }

    setText("");
    void startFlow(next);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isBusy || awaitingContinue) {
      return;
    }
    setText("");
    void startFlow(suggestion);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <Conversation className="min-h-0">
        <ConversationContent className="mx-auto w-full max-w-[720px]">
          {messages.length === 0 ? (
            <ConversationEmptyState
              description='Send "I want a refund" — the graph pauses for your Continue, then issues it.'
              icon={<MessageSquareIcon className="size-8" />}
              title="Human-in-the-loop refund"
            />
          ) : (
            <>
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                // Continue sits under the last assistant message in the thread
                const showContinue =
                  awaitingContinue && isLast && message.role === "assistant";

                return (
                  <div className="space-y-3" key={message.id}>
                    <Message from={message.role}>
                      <MessageContent>
                        {message.toolName ? (
                          <Tool defaultOpen>
                            <ToolHeader
                              state="output-available"
                              type={
                                `tool-${message.toolName}` as `tool-${string}`
                              }
                            />
                            <ToolContent>
                              <ToolOutput
                                errorText={undefined}
                                output={
                                  <p className="text-sm">{message.content}</p>
                                }
                              />
                            </ToolContent>
                          </Tool>
                        ) : message.role === "assistant" ? (
                          <MessageResponse>{message.content}</MessageResponse>
                        ) : (
                          <span>{message.content}</span>
                        )}
                      </MessageContent>
                    </Message>

                    {/* Human-in-the-loop control — resumes LangGraph interrupt */}
                    {showContinue ? (
                      <div className="flex items-center gap-3 pl-1">
                        <Button
                          disabled={isBusy}
                          onClick={() => void continueFlow()}
                          size="sm"
                        >
                          {isBusy ? "Continuing…" : "Continue"}
                        </Button>
                        <span className="text-muted-foreground text-xs">
                          Approve to issue the refund
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="sticky bottom-0 z-10 flex shrink-0 flex-col items-center gap-3 border-border border-t bg-background p-3">
        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : null}

        {suggestionsVisible(messages, awaitingContinue) ? (
          <Suggestions className="px-1">
            {DEFAULT_SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        ) : null}

        <div className="w-full max-w-[720px]">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                disabled={awaitingContinue || isBusy}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setText(event.target.value)
                }
                placeholder={
                  awaitingContinue
                    ? "Click Continue to approve the refund…"
                    : 'Try "I want a refund"…'
                }
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                disabled={!text.trim() || isBusy || awaitingContinue}
                status={isBusy ? "submitted" : "ready"}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

function suggestionsVisible(
  messages: HitlChatMessage[],
  awaitingContinue: boolean
) {
  return messages.length === 0 && !awaitingContinue;
}
