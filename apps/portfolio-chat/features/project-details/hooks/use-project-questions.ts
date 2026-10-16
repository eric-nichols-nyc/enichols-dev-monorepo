"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "@repo/ai";

export function useProjectQuestions(projectId: string) {
  const [draft, setDraft] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat", body: { projectId },
  }), [projectId]);
  const { messages, status, error, sendMessage, stop, setMessages, clearError } = useChat({ transport });
  const actionVersion = useRef(0);
  const pending = useRef(false);
  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => () => { ++actionVersion.current; void stopRef.current(); }, []);
  const busy = status === "submitted" || status === "streaming";

  const send = async (question: string) => {
    if (!question.trim() || pending.current || busy) return;
    const version = ++actionVersion.current;
    pending.current = true;
    try {
      await stop();
      if (version !== actionVersion.current) return;
      clearError();
      setDraft("");
      await sendMessage({ text: question.trim() });
    } catch {
      // The transport exposes failures through useChat's error state.
    } finally {
      if (version === actionVersion.current) pending.current = false;
    }
  };

  const clear = async () => {
    const version = ++actionVersion.current;
    pending.current = false;
    const stopping = stop();
    setMessages([]);
    clearError();
    setDraft("");
    await stopping;
    if (version === actionVersion.current) { setMessages([]); clearError(); }
  };

  return { messages, status, error, busy, draft, setDraft, send, stop, clear };
}
