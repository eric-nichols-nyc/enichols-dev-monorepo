"use client";

import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@repo/design-system/components/ai-elements/conversation";
import { Loader } from "@repo/design-system/components/ai-elements/loader";
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
  ToolInput,
  ToolOutput,
} from "@repo/design-system/components/ai-elements/tool";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquareIcon } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import type { WeatherUIToolInvocation } from "@/lib/ai/tools/weather-tool";

const DEFAULT_SUGGESTIONS = [
  "What's the weather in Austin?",
  "Explain streaming chat in one sentence",
  "Tell me a short fun fact",
];

function getWeatherCity(part: WeatherUIToolInvocation) {
  if (part.state === "input-streaming" || !part.input || !("city" in part.input)) {
    return;
  }
  return part.input.city;
}

function WeatherLoading({ city }: { city?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Loader size={14} />
      {city ? `Checking weather in ${city}…` : "Calling weather tool…"}
    </div>
  );
}

function WeatherReady({
  city,
  part,
}: {
  city?: string;
  part: Extract<WeatherUIToolInvocation, { state: "output-available" }>;
}) {
  const output = part.output as
    | { state: "loading" }
    | { state: "ready"; temperature: number; weather: string }
    | undefined;

  if (!output || output.state === "loading") {
    return <WeatherLoading city={city} />;
  }

  return (
    <Tool defaultOpen>
      <ToolHeader state={part.state} type="tool-weather" />
      <ToolContent>
        {part.input ? <ToolInput input={part.input} /> : null}
        <ToolOutput
          errorText={undefined}
          output={
            <p className="text-sm">
              {city ? `${city}: ` : null}
              {output.temperature}°F and {output.weather}
            </p>
          }
        />
      </ToolContent>
    </Tool>
  );
}

function WeatherToolPart({ part }: { part: WeatherUIToolInvocation }) {
  const city = getWeatherCity(part);

  if (part.state === "input-streaming" || part.state === "input-available") {
    return <WeatherLoading city={city} />;
  }

  if (part.state === "output-available") {
    return <WeatherReady city={city} part={part} />;
  }

  if (part.state === "output-error") {
    return (
      <p className="text-destructive text-sm">
        Weather tool error: {part.errorText}
      </p>
    );
  }

  return null;
}

function MessageParts({ message }: { message: UIMessage }) {
  return (
    <>
      {message.parts.map((part, index) => {
        if (part.type === "text" && part.text) {
          return message.role === "assistant" ? (
            <MessageResponse key={`${message.id}-text-${index}`}>
              {part.text}
            </MessageResponse>
          ) : (
            <span key={`${message.id}-text-${index}`}>{part.text}</span>
          );
        }

        if (part.type === "tool-weather") {
          return (
            <WeatherToolPart
              key={`${message.id}-weather-${index}`}
              part={part as WeatherUIToolInvocation}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export type BasicChatProps = {
  /** API endpoint for streaming chat. Defaults to `/api/chat/basic`. */
  api?: string;
  /** Suggestion pills shown above the input. */
  suggestions?: string[];
  /** Placeholder for the prompt textarea. */
  placeholder?: string;
  /** Optional title shown in the empty state. */
  emptyTitle?: string;
  /** Optional description shown in the empty state. */
  emptyDescription?: string;
  className?: string;
};

/**
 * Reusable streaming chat using design-system AI elements + `@ai-sdk/react`.
 */
export function BasicChat({
  api = "/api/chat/basic",
  suggestions = DEFAULT_SUGGESTIONS,
  placeholder = "Type a message…",
  emptyTitle = "Start a conversation",
  emptyDescription = "Ask anything — responses stream from OpenAI.",
  className,
}: BasicChatProps) {
  const [text, setText] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api }), [api]);

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
    <div
      className={`flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background ${className ?? ""}`}
    >
      <Conversation className="min-h-0">
        <ConversationContent className="mx-auto w-full max-w-[720px]">
          {messages.length === 0 ? (
            <ConversationEmptyState
              description={emptyDescription}
              icon={<MessageSquareIcon className="size-8" />}
              title={emptyTitle}
            />
          ) : (
            messages.map((message) => {
              const hasVisibleParts = message.parts.some(
                (part) =>
                  (part.type === "text" && Boolean(part.text)) ||
                  part.type === "tool-weather"
              );
              if (!hasVisibleParts) {
                return null;
              }

              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    <MessageParts message={message} />
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
        {suggestions.length > 0 && messages.length === 0 ? (
          <Suggestions className="px-1">
            {suggestions.map((suggestion) => (
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
                placeholder={placeholder}
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
