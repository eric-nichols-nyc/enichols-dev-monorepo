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
import { ArrowDownIcon, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { About } from "./about";
import { Experience, ExperienceSkeleton } from "./experience";
import { Projects, ProjectsSkeleton } from "./projects";
import { Related } from "./related";
import { Resume, ResumeSkeleton } from "./resume";

function MessagePartRenderer({
  part,
  msgId,
  i,
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
          <Projects {...output} />
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
      type ExpEntry = {
        duration: string;
        company: string;
        titles: string[];
        description: string;
        technologies: string[];
        links?: Array<{ name: string; url: string }>;
      };
      const output = part.output as
        | ExpEntry[]
        | { experience: ExpEntry[]; related?: string[] };
      const experienceList = Array.isArray(output) ? output : output.experience;
      const related = Array.isArray(output)
        ? null
        : (output as { related?: string[] }).related;
      return (
        <div className="w-full" key={`${msgId}-${i}`}>
          <Experience experience={experienceList} />
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
    part.type === "tool-show_resume" ||
    part.type === "tool-showResume"
  ) {
    if (part.state === "input-available" || part.state === "input-streaming") {
      return (
        <div
          className="-translate-x-1/2 relative left-1/2 w-screen px-4 md:px-6"
          key={`${msgId}-${i}`}
        >
          <ResumeSkeleton />
        </div>
      );
    }
    if (part.state === "output-available") {
      const output = part.output as {
        name: string;
        title: string;
        location: string;
        contact: string;
        summary: string;
        skills: string[];
        experience: Array<{
          title: string;
          company: string;
          location: string;
          dates: string;
          highlights: string[];
          tech: string;
        }>;
        related?: string[];
      };
      const { related, ...resumeData } = output;
      return (
        <div
          className="-translate-x-1/2 relative left-1/2 w-screen min-w-0 max-w-full px-4 md:px-6"
          key={`${msgId}-${i}`}
        >
          <Resume {...resumeData} />
          {related?.length ? (
            <div className="mt-4">
              <Related
                onSuggestionClick={onSuggestionClick}
                suggestions={related}
              />
            </div>
          ) : null}
        </div>
      );
    }
    if (part.state === "output-error") {
      return <div key={`${msgId}-${i}`}>Error: {part.errorText}</div>;
    }
  }

  return null;
}

function getProjectsRelatedForMessage(msg: {
  parts: { type: string; state?: string; output?: unknown }[];
}) {
  const projectsPart = msg.parts.find(
    (p) =>
      (p.type === "tool-show_projects" || p.type === "tool-showProjects") &&
      p.state === "output-available" &&
      p.output &&
      typeof p.output === "object" &&
      "related" in p.output
  ) as { output?: { related?: string[] } } | undefined;
  const hasText = msg.parts.some((p) => p.type === "text");
  if (!(hasText && projectsPart?.output?.related?.length)) {
    return null;
  }
  return projectsPart.output.related;
}

const NEAR_BOTTOM_THRESHOLD = 70;

type MessagesProps = {
  error: unknown;
  messages: UIMessage[];
  onSuggestionClick: (suggestion: string) => void;
  status: "streaming" | "submitted" | "ready" | "error";
};

export function Messages({
  error,
  messages,
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
            <ConversationEmptyState
              description="I'm Eric — a senior frontend engineer focused on accessibility, React, and building AI-driven experiences. Ask about my projects, experience, or anything else you'd like to know."
              icon={<MessageSquare className="size-10 text-muted-foreground" />}
              title="Hi, I'm Eric Nichols"
            />
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
                        onSuggestionClick={onSuggestionClick}
                        part={part}
                      />
                    ))}
                    {(() => {
                      const related = getProjectsRelatedForMessage(msg);
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
