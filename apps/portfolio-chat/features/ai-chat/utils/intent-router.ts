import projects from "@/data/projects";
import type {
  PortfolioIntent,
  PortfolioToolName,
  ResponseType,
  RoutingResult,
} from "@/features/ai-chat/types/routing-result";

const MAX_KNOWLEDGE_FILES = 3;

const SUGGESTION_ALIASES: Record<string, string> = {
  experience: "show my work experience",
  "about me": "tell me about yourself",
};

const PROJECT_ALIASES: Record<string, string> = {
  trellix: "trellnode",
};

const DISPLAY_PROJECT_PHRASES = [
  "show me your projects",
  "show me some projects",
  "show your projects",
  "list your projects",
  "what projects",
  "what projects have you built",
];

const DISPLAY_TECH_STACK_PHRASES = [
  "tech stack",
  "show me your tech stack",
  "what's your tech stack",
  "what technologies do you use",
];

const STATIC_TECH_STACK_PHRASES = [
  "what's your tech stack",
  "show me your tech stack",
];

const DISPLAY_EXPERIENCE_PHRASES = [
  "show my work experience",
  "show me your experience",
  "what's your experience",
  "work experience",
  "career timeline",
];

const PROJECT_CHALLENGE_PHRASES = [
  "hardest",
  "challenge",
  "difficult",
  "lesson",
  "learned",
  "went wrong",
  "obstacle",
  "problem you faced",
];

const PROJECT_ARCHITECTURE_PHRASES = [
  "architecture",
  "how does",
  "how do",
  "data flow",
  "deploy",
  "api",
  "apis",
  "integrat",
  "collect data",
  "system design",
];

const PROJECT_OVERVIEW_PHRASES = [
  "tell me about",
  "what is",
  "describe",
  "overview of",
  "about",
];

const AI_EXPERIENCE_PHRASES = [
  "ai project",
  "ai work",
  "llm",
  "large language",
  "vercel ai",
  "gemini",
  "openai",
  "machine learning",
  "ai experience",
  "ai integration",
];

const DESIGN_SYSTEM_PHRASES = [
  "design system",
  "component library",
  "storybook",
  "design token",
  "figma component",
];

const CANDIDATE_OVERVIEW_PHRASES = [
  "tell me about yourself",
  "who is eric",
  "about you",
  "your background",
  "overview of your experience",
  "introduce yourself",
  "what's your background",
];

const TECH_HINT_PHRASES = [
  "react",
  "next",
  "typescript",
  "tailwind",
  "node",
  "javascript",
  "playwright",
  "jest",
  "aws",
  "mongodb",
  "postgres",
  "prisma",
  "storybook",
  "figma",
];

const CAREER_HINT_PHRASES = [
  "job",
  "role",
  "company",
  "career",
  "votemate",
  "ibm",
  "havas",
  "imagination",
  "employer",
];

const PROFILE_HINT_PHRASES = ["you", "your", "eric", "background"];

const AI_PROJECT_IDS = projects
  .filter((project) => project.categories.includes("ai"))
  .sort((a, b) => a.position - b.position)
  .map((project) => project.id);

export function normalizeMessage(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  const alias = SUGGESTION_ALIASES[trimmed.toLowerCase()];
  const base = alias ?? trimmed;
  return base.toLowerCase().replace(/[?!.]+$/g, "");
}

function includesPhrase(message: string, phrases: string[]): boolean {
  return phrases.some((phrase) => message.includes(phrase));
}

function resolveProjectSlug(message: string): string | undefined {
  const normalized = message.toLowerCase();

  for (const project of projects) {
    if (normalized.includes(project.id.toLowerCase())) {
      return project.id;
    }
  }

  for (const project of projects) {
    if (normalized.includes(project.title.toLowerCase())) {
      return project.id;
    }
  }

  for (const [alias, slug] of Object.entries(PROJECT_ALIASES)) {
    if (normalized.includes(alias)) {
      return slug;
    }
  }

  return undefined;
}

function isProjectShapedMessage(message: string): boolean {
  return includesPhrase(message, PROJECT_OVERVIEW_PHRASES);
}

function matchDisplayIntent(normalized: string): PortfolioIntent | null {
  if (includesPhrase(normalized, DISPLAY_PROJECT_PHRASES)) {
    return "show_projects";
  }

  if (includesPhrase(normalized, DISPLAY_TECH_STACK_PHRASES)) {
    return "show_tech_stack";
  }

  if (includesPhrase(normalized, DISPLAY_EXPERIENCE_PHRASES)) {
    return "show_experience";
  }

  return null;
}

function matchProjectIntent(
  normalized: string,
  projectSlug: string
): PortfolioIntent {
  if (includesPhrase(normalized, PROJECT_CHALLENGE_PHRASES)) {
    return "project_challenges";
  }

  if (
    includesPhrase(normalized, PROJECT_ARCHITECTURE_PHRASES) ||
    (normalized.includes("stack") && normalized.includes("how"))
  ) {
    return "project_architecture";
  }

  if (
    includesPhrase(normalized, PROJECT_OVERVIEW_PHRASES) ||
    normalized.includes(projectSlug)
  ) {
    return "project_overview";
  }

  return "project_overview";
}

