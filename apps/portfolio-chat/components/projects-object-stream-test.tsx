"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState } from "react";
import { projectObjectSchema } from "@/app/api/chat/projects-object/schema";
import portfolioProjects from "@/data/projects";
import { projectPreviewSentence } from "@/lib/project-preview-sentence";

export function ProjectsObjectStreamTest() {
  const [prompt, setPrompt] = useState("Show AI-focused projects");
  const [finishError, setFinishError] = useState<string | null>(null);
  const { error, isLoading, object, stop, submit } = useObject({
    api: "/api/chat/projects-object",
    schema: projectObjectSchema,
    onFinish({ error: schemaError }) {
      setFinishError(schemaError?.message ?? null);
    },
    onError() {
      setFinishError(null);
    },
  });

  return (
    <div className="w-full max-w-[720px] rounded-lg border border-border bg-card/40 p-3">
      <p className="mb-2 font-medium text-sm">Object stream test</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt for project filtering"
          value={prompt}
        />
        <div className="flex gap-2">
          <button
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            disabled={isLoading || !prompt.trim()}
            onClick={() => {
              setFinishError(null);
              submit(prompt);
            }}
            type="button"
          >
            Stream
          </button>
          {isLoading ? (
            <button
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
              onClick={() => stop()}
              type="button"
            >
              Stop
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-destructive text-xs">Something went wrong.</p>
      ) : null}
      {isLoading ? (
        <p className="mt-2 text-muted-foreground text-xs">Streaming...</p>
      ) : null}
      {finishError ? (
        <p className="mt-2 text-destructive text-xs">
          Schema validation failed: {finishError}
        </p>
      ) : null}

      <div className="mt-3 space-y-2">
        {object?.projects?.map((project) => {
          const full =
            portfolioProjects.find((p) => p.id === project?.id) ?? null;
          const sentence = full
            ? projectPreviewSentence(full.description)
            : "";
          return (
            <div
              className="rounded-md border border-border bg-background/80 p-2"
              key={project?.id ?? project?.title}
            >
              <p className="font-medium text-sm">{project?.title ?? "..."}</p>
              <p className="text-muted-foreground text-xs">
                {project?.shortDescription ?? "..."}
              </p>
              {sentence ? (
                <p className="mt-1 text-muted-foreground/90 text-xs leading-snug">
                  {sentence}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
