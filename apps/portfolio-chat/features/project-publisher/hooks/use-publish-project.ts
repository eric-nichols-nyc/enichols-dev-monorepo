"use client";

import type { Project } from "@/data/projects";
import type { PublishRequestBody } from "@/features/project-publisher/lib/schema";
import { useCallback, useState } from "react";

export type UsePublishProjectResult = {
  publish: (body: PublishRequestBody) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  publishedProject: Project | null;
};

export function usePublishProject(): UsePublishProjectResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedProject, setPublishedProject] = useState<Project | null>(
    null
  );

  const publish = useCallback(async (_body: PublishRequestBody) => {
    setIsLoading(true);
    setError(null);

    try {
      throw new Error("Not implemented");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Publish failed");
      setPublishedProject(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    publish,
    isLoading,
    error,
    publishedProject,
  };
}
