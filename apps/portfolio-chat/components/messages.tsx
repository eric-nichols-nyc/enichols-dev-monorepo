"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@repo/design-system/components/ai-elements/conversation";
import { Loader } from "@repo/design-system/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@repo/design-system/components/ai-elements/message";
import { cn } from "@repo/design-system/lib/utils";
import type { UIMessage } from "ai";
import { MessageSquare } from "lucide-react";
import { useEffect } from "react";
import { useStickToBottomContext } from "use-stick-to-bottom";
import { usePortfolioChat } from "@/contexts/chat-context";
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

  if (part.type === "tool-show_resume" || part.type === "tool-showResume") {
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
      return (
        <div
          className="-translate-x-1/2 relative left-1/2 w-screen min-w-0 max-w-full px-4 md:px-6"
          key={`${msgId}-${i}`}
        >
          <Resume
            {...(part.output as {
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
            })}
          />
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

function ScrollOnSubmit() {
  const { status } = usePortfolioChat();
  const { scrollToBottom } = useStickToBottomContext();

  useEffect(() => {
    if (status === "submitted") {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return null;
}

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
  return (
    <Conversation className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      <ConversationContent className="mx-auto w-full max-w-[720px]">
        {messages.length === 0 ? (
          <ConversationEmptyState
            description="Send a message to start the conversation."
            icon={<MessageSquare className="size-10 text-muted-foreground" />}
            title="No messages yet"
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
              <Message className="min-w-0 flex-1" from={msg.role}>
                <MessageContent className="text-base">
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
      </ConversationContent>
      <ScrollOnSubmit />
      <ConversationScrollButton className="bottom-10 z-20" />
    </Conversation>
  );
}