function getResponseType(
  intent: PortfolioIntent,
  normalized: string
): ResponseType {
  switch (intent) {
    case "show_projects":
    case "show_experience":
      return "static_display";
    case "show_tech_stack":
      return includesPhrase(normalized, STATIC_TECH_STACK_PHRASES)
        ? "static_display"
        : "hybrid";
    case "ai_experience":
      return "context_aware_ai";
    default:
      return "context_aware_ai";
  }
}

function getToolForIntent(intent: PortfolioIntent): PortfolioToolName | undefined {
  if (intent === "show_projects") {
    return "show_projects";
  }
  if (intent === "show_tech_stack") {
    return "show_tech_stack";
  }
  if (intent === "show_experience") {
    return "show_experience";
  }
  return undefined;
}

function buildSectionSlices(
  intent: PortfolioIntent,
  knowledgePaths: string[]
): Record<string, string[]> {
  const slices: Record<string, string[]> = {};

  for (const filePath of knowledgePaths) {
    if (filePath.startsWith("projects/")) {
      if (intent === "project_overview") {
        slices[filePath] = ["Overview", "Problem", "Solution", "Links"];
      } else if (intent === "project_architecture") {
        slices[filePath] = ["Overview", "Architecture", "Tech Stack"];
      } else if (intent === "project_challenges") {
        slices[filePath] = ["Overview", "Challenges", "Lessons Learned"];
      } else if (intent === "ai_experience") {
        slices[filePath] = ["Overview"];
      }
    }

    if (
      intent === "design_system_experience" &&
      filePath === "candidate/experience.md"
    ) {
      slices[filePath] = ["IBM", "Havas", "Imagination"];
    }

    if (
      intent === "ai_experience" &&
      filePath === "candidate/tech-stack.md"
    ) {
      slices[filePath] = ["AI & Integration"];
    }
  }

  return slices;
}

function buildAiExperiencePaths(): string[] {
  const paths = ["candidate/experience.md"];

  for (const projectId of AI_PROJECT_IDS) {
    paths.push(`projects/${projectId}.md`);
  }

  return paths.slice(0, MAX_KNOWLEDGE_FILES);
}

function buildGeneralQuestionPaths(
  normalized: string,
  projectSlug?: string
): string[] {
  const paths: string[] = [];

  if (includesPhrase(normalized, TECH_HINT_PHRASES)) {
    paths.push("candidate/tech-stack.md");
  }

  if (includesPhrase(normalized, CAREER_HINT_PHRASES)) {
    paths.push("candidate/experience.md");
  }

  if (includesPhrase(normalized, PROFILE_HINT_PHRASES)) {
    paths.push("candidate/candidate-profile.md");
  }

  if (projectSlug) {
    paths.push(`projects/${projectSlug}.md`);
  }

  if (paths.length === 0) {
    paths.push("candidate/candidate-profile.md");
  }

  return [...new Set(paths)].slice(0, MAX_KNOWLEDGE_FILES);
}

function buildKnowledgePaths(
  intent: PortfolioIntent,
  projectSlug?: string,
  normalized = ""
): string[] {
  switch (intent) {
    case "show_projects":
      return [];
    case "show_tech_stack":
      return ["candidate/tech-stack.md"];
    case "show_experience":
      return ["candidate/experience.md"];
    case "candidate_overview":
      return ["candidate/candidate-profile.md"];
    case "ai_experience":
      return buildAiExperiencePaths();
    case "design_system_experience":
      return ["candidate/experience.md"];
    case "project_overview":
    case "project_architecture":
    case "project_challenges":
      return projectSlug ? [`projects/${projectSlug}.md`] : [];
    case "general_question":
      return buildGeneralQuestionPaths(normalized, projectSlug);
    default:
      return [];
  }
}

export function routeIntent(message: string): RoutingResult {
  const originalMessage = message;
  const normalized = normalizeMessage(message);
  const projectSlug = resolveProjectSlug(normalized);

  let intent: PortfolioIntent = "general_question";
  let clarificationNeeded = false;

  const displayIntent = matchDisplayIntent(normalized);

  if (displayIntent) {
    intent = displayIntent;
  } else if (projectSlug) {
    intent = matchProjectIntent(normalized, projectSlug);
  } else if (includesPhrase(normalized, AI_EXPERIENCE_PHRASES)) {
    intent = "ai_experience";
  } else if (includesPhrase(normalized, DESIGN_SYSTEM_PHRASES)) {
    intent = "design_system_experience";
  } else if (includesPhrase(normalized, CANDIDATE_OVERVIEW_PHRASES)) {
    intent = "candidate_overview";
  } else if (isProjectShapedMessage(normalized)) {
    intent = "general_question";
    clarificationNeeded = true;
  }

  const knowledgePaths = buildKnowledgePaths(
    intent,
    projectSlug,
    normalized
  ).slice(0, MAX_KNOWLEDGE_FILES);

  const sectionSlices = buildSectionSlices(intent, knowledgePaths);
  const responseType = getResponseType(intent, normalized);
  const tool = getToolForIntent(intent);

  return {
    intent,
    entities: {
      projectSlug,
      categories: intent === "ai_experience" ? ["ai"] : undefined,
    },
    knowledgePaths,
    sectionSlices,
    responseType,
    tool,
    clarificationNeeded: clarificationNeeded || undefined,
    originalMessage,
  };
}
