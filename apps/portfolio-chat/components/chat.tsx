"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "@repo/ai";
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
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@repo/design-system/components/ai-elements/prompt-input";
import {
  Suggestion,
  Suggestions,
} from "@repo/design-system/components/ai-elements/suggestion";
import { cn } from "@repo/design-system/lib/utils";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { About } from "./about";
import { Projects, ProjectsSkeleton } from "./projects";
import { Resume, ResumeSkeleton } from "./resume";

const SUGGESTIONS = ["Show projects", "Experience", "About Me", "Tech stack"];

export function Chat() {
  const [text, setText] = useState("");
  const { error, messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    console.log(
      "[chat:ui] messages:",
      messages.length,
      "| status:",
      status,
      "| error:",
      error
    );
    messages.forEach((m, i) => {
      const partSummary = m.parts.map((p) => `${p.type}`).join(", ");
      console.log(
        `[chat:ui] message ${i} role=${m.role} parts=[${partSummary}]`
      );
    });
  }, [messages, status, error]);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) {
      return;
    }
    console.log("[chat:ui] sendMessage:", message.text?.slice(0, 80));
    sendMessage(message);
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log("[chat:ui] suggestion click:", suggestion);
    if (suggestion === "Experience") {
      sendMessage({ text: "Show resume", files: [] });
      setText("");
      return;
    }
    sendMessage({ text: suggestion, files: [] });
    setText("");
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Conversation>
          <ConversationContent className="mx-auto w-full max-w-[720px]">
            {messages.length === 0 ? (
              <ConversationEmptyState
                description="Send a message to start the conversation."
                icon={
                  <MessageSquare className="size-10 text-muted-foreground" />
                }
                title="No messages yet"
              />
            ) : (
              messages.map((msg) => (
                <div
                  className={cn(
                    "max-w flex w-full gap-2",
                    msg.role === "user" && "ml-auto"
                  )}
                  key={msg.id}
                >
                  <Message className="min-w-0 flex-1" from={msg.role}>
                    <MessageContent className="text-base">
                      {msg.parts.map((part, i) => {
                        console.log("part = ", part);
                        if (part.type === "text") {
                          return (
                            <MessageResponse key={`${msg.id}-${i}`}>
                              {part.text}
                            </MessageResponse>
                          );
                        }

                        // Handle tool-show_projects (with underscore) or tool-showProjects (camelCase)
                        if (
                          part.type === "tool-show_projects" ||
                          part.type === "tool-showProjects"
                        ) {
                          switch (part.state) {
                            case "input-available":
                            case "input-streaming":
                              return (
                                <div className="w-full" key={`${msg.id}-${i}`}>
                                  <ProjectsSkeleton />
                                </div>
                              );
                            case "output-available":
                              return (
                                <div className="w-full" key={`${msg.id}-${i}`}>
                                  <Projects
                                    {...(part.output as {
                                      copy?: string;
                                      projectCount: number;
                                      projects: Array<{
                                        id: string;
                                        title: string;
                                        tags: string[];
                                        categories: string[];
                                        description: string;
                                        shortDescription: string;
                                        date: string;
                                        url: string;
                                        published: boolean;
                                        image: string;
                                        gallery: string[];
                                      }>;
                                    })}
                                  />
                                </div>
                              );
                            case "output-error":
                              return (
                                <div key={`${msg.id}-${i}`}>
                                  Error: {part.errorText}
                                </div>
                              );
                            default:
                              return null;
                          }
                        }

                        if (
                          part.type === "tool-show_about" ||
                          part.type === "tool-showAbout"
                        ) {
                          switch (part.state) {
                            case "input-available":
                            case "input-streaming":
                              return (
                                <div key={`${msg.id}-${i}`}>
                                  <Loader />
                                </div>
                              );
                            case "output-available":
                              return (
                                <div className="w-full" key={`${msg.id}-${i}`}>
                                  <About
                                    {...(part.output as {
                                      title: string;
                                      paragraphs: string[];
                                    })}
                                  />
                                </div>
                              );
                            case "output-error":
                              return (
                                <div key={`${msg.id}-${i}`}>
                                  Error: {part.errorText}
                                </div>
                              );
                            default:
                              return null;
                          }
                        }

                        if (
                          part.type === "tool-show_resume" ||
                          part.type === "tool-showResume"
                        ) {
                          switch (part.state) {
                            case "input-available":
                            case "input-streaming":
                              return (
                                <div
                                  className="-translate-x-1/2 relative left-1/2 w-screen px-4 md:px-6"
                                  key={`${msg.id}-${i}`}
                                >
                                  <ResumeSkeleton />
                                </div>
                              );
                            case "output-available":
                              return (
                                <div
                                  className="-translate-x-1/2 relative left-1/2 w-screen min-w-0 max-w-full px-4 md:px-6"
                                  key={`${msg.id}-${i}`}
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
                            case "output-error":
                              return (
                                <div key={`${msg.id}-${i}`}>
                                  Error: {part.errorText}
                                </div>
                              );
                            default:
                              return null;
                          }
                        }

                        console.log(
                          "[chat:ui] skipping non-text part:",
                          part.type,
                          part
                        );
                        return null;
                      })}
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
              typeof error.message === "string" && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
                  {error.message}
                </div>
              )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="sticky bottom-0 z-10 flex shrink-0 flex-col items-center gap-3 border-border border-t bg-app p-3">
        {messages.length === 0 && (
          <Suggestions className="mx-auto grid w-full max-w-[720px] grid-cols-1 gap-2 lg:w-1/2 lg:grid-cols-2">
            {SUGGESTIONS.map((suggestion) => (
              <Suggestion
                className="w-full justify-center"
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}
        <div className="w-full max-w-[720px]">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                disabled={!text.trim() || status === "submitted"}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
