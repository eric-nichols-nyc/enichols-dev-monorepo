"use client";

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
import { useState } from "react";
import { usePortfolioChat } from "@/contexts/chat-context";
import { Artifact } from "./artifact";
import { Messages } from "./messages";

const SUGGESTIONS = [
  "Show me some projects",
  "Tell me about Eric",
  "What's your tech stack?",
  "View complete resume",
];

type ChatProps = {
  embedded?: boolean;
  onProjectExpand?: (project: import("@/data/projects").Project) => void;
};

export function Chat({ embedded, onProjectExpand }: ChatProps) {
  const [text, setText] = useState("");
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<import("@/data/projects").Project | null>(null);
  const { error, messages, sendMessage, status } = usePortfolioChat();

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) {
      return;
    }
    sendMessage(message);
    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "Experience") {
      sendMessage({ text: "Show my work experience", files: [] });
    } else {
      sendMessage({ text: suggestion, files: [] });
    }
    setText("");
  };

  return (
    <div
      className={`overscroll-behavior-contain flex h-full min-h-0 flex-1 flex-col overflow-hidden ${embedded ? "bg-transparent" : "bg-muted/20"}`}
    >
      {!embedded && (
        <Artifact
          onClose={() => {
            setArtifactOpen(false);
            setSelectedProject(null);
          }}
          onProjectSelect={setSelectedProject}
          open={artifactOpen}
          project={selectedProject}
        />
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <Messages
          error={error}
          messages={messages}
          onProjectExpand={
            onProjectExpand ??
            ((project) => {
              setSelectedProject(project);
              setArtifactOpen(true);
            })
          }
          onSuggestionClick={handleSuggestionClick}
          status={status}
        />
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
