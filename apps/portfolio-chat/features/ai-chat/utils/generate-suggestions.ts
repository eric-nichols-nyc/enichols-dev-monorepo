import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import type { RoutingResult } from "@/features/ai-chat/types/routing-result";
import {
  MAX_SUGGESTIONS,
  MIN_SUGGESTIONS,
  SUGGESTION_TEMPLATES,
  truncateSuggestion,
  type SuggestionTemplateContext,
} from "@/features/ai-chat/utils/suggestion-templates";

export type SuggestionInput = {
  routingResult: RoutingResult;
  loadedContext: LoadedKnowledgeContext;
  assistantText?: string;
  toolName?: string;
};

function normalizeForDedup(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function dedupeSuggestions(suggestions: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const suggestion of suggestions) {
    const normalized = normalizeForDedup(suggestion);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    unique.push(truncateSuggestion(suggestion));
  }

  return unique;
}

function resolveTemplateKey(
  routingResult: RoutingResult
): keyof typeof SUGGESTION_TEMPLATES {
  if (routingResult.clarificationNeeded) {
    return "clarificationNeeded";
  }

  return routingResult.intent;
}

export function generateSuggestions(input: SuggestionInput): string[] {
  const templateKey = resolveTemplateKey(input.routingResult);
  const template = SUGGESTION_TEMPLATES[templateKey];

  const ctx: SuggestionTemplateContext = {
    routing: input.routingResult,
    context: input.loadedContext,
    assistantText: input.assistantText,
    toolName: input.toolName,
  };

  const raw = template(ctx);
  const unique = dedupeSuggestions(raw);

  if (unique.length >= MIN_SUGGESTIONS) {
    return unique.slice(0, MAX_SUGGESTIONS);
  }

  const fallbacks = dedupeSuggestions([
    ...unique,
    ...SUGGESTION_TEMPLATES.candidate_overview(ctx),
  ]);

  return fallbacks.slice(0, MAX_SUGGESTIONS);
}
