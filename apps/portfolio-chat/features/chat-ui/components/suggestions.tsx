"use client";

import { useId } from "react";
import {
  ArrowUpRightIcon,
  BriefcaseBusinessIcon,
  CodeXmlIcon,
  FolderOpenIcon,
  UserRoundIcon,
} from "lucide-react";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import projects from "@/data/projects";

const SUGGESTIONS = [
  {
    id: "projects",
    title: "Explore my work",
    description: projects.length
      ? `${projects.map((project) => project.title).join(", ")}, and how I built them.`
      : "Selected projects and the thinking behind them.",
    message: "Show me some projects",
    icon: FolderOpenIcon,
    featured: true,
  },
  {
    id: "about",
    title: "Meet the person",
    description: "How I work, what I care about, and life in NYC.",
    message: "Tell me about yourself",
    icon: UserRoundIcon,
    featured: false,
  },
  {
    id: "experience",
    title: "My experience",
    description: "From agency teams to enterprise products.",
    message: "What's your experience",
    icon: BriefcaseBusinessIcon,
    featured: false,
  },
  {
    id: "tech",
    title: "Inside my toolkit",
    description: "React, TypeScript, accessibility, and AI.",
    message: "What's your tech stack?",
    icon: CodeXmlIcon,
    featured: false,
  },
];

type SuggestionsProps = {
  disabled?: boolean;
  onSuggestionClick: (suggestion: string) => void;
};

export function Suggestions({
  disabled = false,
  onSuggestionClick,
}: SuggestionsProps) {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-heading`} className="w-full pb-6 text-left">
      <h2
        className="mb-4 text-sm font-normal text-muted-foreground"
        id={`${id}-heading`}
      >
        A few good places to start
      </h2>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {SUGGESTIONS.map(({
          id: topic, title, description, message, icon: Icon, featured,
        }) => (
          <Button
            aria-describedby={`${id}-${topic}-description`}
            aria-label={title}
            className={cn(
              "group h-auto min-h-[132px] w-full touch-manipulation flex-col items-stretch justify-start gap-3.5 whitespace-normal rounded-[14px] p-5 text-left font-normal text-foreground shadow-none",
              // Keep the Paper surfaces over the shared outline button's dark variant.
              "border-border! bg-card! hover:border-primary/50! hover:bg-secondary!",
              "focus-visible:border-primary! focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "transition-[background-color,border-color,transform] duration-150 ease-out motion-safe:active:scale-[0.99] motion-reduce:transition-none",
              featured && "border-primary/35! bg-secondary!"
            )}
            disabled={disabled}
            key={topic}
            onClick={() => onSuggestionClick(message)}
            type="button"
            variant="outline"
          >
            <span className="flex w-full min-w-0 items-center gap-3">
              <span className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <Icon aria-hidden="true" data-icon="inline-start" />
              </span>
              <span className="min-w-0 flex-1 text-base font-medium leading-[22px]">
                {title}
              </span>
              <ArrowUpRightIcon
                aria-hidden="true"
                className={cn(
                  "shrink-0 text-muted-foreground group-hover:text-primary group-focus-visible:text-primary",
                  featured && "text-primary"
                )}
                data-icon="inline-end"
              />
            </span>
            <span
              className="text-sm leading-[22px] text-[var(--text-secondary)]"
              id={`${id}-${topic}-description`}
            >
              {description}
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
