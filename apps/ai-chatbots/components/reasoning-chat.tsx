/**
 * Reasoning chat UI — shows model "thinking" in a collapsible panel, then the answer.
 *
 * Expects message parts:
 *   - type: "reasoning" → Thinking panel (from extractReasoningMiddleware + sendReasoning)
 *   - type: "text" → final answer
 *
 * API: `/api/chat/reasoning`
 */
"use client";

import { useChat } from "@ai-sdk/react";
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
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@repo/design-system/components/ai-elements/reasoning";
import {
  Suggestion,
  Suggestions,
} from "@repo/design-system/components/ai-elements/suggestion";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquareIcon } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";

const DEFAULT_SUGGESTIONS = [
  "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?",
  "If it takes 5 machines 5 minutes to make 5 widgets, how long for 100 machines to make 100 widgets?",
  "Explain why 0.999... equals 1 in one short paragraph.",
];

function MessageParts({
  message,
  isStreaming,
}: {
  message: UIMessage;
  isStreaming: boolean;
}) {
  return (
    <>
      {message.parts.map((part, index) => {
        // Collapsible "Thinking…" block — streams while the model is still writing it
        if (part.type === "reasoning" && part.text) {
          const isLastPart = index === message.parts.length - 1;
          return (
            <Reasoning
              isStreaming={isStreaming && isLastPart}
              key={`${message.id}-reasoning-${index}`}
            >
              <ReasoningTrigger />
              <ReasoningContent>{part.text}</ReasoningContent>
            </Reasoning>
          );
        }

        if (part.type === "text" && part.text) {
          return message.role === "assistant" ? (
            <MessageResponse key={`${message.id}-text-${index}`}>
              {part.text}
            </MessageResponse>
          ) : (
            <span key={`${message.id}-text-${index}`}>{part.text}</span>
          );
        }

        return null;
      })}
    </>
  );
}

export function ReasoningChat() {
  const [text, setText] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat/reasoning" }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (message: PromptInputMessage) => {
    const next = message.text?.trim();
    if (!next || isBusy) {
      return;
    }

    sendMessage({ text: next });
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isBusy) {
      return;
    }
    sendMessage({ text: suggestion });
    setText("");
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <Conversation className="min-h-0">
        <ConversationContent className="mx-auto w-full max-w-[720px]">
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="Ask a tricky question — you'll see Thinking… then the answer."
              icon={<MessageSquareIcon className="size-8" />}
              title="Reasoning chat"
            />
          ) : (
            messages.map((message) => {
              const hasVisibleParts = message.parts.some(
                (part) =>
                  (part.type === "text" && Boolean(part.text)) ||
                  (part.type === "reasoning" && Boolean(part.text))
              );
              if (!hasVisibleParts) {
                return null;
              }

              const isLastMessage = message.id === messages.at(-1)?.id;

              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    <MessageParts
                      isStreaming={isBusy && isLastMessage}
                      message={message}
                    />
                  </MessageContent>
                </Message>
              );
            })
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="sticky bottom-0 z-10 flex shrink-0 flex-col items-center gap-3 border-border border-t bg-background p-3">
        {error ? (
          <p className="text-destructive text-sm">
            Something went wrong. Try sending again.
          </p>
        ) : null}
        {messages.length === 0 ? (
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
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setText(event.target.value)
                }
                placeholder="Ask a puzzle or reasoning question…"
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                disabled={!text.trim() || isBusy}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
