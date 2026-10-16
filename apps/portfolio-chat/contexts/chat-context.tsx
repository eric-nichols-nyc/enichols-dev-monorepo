"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "@repo/ai";
import type { UIMessage } from "ai";
import { createContext, type ReactNode, useCallback, useContext, useRef } from "react";

type ChatContextValue = {
  clearMessages: () => void;
  error: unknown;
  messages: UIMessage[];
  sendMessage: (message: { text: string; files?: unknown[] }) => void;
  status: "streaming" | "submitted" | "ready" | "error";
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function PortfolioChatProvider({ children }: { children: ReactNode }) {
  const { error, messages, sendMessage, setMessages, status, clearError, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const actionVersion = useRef(0);
  const clearMessages = useCallback(async () => {
    const version = ++actionVersion.current;
    const stopping = stop();
    setMessages([]);
    clearError();
    await stopping;
    if (version === actionVersion.current) {
      setMessages([]);
      clearError();
    }
  }, [setMessages, clearError, stop]);

  const handleSendMessage = useCallback(
    async (message: { text: string; files?: unknown[] }) => {
      const version = ++actionVersion.current;
      await stop();
      if (version !== actionVersion.current) return;
      clearError();
      await sendMessage({
        text: message.text,
        files: message.files ?? [],
      } as Parameters<typeof sendMessage>[0]);
    },
    [sendMessage, stop, clearError]
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
