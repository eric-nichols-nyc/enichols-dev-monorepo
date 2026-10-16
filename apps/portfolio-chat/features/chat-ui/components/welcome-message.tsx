"use client";

import { Greeting } from "@/features/chat-ui/components/greeting";
import { Suggestions } from "@/features/chat-ui/components/suggestions";

type WelcomeMessageProps = {
  busy: boolean;
  onSuggestionClick: (suggestion: string) => void;
};

/** A visual introduction, deliberately separate from the AI message history. */
export function WelcomeMessage({ busy, onSuggestionClick }: WelcomeMessageProps) {
  return (
    <section
      aria-label="Welcome"
      className="w-full"
      data-testid="chat-welcome-message"
    >
      <Greeting />
      <Suggestions disabled={busy} onSuggestionClick={onSuggestionClick} />
    </section>
  );
}
