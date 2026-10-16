import { z } from "zod";
import type { FollowUpContext, FollowUpSource } from "@/features/ai-chat/types/follow-up-context";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import { MAX_SUGGESTIONS, MAX_SUGGESTION_LENGTH } from "@/features/ai-chat/utils/suggestion-templates";
import projects from "@/data/projects";

export const followUpCandidateSchema = z.object({
  question: z.string().trim().min(1).max(MAX_SUGGESTION_LENGTH),
  sourceId: z.string().trim().min(1).max(100),
  excerpt: z.string().trim().min(1).max(1_000),
}).strict();

export const followUpQuestionsSchema = z.object({
  questions: z.array(followUpCandidateSchema).max(MAX_SUGGESTIONS),
}).strict();

/** Keep structural generation constraints separate so one bad string cannot discard good candidates. */
export const followUpGenerationSchema = z.object({
  questions: z.array(followUpCandidateSchema.extend({
    question: z.string(), sourceId: z.string(), excerpt: z.string(),
  })).max(MAX_SUGGESTIONS),
}).strict();

export type FollowUpCandidate = z.infer<typeof followUpCandidateSchema>;
export type FollowUpRejection =
  | "invalid-output" | "invalid-candidate" | "invalid-question" | "repeated"
  | "unknown-source" | "unsupported-excerpt" | "unsupported-preference" | "unsupported-authorship"
  | "wrong-route" | "display-only-source";

export type FollowUpValidationResult = {
  suggestions: string[];
  acceptedCandidates: FollowUpCandidate[];
  rejections: FollowUpRejection[];
};

function normalizeQuestion(text: string): string {
  return text.trim().toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").replace(/[?!.]+$/, "");
}

function validQuestion(text: string, generated: boolean): boolean {
  return text.length > 0 && text.length <= MAX_SUGGESTION_LENGTH &&
    !/[\r\n]|…|\.\.\./.test(text) && (!generated || text.endsWith("?"));
}

function normalizeEvidence(text: string): string {
  return text.replace(/[*_`]/g, "").replace(/[’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\s+/g, " ").trim().toLowerCase();
}

function containsExcerpt(source: string, excerpt: string): boolean {
  const normalized = normalizeEvidence(excerpt);
  return Boolean(normalized) && normalizeEvidence(source).includes(normalized);
}

function unsupportedSystemAuthorship(question: string, content: string): boolean {
  const claim = normalizeEvidence(question).match(
    /\b(?:building|built|creating|created|developing|developed)\s+(?:the\s+)?([a-z][a-z0-9 .-]*? design system)\b/
  );
  if (!claim?.[1]) return false;
  const artifact = claim[1];
  const source = normalizeEvidence(content);
  if (!source.includes(artifact)) return false;
  const escaped = artifact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return !new RegExp(`\\b(?:built|created|developed|architected)\\s+(?:the\\s+)?${escaped}\\b`).test(source);
}

function routeMatchesSource(question: string, source: FollowUpSource): boolean {
  const routing = routeIntent(question);
  if (routing.clarificationNeeded || !routing.knowledgePaths.includes(source.path)) return false;
  if (source.projectSlug) {
    const project = projects.find((entry) => entry.id === source.projectSlug && entry.published);
    if (!project || routing.entities.projectSlug !== project.id) return false;
    const names = [project.id, project.title].map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!names.some((name) => new RegExp(`(^|[^a-z0-9])${name}($|[^a-z0-9])`, "i").test(question))) return false;
  } else if (routing.entities.projectSlug) {
    return false;
  }

  const slices = routing.sectionSlices[source.path];
  return !slices?.length || slices.some((slice) =>
    source.section.toLowerCase().includes(slice.toLowerCase())
  );
}

function displayQuestion(question: string): boolean {
  const routing = routeIntent(question);
  return routing.intent === "show_tech_stack" && routing.responseType !== "context_aware_ai";
}

function safeFallback(question: string, context: FollowUpContext): boolean {
  const routing = routeIntent(question);
  if (routing.clarificationNeeded) return false;
  if (["show_projects", "candidate_overview", "show_experience", "show_tech_stack"].includes(routing.intent)) {
    return true;
  }
  return context.input.sources.some((source) =>
    routeMatchesSource(question, source) && (source.scope === "narrative" || displayQuestion(question))
  );
}

/** Evidence and route checks constrain candidates; they do not prove semantic answerability. */
export function validateFollowUpQuestions(
  output: unknown,
  context: FollowUpContext,
  fallbackSuggestions: readonly string[] = []
): FollowUpValidationResult {
  const result: FollowUpValidationResult = { suggestions: [], acceptedCandidates: [], rejections: [] };
  const blocked = new Set(context.blockedQuestions.map(normalizeQuestion));
  blocked.add(normalizeQuestion(context.input.latestQuestion));
  const envelope = z.object({ questions: z.array(z.unknown()).max(MAX_SUGGESTIONS) }).strict().safeParse(output);

  if (!envelope.success) result.rejections.push("invalid-output");
  else if (context.canGenerate) {
    for (const raw of envelope.data.questions) {
      const parsed = followUpCandidateSchema.safeParse(raw);
      if (!parsed.success) { result.rejections.push("invalid-candidate"); continue; }
      const candidate = parsed.data;
      const question = candidate.question;
      const normalized = normalizeQuestion(question);
      const source = context.input.sources.find((entry) => entry.id === candidate.sourceId);
      let rejection: FollowUpRejection | undefined;
      if (!validQuestion(question, true)) rejection = "invalid-question";
      else if (blocked.has(normalized)) rejection = "repeated";
      else if (!source) rejection = "unknown-source";
      else if (!containsExcerpt(source.content, candidate.excerpt)) rejection = "unsupported-excerpt";
      else if (/\bfavou?rites?\b/i.test(question) && !/\bfavou?rites?\b/i.test(source.content)) rejection = "unsupported-preference";
      else if (unsupportedSystemAuthorship(question, source.content)) rejection = "unsupported-authorship";
      else if (!routeMatchesSource(question, source)) rejection = "wrong-route";
      else if (source.scope === "display" && !displayQuestion(question)) rejection = "display-only-source";
      if (rejection) { result.rejections.push(rejection); continue; }
      blocked.add(normalized);
      result.suggestions.push(question);
      result.acceptedCandidates.push(candidate);
    }
  }

  for (const raw of fallbackSuggestions) {
    if (result.suggestions.length >= MAX_SUGGESTIONS) break;
    const question = raw.trim();
    const normalized = normalizeQuestion(question);
    if (!validQuestion(question, false) || blocked.has(normalized) || !safeFallback(question, context)) continue;
    blocked.add(normalized);
    result.suggestions.push(question);
  }
  return result;
}
