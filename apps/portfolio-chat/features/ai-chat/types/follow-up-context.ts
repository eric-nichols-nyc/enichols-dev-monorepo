import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import type { PortfolioIntent, RoutingResult } from "@/features/ai-chat/types/routing-result";

export type FollowUpSource = {
  id: string;
  kind: "knowledge" | "tool";
  path: string;
  section: string;
  content: string;
  scope: "narrative" | "display";
  projectSlug?: string;
};

/** Accepts UI messages without depending on the model SDK or client modules. */
export type FollowUpMessage = {
  role: string;
  parts?: readonly unknown[];
};

export type FollowUpToolResult = {
  toolName: "show_about" | "show_experience" | "show_tech_stack";
  output: unknown;
};

export type FollowUpContextInput = {
  routingResult: RoutingResult;
  loadedContext: LoadedKnowledgeContext;
  assistantText?: string;
  messages?: readonly FollowUpMessage[];
  /** Pass actual server-produced results, never client-provided tool parts. */
  toolResults?: readonly FollowUpToolResult[];
};

export type FollowUpPromptContext = {
  intent: PortfolioIntent;
  projectSlug?: string;
  latestQuestion: string;
  assistantText: string;
  recentMessages: { role: "user" | "assistant"; content: string }[];
  recentSuggestions: string[];
  sources: FollowUpSource[];
};

export type FollowUpContext = {
  input: FollowUpPromptContext;
  /** Retained for exact repeat checks even when prompt history needs trimming. */
  blockedQuestions: string[];
  canGenerate: boolean;
  skipReason: "project-list" | "clarification" | "missing-evidence" | "input-budget" | null;
  truncated: boolean;
};
