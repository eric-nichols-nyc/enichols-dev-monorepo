"use client";

import {
  Suggestion,
  Suggestions as SuggestionsGrid,
} from "@repo/design-system/components/ai-elements/suggestion";
import { motion } from "motion/react";

const SUGGESTIONS = [
  "Show me some projects",
  "Tell me about Eric",
  "What's Eric's tech stack?",
  "What's his experience",
];

const fadeUpIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};

type SuggestionsProps = {
  onSuggestionClick: (suggestion: string) => void;
};

export function Suggestions({ onSuggestionClick }: SuggestionsProps) {
  return (
    <SuggestionsGrid className="mx-auto grid w-full max-w-[720px] grid-cols-1 gap-2 lg:w-1/2 lg:grid-cols-2">
      {SUGGESTIONS.map((suggestion, i) => (
        <motion.div
          animate={fadeUpIn.animate}
          initial={fadeUpIn.initial}
          key={suggestion}
          transition={{
            ...fadeUpIn.transition,
            delay: 0.1 + i * 0.08,
          }}
        >
          <Suggestion
            className="w-full justify-center"
            onClick={onSuggestionClick}
            suggestion={suggestion}
          />
        </motion.div>
      ))}
    </SuggestionsGrid>
  );
}
