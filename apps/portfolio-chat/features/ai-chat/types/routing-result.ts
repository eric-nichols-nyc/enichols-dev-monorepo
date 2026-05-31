export const PORTFOLIO_INTENTS = [
  "show_projects",
  "show_tech_stack",
  "show_experience",
  "candidate_overview",
  "ai_experience",
  "design_system_experience",
  "project_overview",
  "project_architecture",
  "project_challenges",
  "general_question",
] as const;

export type PortfolioIntent = (typeof PORTFOLIO_INTENTS)[number];

export type ResponseType = "static_display" | "context_aware_ai" | "hybrid";

export type PortfolioToolName =
  | "show_projects"
  | "show_tech_stack"
  | "show_experience";

export type RoutingEntities = {
  projectSlug?: string;
  categories?: string[];
};

export type RoutingResult = {
  intent: PortfolioIntent;
  entities: RoutingEntities;
  knowledgePaths: string[];
  sectionSlices: Record<string, string[]>;
  responseType: ResponseType;
  tool?: PortfolioToolName;
  clarificationNeeded?: boolean;
  originalMessage: string;
};
