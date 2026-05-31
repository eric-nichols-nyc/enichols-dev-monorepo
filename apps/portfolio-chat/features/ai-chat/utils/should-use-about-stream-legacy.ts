import type { RoutingResult } from "@/features/ai-chat/types/routing-result";

/**
 * Deterministic word-streamed intro for all `candidate_overview` turns (concise variants).
 * Preserves e2e/about-streaming: suppress About card, stream selected copy.
 */
export function shouldUseAboutStreamLegacy(routing: RoutingResult): boolean {
  return routing.intent === "candidate_overview";
}
