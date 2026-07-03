"use client";

import type {
  GeneratePipelineResult,
  GenerateRequestBody,
} from "@/features/project-publisher/lib/schema";
import { useCallback, useState } from "react";

export type UseGenerateDraftResult = {
  generate: (body: GenerateRequestBody) => Promise<GeneratePipelineResult>;
  isLoading: boolean;
  error: string | null;
  result: GeneratePipelineResult | null;
};

function parseApiErrorMessage(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return "Invalid request";
}

async function requestGenerateDraft(
  body: GenerateRequestBody
): Promise<GeneratePipelineResult> {
  const response = await fetch("/api/admin/projects/generate", {
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

  if (response.status === 400) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(parseApiErrorMessage(payload));
  }

  if (!response.ok) {
    throw new Error("Generate request failed");
  }

  return (await response.json()) as GeneratePipelineResult;
}

export function useGenerateDraft(): UseGenerateDraftResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratePipelineResult | null>(null);

  const generate = useCallback(async (body: GenerateRequestBody) => {
    setIsLoading(true);
    setError(null);

    try {
      const draft = await requestGenerateDraft(body);
      setResult(draft);
      return draft;
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Generate request failed";
      setError(message);
      const failure: GeneratePipelineResult = { errors: [message] };
      setResult(failure);
      return failure;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generate,
    isLoading,
    error,
    result,
  };
}
