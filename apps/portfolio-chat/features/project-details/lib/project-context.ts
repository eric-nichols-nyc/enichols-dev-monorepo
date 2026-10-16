import type { UIMessage } from "ai";
import projects, { type Project } from "@/data/projects";
import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import type { RoutingResult } from "@/features/ai-chat/types/routing-result";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";

export function getPublishedProject(id: unknown): Project | undefined {
  return typeof id === "string" ? projects.find((project) => project.id === id) : undefined;
}

/** Project Q&A accepts conversation text, never client system instructions or tool output. */
export function parseProjectMessages(value: unknown): UIMessage[] | null {
  if (!Array.isArray(value) || !value.length || value.length > 40) return null;
  const last = value.at(-1);
  if (!last || typeof last !== "object" || last.role !== "user") return null;
  const messages: UIMessage[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || typeof entry.id !== "string"
      || (entry.role !== "user" && entry.role !== "assistant") || !Array.isArray(entry.parts)) return null;
    const text: string[] = [];
    for (const part of entry.parts) {
      if (!part || typeof part !== "object" || typeof part.type !== "string") return null;
      if (part.type === "text") {
        if (typeof part.text !== "string") return null;
        text.push(part.text);
      }
    }
    const content = text.join("\n").trim();
    if (content.length > 6000 || (entry.role === "user" && !content)) return null;
    if (content) messages.push({ id: entry.id, role: entry.role, parts: [{ type: "text", text: content }] });
  }
  return messages.at(-1)?.role === "user" ? messages : null;
}

export function projectRouting(project: Project, question: string): RoutingResult {
  const inferred = routeIntent(`${project.title}: ${question}`);
  return {
    intent: inferred.intent.startsWith("project_") ? inferred.intent : "project_overview",
    entities: { projectSlug: project.id },
    knowledgePaths: [`projects/${project.id}.md`],
    sectionSlices: {},
    responseType: "context_aware_ai",
    originalMessage: question,
  };
}

export function withProjectFacts(context: LoadedKnowledgeContext, project: Project): LoadedKnowledgeContext {
  const facts = JSON.stringify({
    title: project.title, description: project.description, problem: project.problem,
    solution: project.solution, tech: project.tech, features: project.features,
    metrics: project.metrics, highlights: project.highlights,
    url: project.url, githubUrl: project.githubUrl,
  });
  return {
    ...context,
    files: [...context.files, {
      path: `published-project:${project.id}`, title: project.title,
      sections: [{ name: "Published project facts", content: facts }], rawContent: facts,
    }],
  };
}
