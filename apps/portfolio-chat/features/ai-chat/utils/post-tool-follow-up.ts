import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import type { RoutingResult } from "@/features/ai-chat/types/routing-result";
import { getHybridNarration } from "@/features/ai-chat/utils/get-hybrid-narration";

export const TECH_STACK_FOLLOW_UP =
  "Here's the tech stack. Want to hear about a specific technology? Or how I've used it in a project?";

/** Whether to stream the projects grid follow-up after show_projects (RH9 fallback until dynamic suggestions). */
export function shouldStreamProjectsFollowUp(
  routing: RoutingResult,
  useLegacyAboutStream: boolean
): boolean {
  if (useLegacyAboutStream) {
    return true;
  }

  if (routing.clarificationNeeded) {
    return false;
  }

  return (
    routing.responseType === "static_display" ||
    routing.responseType === "hybrid"
  );
}

/**
 * Post-tool narration for show_tech_stack.
 * RH10: static pill match → no extra prose.
 * RH15–RH16: hybrid → grounded narration from loaded knowledge, generic fallback until Stage 5.
 */
export function getTechStackPostToolText(
  routing: RoutingResult,
  knowledgeContext: LoadedKnowledgeContext,
  useLegacyAboutStream: boolean
): string | null {
  if (useLegacyAboutStream) {
    return TECH_STACK_FOLLOW_UP;
  }

  if (routing.responseType === "static_display") {
    return null;
  }

  if (routing.responseType === "hybrid") {
    return getHybridNarration(knowledgeContext) ?? TECH_STACK_FOLLOW_UP;
  }

  return null;
}
