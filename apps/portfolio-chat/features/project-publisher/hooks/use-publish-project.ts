"use client";

import { useCallback, useState } from "react";
import type { Project } from "@/data/projects";
import type { PublishRequestBody } from "@/features/project-publisher/lib/schema";

export type UsePublishProjectResult = {
  publish: (body: PublishRequestBody) => Promise<Project | null>;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
  publishedProject: Project | null;
};

function parseApiErrorMessage(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "errors" in payload &&
    Array.isArray(payload.errors) &&
    payload.errors.every((entry) => typeof entry === "string") &&
    payload.errors.length > 0
  ) {
    return payload.errors.join("\n");
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return "Publish failed";
}

async function requestPublishProject(
  body: PublishRequestBody
): Promise<Project> {
  const response = await fetch("/api/admin/projects/publish", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (response.status === 404) {
    throw new Error("Admin feature is disabled");
  }

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(parseApiErrorMessage(payload));
  }

  if (response.status === 400 || response.status === 409) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(parseApiErrorMessage(payload));
  }

  if (!response.ok) {
    throw new Error("Publish request failed");
  }

  const payload: unknown = await response.json();

  if (
    payload &&
    typeof payload === "object" &&
    "project" in payload &&
    payload.project &&
    typeof payload.project === "object"
  ) {
    return payload.project as Project;
  }

  throw new Error("Publish request failed");
}

export function usePublishProject(): UsePublishProjectResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedProject, setPublishedProject] = useState<Project | null>(
    null
  );

  const publish = useCallback(async (body: PublishRequestBody) => {
    setIsLoading(true);
    setError(null);

    try {
      const project = await requestPublishProject(body);
      setPublishedProject(project);
      return project;
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Publish failed";
      setError(message);
      setPublishedProject(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setPublishedProject(null);
  }, []);

  return {
    publish,
    reset,
    isLoading,
    error,
    publishedProject,
  };
}
