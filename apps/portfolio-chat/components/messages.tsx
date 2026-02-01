"use client";

import { ConversationEmptyState } from "@repo/design-system/components/ai-elements/conversation";
import { Loader } from "@repo/design-system/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@repo/design-system/components/ai-elements/message";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import type { UIMessage } from "ai";
import { ArrowDownIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { About } from "./about";
import type { ExperienceBoundingBox } from "./experience";
import { Experience, ExperienceSkeleton } from "./experience";
import { Greeting } from "./greeting";
import type { BoundingBox } from "./projects";
import { Projects, ProjectsSkeleton } from "./projects";
import { Related } from "./related";
import { TechStack, TechStackSkeleton } from "./tech-stack";

type ExpEntry = {
  duration: string;
  company: string;
  titles: string[];
  description: string;
  technologies: string[];
  links?: Array<{ name: string; url: string }>;
};

function MessagePartRenderer({
  part,
  msgId,
  i,
  onExperienceExpand,
  onProjectExpand,
  onSuggestionClick,
}: {
  part: {
    type: string;
    state?: string;
    output?: unknown;
    errorText?: string;
    text?: string;
  };
  msgId: string;
  i: number;
  onProjectExpand?: (
    project: import("@/data/projects").Project,
    boundingBox?: BoundingBox
  ) => void;
  onExperienceExpand?: (
    experience: import("@/data/experience").ExperienceEntry[],
    boundingBox?: ExperienceBoundingBox
  ) => void;
  onSuggestionClick: (s: string) => void;
}) {
  if (part.type === "text") {
    return <MessageResponse key={`${msgId}-${i}`}>{part.text}</MessageResponse>;
  }

  if (part.type === "tool-show_projects" || part.type === "tool-showProjects") {
    if (part.state === "input-available" || part.state === "input-streaming") {
      return (
        <div className="w-full" key={`${msgId}-${i}`}>
          <ProjectsSkeleton />
        </div>
      );
    }
    if (part.state === "output-available") {
      const output = part.output as {
        projectCount: number;
        projects: import("@/data/projects").Project[];
        related?: string[];
      };
      return (
        <div className="w-full" key={`${msgId}-${i}`}>
          <Projects onExpand={onProjectExpand} {...output} />
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
      return (
        <div className="w-full" key={`${msgId}-${i}`}>
          <ExperienceSkeleton />
        </div>
      );
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
          {related?.length ? (
            <Related
              onSuggestionClick={onSuggestionClick}
              suggestions={related}
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
      return (
        <div key={`${msgId}-${i}`}>
          <Loader />
        </div>
      );
    }
    if (part.state === "output-available") {
      const output = part.output as {
        title: string;
        paragraphs: string[];
        related?: string[];
      };
      return (
        <div className="w-full" key={`${msgId}-${i}`}>
          <About paragraphs={output.paragraphs} title={output.title} />
          {output.related?.length ? (
            <Related
              onSuggestionClick={onSuggestionClick}
              suggestions={output.related}
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
        <div className="w-full" key={`${msgId}-${i}`}>
          <TechStackSkeleton />
        </div>
      );
    }
    if (part.state === "output-available") {
      const output = part.output as {
        tech: Record<string, Array<{ name: string; icon?: string; level?: string; years?: string }>>;
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

const NEAR_BOTTOM_THRESHOLD = 70;

type MessagesProps = {
  error: unknown;
  messages: UIMessage[];
  onExperienceExpand?: (
    experience: import("@/data/experience").ExperienceEntry[],
    boundingBox?: ExperienceBoundingBox
  ) => void;
  onProjectExpand?: (
    project: import("@/data/projects").Project,
    boundingBox?: BoundingBox
  ) => void;
  onSuggestionClick: (suggestion: string) => void;
  status: "streaming" | "submitted" | "ready" | "error";
};

export function Messages({
  error,
  messages,
  onExperienceExpand,
  onProjectExpand,
  onSuggestionClick,
  status,
}: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight });
  }, []);

  const checkIsAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom <= NEAR_BOTTOM_THRESHOLD);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.addEventListener("scroll", checkIsAtBottom, { passive: true });
    const ro = new ResizeObserver(checkIsAtBottom);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkIsAtBottom);
      ro.disconnect();
    };
  }, [checkIsAtBottom]);

  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      scrollToBottom();
      setIsAtBottom(true);
    }
  }, [status, scrollToBottom]);

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        ref={scrollRef}
        role="log"
      >
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 p-4">
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <Greeting />
            </ConversationEmptyState>
          ) : (
            messages.map((msg) => (
              <div
                className={cn(
                  "flex w-full gap-2",
                  msg.role === "user" && "ml-auto"
                )}
                key={msg.id}
              >
                <Message className={cn("min-w-0 flex-1")} from={msg.role}>
                  <MessageContent
                    className={cn(
                      "text-base",
                      msg.role === "assistant" && "min-h-24"
                    )}
                  >
                    {msg.parts.map((part, i) => (
                      <MessagePartRenderer
                        i={i}
                        key={`${msg.id}-${i}`}
                        msgId={msg.id}
                        onExperienceExpand={onExperienceExpand}
                        onProjectExpand={onProjectExpand}
                        onSuggestionClick={onSuggestionClick}
                        part={part}
                      />
                    ))}
                    {(() => {
                      const related = getRelatedForMessage(msg);
                      return related ? (
                        <div className="mt-4 w-full">
                          <Related
                            onSuggestionClick={onSuggestionClick}
                            suggestions={related}
                          />
                        </div>
                      ) : null;
                    })()}
                  </MessageContent>
                </Message>
              </div>
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
            typeof (error as { message: unknown }).message === "string" && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                {(error as { message: string }).message}
              </div>
            )}
        </div>
      </div>
      {!isAtBottom && (
        <Button
          aria-label="Scroll to bottom"
          className="-translate-x-1/2 absolute bottom-10 left-[50%] z-20 rounded-full"
          onClick={scrollToBottom}
          size="icon"
          type="button"
          variant="outline"
        >
          <ArrowDownIcon className="size-4" />
        </Button>
      )}
    </div>
  );
}
