"use client";

import { useMemo, useRef, useState } from "react";
import { RotateCcwIcon } from "lucide-react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@repo/design-system/components/ai-elements/prompt-input";
import { Button } from "@repo/design-system/components/ui/button";
import { usePortfolioChat } from "@/contexts/chat-context";
import type { ExperienceEntry } from "@/data/experience";
import type { Project } from "@/data/projects";
import { DetailOverlay } from "@/features/project-details/components/detail-overlay";
import { ProjectDetail } from "@/features/project-details/components/project-detail";
import { ArtifactEmptyState } from "@/components/artifact-empty-state";
import type { ExperienceBoundingBox } from "@/components/experience";
import { FeaturedExperience } from "@/components/featured-experience";
import { Messages } from "@/features/chat-ui/components/messages";

export type ChatProps = {
  embedded?: boolean;
  onExperienceExpand?: (
    experience: ExperienceEntry[],
    boundingBox?: ExperienceBoundingBox
  ) => void;
};

export function Chat({
  embedded,
  onExperienceExpand: onExperienceExpandProp,
}: ChatProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<
    ExperienceEntry[] | null
  >(null);
  const { clearMessages, error, messages, sendMessage, status } = usePortfolioChat();

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
    inputRef.current?.focus({ preventScroll: true });
  };

  const artifactContent = useMemo(() => {
    if (selectedProject) {
      return <ProjectDetail project={selectedProject} />;
    }
    if (selectedExperience && selectedExperience.length > 0) {
      return <FeaturedExperience experience={selectedExperience} />;
    }
    return <ArtifactEmptyState />;
  }, [selectedProject, selectedExperience]);

  const handleClose = () => {
    setArtifactOpen(false);
    setSelectedProject(null);
    setSelectedExperience(null);
  };

  const handleReset = () => {
    clearMessages();
    setText("");
    handleClose();
  };

  const handleExperienceExpand = (
    experience: ExperienceEntry[]
  ) => {
    setSelectedExperience(experience);
    setSelectedProject(null);
    setArtifactOpen(true);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedExperience(null);
    setArtifactOpen(true);
  };

  return (
    <div
      className={`overscroll-behavior-contain flex h-full min-h-0 flex-1 flex-col overflow-hidden ${embedded ? "bg-transparent" : "bg-muted/20"}`}
    >
      {!embedded && (
        <DetailOverlay
          onClose={handleClose}
          open={artifactOpen}
          title={selectedProject?.title ?? "Experience"}
        >
          {artifactContent}
        </DetailOverlay>
      )}
      {!embedded && (
        <div className="flex shrink-0 justify-end px-4 py-3">
          <Button
            aria-label="Reset chat"
            className="min-h-[44px] min-w-[44px] touch-manipulation rounded-xl text-foreground shadow-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            onClick={handleReset}
            size="icon"
            title="Reset chat"
            type="button"
            variant="secondary"
          >
            <RotateCcwIcon aria-hidden="true" />
          </Button>
        </div>
      )}
      <div
        className="chat-messages-container min-h-0 flex-1 overflow-hidden border-x border-b border-border"
        data-testid="chat-messages-container"
      >

        <Messages
          error={error}
          messages={messages}
          onExperienceExpand={
            onExperienceExpandProp ?? handleExperienceExpand
          }
          onProjectSelect={handleProjectSelect}
          onSuggestionClick={handleSuggestionClick}
          showWelcome={!embedded}
          status={status}
        />
      </div>

      <div className="sticky bottom-0 z-10 flex shrink-0 flex-col items-center gap-3 border-border border-t bg-app p-3">
        <div className="w-full max-w-[720px]">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                ref={inputRef}
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
