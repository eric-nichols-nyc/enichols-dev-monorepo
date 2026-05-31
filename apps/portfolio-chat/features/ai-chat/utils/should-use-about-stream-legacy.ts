import type { RoutingResult } from "@/features/ai-chat/types/routing-result";
import { normalizeMessage } from "@/features/ai-chat/utils/intent-router";

const ABOUT_STREAM_PHRASES = ["tell me about yourself"] as const;

/** Preserves word-streamed about UX + e2e/about-streaming.spec.ts */
export function shouldUseAboutStreamLegacy(
  routing: RoutingResult,
  message: string
): boolean {
  if (routing.intent !== "candidate_overview") {
    return false;
  }

  const normalized = normalizeMessage(message);
  return ABOUT_STREAM_PHRASES.includes(
    normalized as (typeof ABOUT_STREAM_PHRASES)[number]
  );
}
