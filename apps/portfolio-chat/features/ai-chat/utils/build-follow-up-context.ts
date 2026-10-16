import type {
  FollowUpContext,
  FollowUpContextInput,
  FollowUpMessage,
  FollowUpPromptContext,
  FollowUpSource,
  FollowUpToolResult,
} from "@/features/ai-chat/types/follow-up-context";
import { parseMarkdown } from "@/features/ai-chat/utils/parse-markdown-sections";
import { MAX_SUGGESTION_LENGTH } from "@/features/ai-chat/utils/suggestion-templates";
import projects from "@/data/projects";

export const FOLLOW_UP_INPUT_CHARACTERS = 16_000;
export const FOLLOW_UP_HISTORY_MESSAGES = 6;
const MAX_KNOWLEDGE_FILES = 3;
const CANDIDATE_PATHS = new Set([
  "candidate/candidate-profile.md",
  "candidate/experience.md",
  "candidate/tech-stack.md",
]);

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim()))
    : [];
}

function messageText(message: FollowUpMessage): string {
  return (message.parts ?? []).flatMap((part) => {
    const entry = record(part);
    return entry?.type === "text" && typeof entry.text === "string" ? [entry.text] : [];
  }).join("\n").trim();
}

function messageSuggestions(message: FollowUpMessage): string[] {
  return (message.parts ?? []).flatMap((part) => {
    const entry = record(part);
    if (entry?.type === "data-related") {
      return strings(record(entry.data)?.suggestions);
    }
    if (typeof entry?.type === "string" && entry.type.startsWith("tool-")) {
      return strings(record(entry.output)?.related);
    }
    return [];
  }).filter((text) => text.trim().length <= MAX_SUGGESTION_LENGTH);
}

function knowledgeSources(input: FollowUpContextInput): Omit<FollowUpSource, "id">[] {
  const files = input.loadedContext.files.filter((file) =>
    CANDIDATE_PATHS.has(file.path) || projects.some((project) =>
      project.published && file.path === `projects/${project.id}.md`
    )
  ).slice(0, MAX_KNOWLEDGE_FILES);

  return files.flatMap((file) => {
    const available = parseMarkdown(file.rawContent).sections;
    const sections = [...file.sections, ...available];
    const seen = new Set<string>();
    const projectSlug = projects.find((project) => file.path === `projects/${project.id}.md`)?.id;
    return sections.flatMap((section) => {
      const content = section.content.trim();
      const key = `${section.name.toLowerCase()}:${content}`;
      if (!content || seen.has(key)) return [];
      seen.add(key);
      return [{
        kind: "knowledge" as const,
        path: file.path,
        section: section.name,
        content,
        scope: "narrative" as const,
        ...(projectSlug ? { projectSlug } : {}),
      }];
    });
  });
}

function toolSources(result: FollowUpToolResult): Omit<FollowUpSource, "id">[] {
  const output = record(result.output);
  if (!output) return [];

  if (result.toolName === "show_about") {
    return strings(output.paragraphs).map((content) => ({
      kind: "tool", path: "candidate/candidate-profile.md", section: "Summary",
      scope: "narrative", content: content.trim(),
    }));
  }

  if (result.toolName === "show_experience" && Array.isArray(output.experience)) {
    return output.experience.flatMap((value) => {
      const entry = record(value);
      if (typeof entry?.company !== "string" || typeof entry.description !== "string") return [];
      const content = [
        `Company: ${entry.company}`,
        ...strings(entry.titles).map((title) => `Role: ${title}`),
        entry.description,
        ...strings(entry.technologies).map((technology) => `Technology: ${technology}`),
      ].join("\n");
      return [{
        kind: "tool" as const, path: "candidate/experience.md", section: entry.company,
        scope: "narrative" as const, content,
      }];
    });
  }

  if (result.toolName === "show_tech_stack") {
    const technologies = strings(output.technologies);
    return technologies.length ? [{
      kind: "tool", path: "candidate/tech-stack.md", section: "Listed technologies",
      scope: "display", content: `Listed technologies: ${technologies.join(", ")}.`,
    }] : [];
  }

  return [];
}

/** The later generator must use this serialization to honor the input budget. */
export function serializeFollowUpContext(context: FollowUpContext): string {
  return JSON.stringify(context.input);
}

function fits(input: FollowUpPromptContext, limit: number): boolean {
  return JSON.stringify(input).length <= limit;
}

