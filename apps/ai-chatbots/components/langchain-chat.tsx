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

const DEFAULT_SUGGESTIONS = [
  "What's the weather in Austin?",
  "Compare weather in Seattle and Miami",
  "How does get_city_weather call lookup_temperature?",
];

type CityWeatherInput = { city?: string };
type CityWeatherOutput = {
  city?: string;
  temperature?: number;
  unit?: string;
  condition?: string;
  calledVia?: string;
};

type CityWeatherToolPart = {
  type: "tool-get_city_weather";
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: CityWeatherInput;
  output?: CityWeatherOutput;
  errorText?: string;
};

function isCityWeatherToolPart(part: UIMessage["parts"][number]) {
  return part.type === "tool-get_city_weather";
}

function getCityFromInput(input?: CityWeatherInput) {
  return input?.city;
}

function CityWeatherLoading({ city }: { city?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Loader size={14} />
      {city ? `Calling get_city_weather for ${city}…` : "Calling get_city_weather…"}
    </div>
  );
}

function CityWeatherToolPart({ part }: { part: CityWeatherToolPart }) {
  const city = getCityFromInput(part.input);

  if (
    part.state === "input-streaming" ||
    part.state === "input-available" ||
    !part.output
  ) {
    return <CityWeatherLoading city={city} />;
  }

  if (part.state === "output-error") {
    return (
      <p className="text-destructive text-sm">
        get_city_weather error: {part.errorText}
      </p>
    );
  }

  const output = part.output;

  return (
    <Tool defaultOpen>
      <ToolHeader state={part.state} type="tool-get_city_weather" />
      <ToolContent>
        {part.input ? <ToolInput input={part.input} /> : null}
        <ToolOutput
          errorText={undefined}
          output={
            <div className="space-y-1 text-sm">
              <p>
                {output.city ?? city}: {output.temperature}°{output.unit ?? "F"}{" "}
                and {output.condition}
              </p>
              {output.calledVia ? (
                <p className="text-muted-foreground text-xs">{output.calledVia}</p>
              ) : null}
            </div>
          }
        />
      </ToolContent>
    </Tool>
  );
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

        if (isCityWeatherToolPart(part)) {
          return (
            <CityWeatherToolPart
              key={`${message.id}-tool-${index}`}
              part={part as unknown as CityWeatherToolPart}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export type LangChainChatProps = {
  api?: string;
  suggestions?: string[];
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function LangChainChat({
  api = "/api/chat/langchain",
  suggestions = DEFAULT_SUGGESTIONS,
  placeholder = "Ask about the weather…",
  emptyTitle = "LangChain tool → tool",
  emptyDescription =
    "Ask about weather — get_city_weather calls lookup_temperature internally.",
  className,
}: LangChainChatProps) {
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
                  isCityWeatherToolPart(part)
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
