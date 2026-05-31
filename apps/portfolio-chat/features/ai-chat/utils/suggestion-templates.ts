import projects from "@/data/projects";
import tech from "@/data/tech.json";
import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import type {
  PortfolioIntent,
  RoutingResult,
} from "@/features/ai-chat/types/routing-result";
import { parseMarkdown } from "@/features/ai-chat/utils/parse-markdown-sections";

export const MAX_SUGGESTION_LENGTH = 80;
export const MIN_SUGGESTIONS = 2;
export const MAX_SUGGESTIONS = 3;

export type SuggestionTemplateContext = {
  routing: RoutingResult;
  context: LoadedKnowledgeContext;
  assistantText?: string;
  toolName?: string;
};

export type SuggestionTemplate = (
  ctx: SuggestionTemplateContext
) => string[];

export function truncateSuggestion(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_SUGGESTION_LENGTH) {
    return trimmed;
  }

  return `${trimmed.slice(0, MAX_SUGGESTION_LENGTH - 1).trimEnd()}…`;
}

export function getProjectTitle(slug?: string): string | undefined {
  if (!slug) {
    return undefined;
  }

  return projects.find((project) => project.id === slug)?.title;
}

export function getPublishedProjects() {
  return projects.filter((project) => project.published);
}

export function getAiProjects() {
  return getPublishedProjects().filter((project) =>
    project.categories.includes("ai")
  );
}

function getProjectFile(
  context: LoadedKnowledgeContext,
  slug?: string
): LoadedKnowledgeContext["files"][number] | undefined {
  if (!slug) {
    return undefined;
  }

  return context.files.find((file) => file.path === `projects/${slug}.md`);
}

export function getAvailableSectionNames(
  context: LoadedKnowledgeContext,
  relativePath: string
): string[] {
  const file = context.files.find((entry) => entry.path === relativePath);
  if (!file?.rawContent) {
    return [];
  }

  return parseMarkdown(`---\n---\n${file.rawContent}`).sections.map(
    (section) => section.name
  );
}

export function hasKnowledgeSection(
  context: LoadedKnowledgeContext,
  relativePath: string,
  sectionName: string
): boolean {
  return getAvailableSectionNames(context, relativePath).some(
    (name) => name.toLowerCase() === sectionName.toLowerCase()
  );
}

function projectPath(slug: string): string {
  return `projects/${slug}.md`;
}

function architectureQuestion(title: string): string {
  return truncateSuggestion(`How does ${title} collect data?`);
}

function challengesQuestion(title: string): string {
  return truncateSuggestion(`What was the hardest part of ${title}?`);
}

function overviewQuestion(title: string): string {
  return truncateSuggestion(`What is ${title}?`);
}

function tellMeAboutProject(title: string): string {
  return truncateSuggestion(`Tell me about ${title}`);
}

export function pickTechnologies(
  context: LoadedKnowledgeContext,
  count = 2
): string[] {
  const techFile = context.files.find(
    (file) => file.path === "candidate/tech-stack.md"
  );

  if (techFile?.sections.length) {
    const fromMarkdown = techFile.sections
      .flatMap((section) =>
        section.content.match(/\*\*([^*]+)\*\*/g)?.map((match) =>
          match.replace(/\*\*/g, "").trim()
        ) ?? []
      )
      .filter(Boolean);

    if (fromMarkdown.length > 0) {
      return [...new Set(fromMarkdown)].slice(0, count);
    }
  }

  const techData = tech as Record<string, Array<{ name: string }>>;
  return Object.values(techData)
    .flat()
    .map((entry) => entry.name)
    .slice(0, count);
}

function experienceMentionsDesignSystem(context: LoadedKnowledgeContext): boolean {
  const experienceFile = context.files.find(
    (file) => file.path === "candidate/experience.md"
  );

  if (!experienceFile) {
    return false;
  }

  const corpus = experienceFile.rawContent.toLowerCase();
  return (
    corpus.includes("storybook") ||
    corpus.includes("design system") ||
    corpus.includes("component library")
  );
}

function experienceMentionsAi(context: LoadedKnowledgeContext): boolean {
  const experienceFile = context.files.find(
    (file) => file.path === "candidate/experience.md"
  );

  if (!experienceFile) {
    return false;
  }

  const corpus = experienceFile.rawContent.toLowerCase();
  return corpus.includes("ai") || corpus.includes("llm") || corpus.includes("chatbot");
}

export const projectOverviewSuggestions: SuggestionTemplate = ({
  routing,
  context,
}) => {
  const slug = routing.entities.projectSlug;
  const title = getProjectTitle(slug);
  if (!title || !slug) {
    return [];
  }

  const path = projectPath(slug);
  const suggestions: string[] = [];

  if (hasKnowledgeSection(context, path, "Architecture")) {
    suggestions.push(architectureQuestion(title));
  }

  if (hasKnowledgeSection(context, path, "Challenges")) {
    suggestions.push(challengesQuestion(title));
  }

  suggestions.push("Show me your other projects");
  return suggestions;
};

