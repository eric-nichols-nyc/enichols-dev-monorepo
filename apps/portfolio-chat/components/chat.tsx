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
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export function Chat() {
  const [text, setText] = useState("");
  const { error, messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    sendMessage(message);
    setText("");
  };

  return (
    <div className="flex h-[min(80vh,32rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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

      <div className="shrink-0 border-border border-t p-3">
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
