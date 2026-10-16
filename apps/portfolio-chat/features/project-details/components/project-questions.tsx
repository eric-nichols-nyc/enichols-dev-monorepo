"use client";

import { useRef, useState } from "react";
import { ChevronDownIcon, MessageCircleIcon } from "lucide-react";
import {
  Message, MessageContent, MessageResponse,
} from "@repo/design-system/components/ai-elements/message";
import {
  PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea,
} from "@repo/design-system/components/ai-elements/prompt-input";
import { Button } from "@repo/design-system/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@repo/design-system/components/ui/collapsible";
import type { Project } from "@/data/projects";
import { useProjectQuestions } from "@/features/project-details/hooks/use-project-questions";
import { getProjectFollowUps, messageText } from "@/features/project-details/lib/project-questions";

export function ProjectQuestions({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const chat = useProjectQuestions(project.id);
  const choices = getProjectFollowUps(project, chat.messages);
  const ask = (question: string) => { void chat.send(question); input.current?.focus({ preventScroll: true }); };

  return (
    <Collapsible className="mb-6 rounded-xl border border-border bg-card" onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger asChild>
        <Button className="h-auto w-full justify-between gap-3 whitespace-normal p-4 text-left" variant="ghost">
          <MessageCircleIcon aria-hidden="true" data-icon="inline-start" />
          <span className="min-w-0 flex-1">Ask about {project.title}</span>
          <ChevronDownIcon aria-hidden="true" data-icon="inline-end" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <p className="text-sm text-muted-foreground">Curious about the build? Ask a question and explore the details.</p>
          {chat.messages.length > 0 && (
            <div aria-label={`${project.title} questions and answers`} className="flex flex-col gap-4" role="log">
              {chat.messages.map((message) => {
                const text = messageText(message);
                if (!text) return null;
                return (
                  <Message from={message.role} key={message.id}>
                    <MessageContent className="text-sm">
                      {message.role === "assistant" ? <MessageResponse>{text}</MessageResponse> : text}
                    </MessageContent>
                  </Message>
                );
              })}
            </div>
          )}
          {chat.status === "submitted" && <p className="text-sm text-muted-foreground" role="status">Thinking about {project.title}…</p>}
          {chat.error && <p className="text-sm text-destructive" role="alert">The project assistant couldn’t respond. Please try again.</p>}
          {!chat.busy && !chat.error && choices.length > 0 && (
            <div aria-label="Suggested project questions" className="flex flex-wrap gap-2">
              {choices.map((question) => (
                <Button className="h-auto whitespace-normal text-left" key={question} onClick={() => ask(question)} size="sm" variant="outline">{question}</Button>
              ))}
            </div>
          )}
          <PromptInput onSubmit={({ text }) => { if (text) void chat.send(text); }}>
            <PromptInputBody>
              <PromptInputTextarea
                aria-label={`Ask about ${project.title}`}
                maxLength={2000}
                onChange={(event) => chat.setDraft(event.target.value)}
                placeholder={`Ask about ${project.title}…`}
                ref={input}
                value={chat.draft}
              />
            </PromptInputBody>
            <PromptInputFooter className="justify-between">
              <Button disabled={!chat.messages.length && !chat.error} onClick={() => { void chat.clear(); }} size="sm" type="button" variant="ghost">Clear questions</Button>
              {chat.busy
                ? <Button onClick={() => { void chat.stop(); }} size="sm" type="button" variant="secondary">Stop answer</Button>
                : <PromptInputSubmit aria-label="Send project question" disabled={!chat.draft.trim()} status={chat.status} />}
            </PromptInputFooter>
          </PromptInput>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
