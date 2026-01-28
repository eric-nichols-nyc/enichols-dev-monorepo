"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "@repo/ai";
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
import { MessageSquare } from "lucide-react";
import { useState } from "react";

const SUGGESTIONS = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
];

export function Chat() {
  const [text, setText] = useState("");
  const { error, messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    sendMessage(message);
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion, files: [] });
    setText("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                description="Send a message to start the conversation."
                icon={
                  <MessageSquare className="size-10 text-muted-foreground" />
                }
                title="No messages yet"
              />
            ) : (
              messages.map((msg) => (
                <Message className="max-w-[90%]" from={msg.role} key={msg.id}>
                  <MessageContent>
                    {msg.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={`${msg.id}-${i}`}>
                            {part.text}
                          </MessageResponse>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
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
              typeof error.message === "string" && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                  {error.message}
                </div>
              )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-border border-t p-3">
        {messages.length === 0 && (
          <Suggestions className="grid w-full grid-cols-1 gap-2 lg:w-1/2 lg:grid-cols-2">
            {SUGGESTIONS.map((suggestion) => (
              <Suggestion
                className="w-full justify-center"
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
