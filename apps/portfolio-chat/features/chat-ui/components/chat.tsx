"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@repo/design-system/components/ai-elements/prompt-input";
import { useEffect, useMemo, useState } from "react";
import { usePortfolioChat } from "@/contexts/chat-context";
import type { ExperienceEntry } from "@/data/experience";
import type { Project } from "@/data/projects";
import { Artifact } from "@/components/artifact";
import { ArtifactEmptyState } from "@/components/artifact-empty-state";
import type { ExperienceBoundingBox } from "@/components/experience";
import { FeaturedExperience } from "@/components/featured-experience";
import { FeaturedProject } from "@/components/featured-project";
import type { BoundingBox } from "@/components/projects";
import { Messages } from "@/features/chat-ui/components/messages";
import { Suggestions } from "@/features/chat-ui/components/suggestions";

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
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<
    ExperienceEntry[] | null
  >(null);
  const [boundingBox, setBoundingBox] = useState<
    BoundingBox | ExperienceBoundingBox | null
  >(null);
  const [artifactLoading, setArtifactLoading] = useState(false);
  const { error, messages, sendMessage, status } = usePortfolioChat();

  useEffect(() => {
    const hasContent = Boolean(
      selectedProject || (selectedExperience && selectedExperience.length > 0)
    );
    if (artifactOpen && hasContent) {
      setArtifactLoading(true);
      const timer = setTimeout(() => setArtifactLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [artifactOpen, selectedProject, selectedExperience]);

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

  const artifactContent = useMemo(() => {
    if (selectedProject) {
      return <FeaturedProject project={selectedProject} />;
    }
    if (selectedExperience && selectedExperience.length > 0) {
      return <FeaturedExperience experience={selectedExperience} />;
    }
    return <ArtifactEmptyState />;
  }, [selectedProject, selectedExperience]);

  const handleClose = () => {
    setArtifactOpen(false);
    setArtifactLoading(false);
    setSelectedProject(null);
    setSelectedExperience(null);
    setBoundingBox(null);
  };

  const handleExperienceExpand = (
    experience: ExperienceEntry[],
    box?: ExperienceBoundingBox
  ) => {
    setSelectedExperience(experience);
    setSelectedProject(null);
    setBoundingBox(box ?? null);
    setArtifactOpen(true);
  };

  return (
    <div
      className={`overscroll-behavior-contain flex h-full min-h-0 flex-1 flex-col overflow-hidden ${embedded ? "bg-transparent" : "bg-muted/20"}`}
    >
      {!embedded && (
        <Artifact
          boundingBox={boundingBox as BoundingBox | null}
          content={artifactContent}
          isLoading={artifactLoading}
          onClose={handleClose}
          onProjectSelect={setSelectedProject}
          open={artifactOpen}
        />
      )}
      <div
        className="chat-messages-container min-h-0 flex-1 overflow-hidden border border-border"
        data-testid="chat-messages-container"
      >

        <Messages
          error={error}
          messages={messages}
          onExperienceExpand={
            onExperienceExpandProp ?? handleExperienceExpand
          }
          onSuggestionClick={handleSuggestionClick}
          status={status}
        />
      </div>

      <div className="sticky bottom-0 z-10 flex shrink-0 flex-col items-center gap-3 border-border border-t bg-app p-3">
        {messages.length === 0 && (
          <Suggestions onSuggestionClick={handleSuggestionClick} />
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
