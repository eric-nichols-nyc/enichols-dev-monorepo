"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "@repo/ai";
import type { UIMessage } from "ai";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== "streaming" && status === "streaming") {
      console.log("[portfolio-chat] streaming started");
    }
    prevStatusRef.current = status;
  }, [status]);

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
    throw new Error(
      "usePortfolioChat must be used within PortfolioChatProvider"
    );
  }
  return ctx;
}
