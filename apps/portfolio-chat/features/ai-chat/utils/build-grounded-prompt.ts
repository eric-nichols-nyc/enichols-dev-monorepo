import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import type { PortfolioIntent } from "@/features/ai-chat/types/routing-result";
import { formatKnowledgeForPrompt } from "@/features/ai-chat/utils/load-knowledge-context";
import {
  getPortfolioAssistantSystemPrompt,
  PORTFOLIO_VOICE_RULES,
} from "@/lib/ai/prompts/portfolio-assistant";

const CANDIDATE_OVERVIEW_BREVITY = `## Overview responses
- For questions about Eric's background or introduction: reply in at most 4 short sentences.
- Do not list every past employer in one answer; offer to show experience or projects for detail.`;

const GROUNDING_RULES = `## Rules
- Answer using the portfolio knowledge above only.
- If the answer is not in the knowledge, say: "I don't have that in my portfolio materials."
- Do not invent metrics, APIs, architecture, or employers not stated above.

${PORTFOLIO_VOICE_RULES}`;

export function buildGroundedSystemPrompt(
  context: LoadedKnowledgeContext,
  intent?: PortfolioIntent
): string {
  const base = getPortfolioAssistantSystemPrompt();
  const knowledge = formatKnowledgeForPrompt(context);
  const overviewRules =
    intent === "candidate_overview" ? `\n\n${CANDIDATE_OVERVIEW_BREVITY}` : "";

  if (!knowledge) {
    return `${base}${overviewRules}

You do not have portfolio knowledge loaded for this question. Tell the visitor you do not have that detail in your portfolio materials and suggest what they could ask you instead.`;
  }

  return `${base}${overviewRules}

## Portfolio knowledge (use ONLY this content to answer)

${knowledge}

${GROUNDING_RULES}`;
}
