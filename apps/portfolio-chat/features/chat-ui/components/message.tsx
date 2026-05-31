"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@repo/design-system/components/ai-elements/message";
import { cn } from "@repo/design-system/lib/utils";
import type { UIMessage } from "ai";
import { About } from "@/components/about";
import type { ExperienceBoundingBox } from "@/components/experience";
import { Experience } from "@/components/experience";
import type { BoundingBox } from "@/components/projects";
import { Projects } from "@/components/projects";
import type { Project } from "@/data/projects";
import { Related } from "@/components/related";
import { TechStack, TechStackSkeleton } from "@/components/tech-stack";
import { ThinkingMessage } from "@/features/chat-ui/components/thinking-message";
import { getAssistantThinkingVariant } from "@/features/chat-ui/lib/assistant-thinking";

type ExpEntry = {
  duration: string;
  company: string;
  titles: string[];
  description: string;
  technologies: string[];
  links?: Array<{ name: string; url: string }>;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: presentational switch over many part types
function MessagePartRenderer({
  part,
  msgId,
  i,
  onExperienceExpand,
  onProjectSelect,
  onSuggestionClick,
}: {
  part: {
    type: string;
    state?: string;
    preliminary?: boolean;
    output?: unknown;
    data?: unknown;
    errorText?: string;
    text?: string;
  };
  msgId: string;
  i: number;
  onExperienceExpand?: (
    experience: import("@/data/experience").ExperienceEntry[],
    boundingBox?: ExperienceBoundingBox
  ) => void;
  onProjectSelect?: (project: Project, boundingBox?: BoundingBox) => void;
  onSuggestionClick: (s: string) => void;
}) {
  if (part.type === "text") {
    return <MessageResponse key={`${msgId}-${i}`}>{part.text}</MessageResponse>;
  }

  if (part.type === "data-related") {
    const suggestions =
      part.data &&
      typeof part.data === "object" &&
      "suggestions" in part.data &&
      Array.isArray((part.data as { suggestions?: unknown }).suggestions)
        ? ((part.data as { suggestions: string[] }).suggestions ?? [])
        : [];

    if (suggestions.length > 0) {
      return (
        <div className="mt-4 w-full" key={`${msgId}-${i}`}>
          <Related
            onSuggestionClick={onSuggestionClick}
            suggestions={suggestions}
          />
        </div>
      );
    }
  }

  if (part.type === "tool-show_projects" || part.type === "tool-showProjects") {
    if (part.state === "input-available" || part.state === "input-streaming") {
      return null;
    }
    if (part.state === "output-available") {
      const output = part.output as {
        projectCount: number;
        projects: import("@/data/projects").Project[];
        related?: string[];
      };
      return (
        <div className="w-full" key={`${msgId}-${i}`}>
          <Projects {...output} onProjectSelect={onProjectSelect} />
        </div>
      );
    }
    if (part.state === "output-error") {
      return <div key={`${msgId}-${i}`}>Error: {part.errorText}</div>;
    }
  }

  if (
    part.type === "tool-show_experience" ||
    part.type === "tool-showExperience"
  ) {
    if (part.state === "input-available" || part.state === "input-streaming") {
      return null;
    }
    if (part.state === "output-available") {
      const output = part.output as
        | ExpEntry[]
        | { experience: ExpEntry[]; copy?: string; related?: string[] };
      const experienceList = Array.isArray(output) ? output : output.experience;
      const copy = Array.isArray(output) ? null : output.copy;
      const related = Array.isArray(output)
        ? null
        : (output as { related?: string[] }).related;
      return (
        <div className="w-full space-y-4" key={`${msgId}-${i}`}>
          <Experience
            experience={experienceList}
            onExpand={onExperienceExpand}
          />
          {copy ? (
            <p className="text-muted-foreground text-sm">{copy}</p>
          ) : null}
          {(related?.length ?? 0) > 0 ? (
            <Related
              onSuggestionClick={onSuggestionClick}
              suggestions={related ?? []}
            />
          ) : null}
        </div>
      );
    }
    if (part.state === "output-error") {
      return <div key={`${msgId}-${i}`}>Error: {part.errorText}</div>;
    }
  }

  if (part.type === "tool-show_about" || part.type === "tool-showAbout") {
    if (part.state === "input-available" || part.state === "input-streaming") {
      return null;
    }
    if (part.state === "output-available") {
      const output = part.output as {
        title: string;
        paragraphs: string[];
        socialLinks?: Array<{ href: string; label: string }>;
        related?: string[];
      };
      return (
        <div className="w-full space-y-3" key={`${msgId}-${i}`}>
          <About
            paragraphs={output.paragraphs}
            socialLinks={output.socialLinks}
            title={output.title}
          />
          {part.preliminary ? (
            <p className="text-muted-foreground text-xs">Streaming about...</p>
          ) : null}
          {(output.related?.length ?? 0) > 0 ? (
            <Related
              onSuggestionClick={onSuggestionClick}
              suggestions={output.related ?? []}
            />
          ) : null}
        </div>
      );
    }
    if (part.state === "output-error") {
      return <div key={`${msgId}-${i}`}>Error: {part.errorText}</div>;
    }
  }
  if (
    part.type === "tool-show_tech_stack" ||
    part.type === "tool-showTechStack"
  ) {
    if (part.state === "input-available" || part.state === "input-streaming") {
      return (
        <div
          aria-busy="true"
          aria-label="Loading tech stack"
          className="w-full"
          key={`${msgId}-${i}`}
          role="status"
        >
          <TechStackSkeleton />
        </div>
      );
    }
    if (part.state === "output-available") {
      const output = part.output as {
        tech: Record<
          string,
          Array<{ name: string; icon?: string; knows?: string }>
        >;
        related?: string[];
      };
      return (
        <div className="w-full" key={`${msgId}-${i}`}>
          <TechStack tech={output.tech} />
        </div>
      );
    }
    if (part.state === "output-error") {
      return <div key={`${msgId}-${i}`}>Error: {part.errorText}</div>;
    }
  }

  return null;
}

function getRelatedForMessage(msg: {
  parts: { type: string; state?: string; output?: unknown }[];
}) {
  const hasText = msg.parts.some((p) => p.type === "text");
  if (!hasText) {
    return null;
  }

  const projectsPart = msg.parts.find(
    (p) =>
      (p.type === "tool-show_projects" || p.type === "tool-showProjects") &&
      p.state === "output-available" &&
      p.output &&
      typeof p.output === "object" &&
      "related" in p.output
  ) as { output?: { related?: string[] } } | undefined;

  const techStackPart = msg.parts.find(
    (p) =>
      (p.type === "tool-show_tech_stack" || p.type === "tool-showTechStack") &&
      p.state === "output-available" &&
      p.output &&
      typeof p.output === "object" &&
      "related" in p.output
  ) as { output?: { related?: string[] } } | undefined;

  return (
    projectsPart?.output?.related ?? techStackPart?.output?.related ?? null
  );
}

export type ChatMessageProps = {
  msg: UIMessage;
  /** Active assistant in the latest turn (shows pinned thinking header) */
  isActiveAssistant?: boolean;
  chatStatus?: "streaming" | "submitted" | "ready" | "error";
  onExperienceExpand?: (
    experience: import("@/data/experience").ExperienceEntry[],
    boundingBox?: ExperienceBoundingBox
  ) => void;
  onProjectSelect?: (project: Project, boundingBox?: BoundingBox) => void;
  onSuggestionClick: (suggestion: string) => void;
};

export function ChatMessage({
  msg,
  isActiveAssistant = false,
  chatStatus = "ready",
  onExperienceExpand,
  onProjectSelect,
  onSuggestionClick,
}: ChatMessageProps) {
  const related = getRelatedForMessage(msg);
  const thinkingVariant =
    msg.role === "assistant"
      ? getAssistantThinkingVariant({
          parts: msg.parts ?? [],
          status: chatStatus,
          isActiveAssistant,
        })
      : null;

  return (
    <div className="min-w-0 flex-1">
      <Message
        className={cn(
          "min-w-0 flex-1",
          msg.role === "user",
          msg.role === "assistant"
        )}
        from={msg.role}
      >
        <MessageContent className="text-base">
          {thinkingVariant ? (
            <ThinkingMessage variant={thinkingVariant} />
          ) : null}
          {msg.parts.map((part, i) => (
            <MessagePartRenderer
              i={i}
              key={`${msg.id}-${i}`}
              msgId={msg.id}
              onExperienceExpand={onExperienceExpand}
              onProjectSelect={onProjectSelect}
              onSuggestionClick={onSuggestionClick}
              part={part}
            />
          ))}
          {related ? (
            <div className="mt-4 w-full">
              <Related
                onSuggestionClick={onSuggestionClick}
                suggestions={related}
              />
            </div>
          ) : null}
        </MessageContent>
      </Message>
    </div>
  );
}