function fitText(
  input: FollowUpPromptContext,
  field: "latestQuestion" | "assistantText",
  text: string,
  limit: number
): string {
  let low = 0;
  let high = Math.min(text.length, limit);
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (fits({ ...input, [field]: text.slice(0, middle) }, limit)) low = middle;
    else high = middle - 1;
  }
  // Avoid splitting a surrogate pair at the budget boundary.
  if (low > 0 && /[\uD800-\uDBFF]/.test(text[low - 1] ?? "")) low -= 1;
  return text.slice(0, low);
}

export function buildFollowUpContext(
  input: FollowUpContextInput,
  options: { maxInputCharacters?: number } = {}
): FollowUpContext {
  const limit = options.maxInputCharacters ?? FOLLOW_UP_INPUT_CHARACTERS;
  if (!Number.isSafeInteger(limit) || limit < 256 || limit > FOLLOW_UP_INPUT_CHARACTERS) {
    throw new RangeError("Follow-up input budget must be an integer from 256 to 16000.");
  }

  const { routingResult: routing } = input;
  const messages = (input.messages ?? []).filter((message) =>
    message.role === "user" || message.role === "assistant"
  );
  const recentMessages = messages.flatMap((message) => {
    const content = messageText(message);
    return content ? [{ role: message.role as "user" | "assistant", content }] : [];
  }).slice(-FOLLOW_UP_HISTORY_MESSAGES);
  const recentSuggestions = [...new Set(messages.slice(-FOLLOW_UP_HISTORY_MESSAGES)
    .flatMap(messageSuggestions).map((text) => text.trim()))];
  const prompt: FollowUpPromptContext = {
    intent: routing.intent,
    ...(routing.entities.projectSlug ? { projectSlug: routing.entities.projectSlug } : {}),
    latestQuestion: "", assistantText: "", recentMessages: [], recentSuggestions: [], sources: [],
  };
  const question = routing.originalMessage.trim();
  prompt.latestQuestion = fitText(prompt, "latestQuestion", question, limit);
  const context: FollowUpContext = {
    input: prompt,
    blockedQuestions: [question, ...recentMessages.filter((message) => message.role === "user")
      .map((message) => message.content), ...recentSuggestions]
      .map((text) => text.trim().replace(/\s+/g, " "))
      .filter((text) => text.length <= MAX_SUGGESTION_LENGTH),
    canGenerate: false, skipReason: null, truncated: prompt.latestQuestion !== question,
  };

  if (routing.intent === "show_projects") context.skipReason = "project-list";
  else if (routing.clarificationNeeded) context.skipReason = "clarification";
  else if (context.truncated || !fits(prompt, limit)) context.skipReason = "input-budget";
  if (context.skipReason) return context;

  const answer = input.assistantText?.trim() ?? "";
  // Reserve a response excerpt before packing complete evidence sections.
  prompt.assistantText = fitText(prompt, "assistantText", answer.slice(0, Math.floor(limit / 4)), limit);
  const sources = [
    ...(input.toolResults ?? []).flatMap(toolSources),
    ...knowledgeSources(input),
  ];
  for (const source of sources) {
    const candidate = { ...source, id: `source-${prompt.sources.length + 1}` };
    if (fits({ ...prompt, sources: [...prompt.sources, candidate] }, limit)) prompt.sources.push(candidate);
    else context.truncated = true;
  }
  prompt.assistantText = fitText(prompt, "assistantText", answer, limit);
  context.truncated ||= prompt.assistantText !== answer || input.loadedContext.truncated ||
    input.loadedContext.files.length > MAX_KNOWLEDGE_FILES;

  for (const suggestion of recentSuggestions) {
    if (fits({ ...prompt, recentSuggestions: [...prompt.recentSuggestions, suggestion] }, limit)) {
      prompt.recentSuggestions.push(suggestion);
    } else context.truncated = true;
  }
  for (const message of [...recentMessages].reverse()) {
    if (fits({ ...prompt, recentMessages: [message, ...prompt.recentMessages] }, limit)) {
      prompt.recentMessages.unshift(message);
    } else context.truncated = true;
  }
  context.canGenerate = prompt.sources.length > 0;
  context.skipReason = context.canGenerate ? null : sources.length ? "input-budget" : "missing-evidence";
  return context;
}
