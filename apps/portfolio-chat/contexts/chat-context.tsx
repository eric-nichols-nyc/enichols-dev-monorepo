"use client";

import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "@repo/ai";
import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";

type ChatContextValue = {
  clearMessages: () => void;
  error: unknown;
  messages: UIMessage[];
  sendMessage: (message: { text: string; files?: unknown[] }) => void;
  status: "streaming" | "submitted" | "ready" | "error";
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function PortfolioChatProvider({ children }: { children: ReactNode }) {
  const { error, messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const handleSendMessage = useCallback(
    (message: { text: string; files?: unknown[] }) => {
      sendMessage({
        text: message.text,
        files: message.files ?? [],
      } as Parameters<typeof sendMessage>[0]);
    },
    [sendMessage]
  );

  return (
    <ChatContext.Provider
      value={{
        clearMessages,
        error,
        messages,
        sendMessage: handleSendMessage,
        status,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function usePortfolioChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("usePortfolioChat must be used within PortfolioChatProvider");
  }
  return ctx;
}
