import { getPortfolioAssistantSystemPrompt } from "@/lib/ai/prompts/portfolio-assistant";
import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import { formatKnowledgeForPrompt } from "@/features/ai-chat/utils/load-knowledge-context";

const GROUNDING_RULES = `## Rules
- Answer using the portfolio knowledge above only.
- If the answer is not in the knowledge, say: "I don't have that in Eric's portfolio materials."
- Do not invent metrics, APIs, architecture, or employers not stated above.`;

export function buildGroundedSystemPrompt(
  context: LoadedKnowledgeContext
): string {
  const base = getPortfolioAssistantSystemPrompt();
  const knowledge = formatKnowledgeForPrompt(context);

  if (!knowledge) {
    return `${base}

You do not have portfolio knowledge loaded for this question. Say you do not have that detail in Eric's portfolio materials and suggest what the visitor could ask instead.`;
  }

  return `${base}

## Portfolio knowledge (use ONLY this content to answer)

${knowledge}

${GROUNDING_RULES}`;
}