export const projectArchitectureSuggestions: SuggestionTemplate = ({
  routing,
  context,
}) => {
  const slug = routing.entities.projectSlug;
  const title = getProjectTitle(slug);
  if (!title || !slug) {
    return [];
  }

  const path = projectPath(slug);
  const suggestions: string[] = [];

  if (hasKnowledgeSection(context, path, "Challenges")) {
    suggestions.push(challengesQuestion(title));
  }

  if (hasKnowledgeSection(context, path, "Overview")) {
    suggestions.push(overviewQuestion(title));
  }

  const techSection = getProjectFile(context, slug)?.sections.find(
    (section) => section.name.toLowerCase() === "tech stack"
  );

  if (techSection) {
    const techMatch = techSection.content.match(/\*\*([^*]+)\*\*/);
    const techName = techMatch?.[1]?.trim();
    if (techName) {
      suggestions.push(
        truncateSuggestion(`How does ${title} use ${techName}?`)
      );
    }
  }

  return suggestions;
};

export const projectChallengesSuggestions: SuggestionTemplate = ({
  routing,
  context,
}) => {
  const slug = routing.entities.projectSlug;
  const title = getProjectTitle(slug);
  if (!title || !slug) {
    return [];
  }

  const path = projectPath(slug);
  const suggestions: string[] = [];

  if (hasKnowledgeSection(context, path, "Architecture")) {
    suggestions.push(architectureQuestion(title));
  }

  if (hasKnowledgeSection(context, path, "Overview")) {
    suggestions.push(overviewQuestion(title));
  }

  suggestions.push("Show me your other projects");
  return suggestions;
};

export const showProjectsSuggestions: SuggestionTemplate = () => {
  const titles = getPublishedProjects()
    .slice(0, 2)
    .map((project) => project.title);

  const suggestions = titles.map((title) => tellMeAboutProject(title));
  suggestions.push("What's your tech stack?");
  return suggestions;
};

export const showTechStackSuggestions: SuggestionTemplate = ({ context }) => {
  const technologies = pickTechnologies(context, 2);
  const suggestions = technologies.map((name) =>
    truncateSuggestion(`How have you used ${name}?`)
  );

  suggestions.push("Show me your projects");
  return suggestions;
};

export const showExperienceSuggestions: SuggestionTemplate = ({ context }) => {
  const suggestions = ["Tell me about yourself", "Show me your projects"];

  if (experienceMentionsDesignSystem(context)) {
    suggestions.push(
      truncateSuggestion("Tell me about your design system work")
    );
  } else if (experienceMentionsAi(context)) {
    suggestions.push(truncateSuggestion("What AI projects have you built?"));
  } else {
    suggestions.push("What's your tech stack?");
  }

  return suggestions;
};

export const candidateOverviewSuggestions: SuggestionTemplate = () => [
  "Show me your projects",
  "What's your tech stack?",
  "Show my work experience",
];

export const aiExperienceSuggestions: SuggestionTemplate = () => {
  const aiProjects = getAiProjects().slice(0, 2);
  const suggestions = aiProjects.map((project) =>
    truncateSuggestion(`How does ${project.title} use AI?`)
  );

  if (suggestions.length < MAX_SUGGESTIONS) {
    suggestions.push("Show me your projects");
  }

  return suggestions;
};

export const designSystemExperienceSuggestions: SuggestionTemplate = ({
  context,
}) => {
  const suggestions: string[] = [
    truncateSuggestion("Tell me about your Storybook work"),
    truncateSuggestion("What component libraries have you built?"),
  ];

  if (experienceMentionsDesignSystem(context)) {
    suggestions.push("Show me your projects");
  } else {
    suggestions.push("Show my work experience");
  }

  return suggestions;
};

export const generalQuestionSuggestions: SuggestionTemplate = ({
  routing,
  context,
}) => {
  const suggestions: string[] = [];

  for (const file of context.files) {
    for (const section of file.sections) {
      if (section.name.toLowerCase() === "overview") {
        continue;
      }

      suggestions.push(
        truncateSuggestion(`Tell me more about ${section.name.toLowerCase()}`)
      );

      if (suggestions.length >= MAX_SUGGESTIONS) {
        return suggestions;
      }
    }
  }

  if (suggestions.length > 0) {
    return suggestions;
  }

  if (routing.entities.projectSlug) {
    return projectOverviewSuggestions({ routing, context });
  }

  return candidateOverviewSuggestions({ routing, context });
};

export const clarificationSuggestions: SuggestionTemplate = () => [
  "Show me your projects",
  "Tell me about yourself",
  "What's your tech stack?",
];

export const SUGGESTION_TEMPLATES: Record<
  PortfolioIntent | "clarificationNeeded",
  SuggestionTemplate
> = {
  project_overview: projectOverviewSuggestions,
  project_architecture: projectArchitectureSuggestions,
  project_challenges: projectChallengesSuggestions,
  show_projects: showProjectsSuggestions,
  show_tech_stack: showTechStackSuggestions,
  show_experience: showExperienceSuggestions,
  candidate_overview: candidateOverviewSuggestions,
  ai_experience: aiExperienceSuggestions,
  design_system_experience: designSystemExperienceSuggestions,
  general_question: generalQuestionSuggestions,
  clarificationNeeded: clarificationSuggestions,
};
