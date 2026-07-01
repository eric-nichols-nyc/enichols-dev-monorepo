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

export function useGenerateDraft(): UseGenerateDraftResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratePipelineResult | null>(null);

  const generate = useCallback(async (_body: GenerateRequestBody) => {
    setIsLoading(true);
    setError(null);

    try {
      const placeholder: GeneratePipelineResult = { errors: ["Not implemented"] };
      setResult(placeholder);
      return placeholder;
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
