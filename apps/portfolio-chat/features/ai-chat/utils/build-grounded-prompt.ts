import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import { formatKnowledgeForPrompt } from "@/features/ai-chat/utils/load-knowledge-context";
import {
  getPortfolioAssistantSystemPrompt,
  PORTFOLIO_VOICE_RULES,
} from "@/lib/ai/prompts/portfolio-assistant";

const GROUNDING_RULES = `## Rules
- Answer using the portfolio knowledge above only.
- If the answer is not in the knowledge, say: "I don't have that in my portfolio materials."
- Do not invent metrics, APIs, architecture, or employers not stated above.

${PORTFOLIO_VOICE_RULES}`;

export function buildGroundedSystemPrompt(
  context: LoadedKnowledgeContext
): string {
  const base = getPortfolioAssistantSystemPrompt();
  const knowledge = formatKnowledgeForPrompt(context);

  if (!knowledge) {
    return `${base}

You do not have portfolio knowledge loaded for this question. Tell the visitor you do not have that detail in your portfolio materials and suggest what they could ask you instead.`;
  }

  return `${base}

## Portfolio knowledge (use ONLY this content to answer)

${knowledge}

${GROUNDING_RULES}`;
}
