"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type RelatedProps = {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
};

export function Related({ suggestions, onSuggestionClick }: RelatedProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="mt-6 w-full">
      <h4 className="mb-3 font-semibold text-foreground text-lg">Related</h4>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {suggestions.map((suggestion) => (
          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-foreground text-sm transition-colors hover:bg-muted/50"
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            type="button"
          >
            <ChevronRight
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 flex-1">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
