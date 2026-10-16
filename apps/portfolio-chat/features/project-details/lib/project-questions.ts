import type { Project } from "@/data/projects";

type TextMessage = {
  role: string;
  parts?: readonly unknown[];
};

export function messageText(message: TextMessage): string {
  return (message.parts ?? [])
    .flatMap((part) => part && typeof part === "object" && "type" in part
      && part.type === "text" && "text" in part && typeof part.text === "string" ? [part.text] : [])
    .join("\n");
}

export function getProjectQuestions(
  project: Project,
  messages: readonly TextMessage[] = []
): string[] {
  const asked = new Set(messages.filter((message) => message.role === "user")
    .map((message) => messageText(message).trim().toLowerCase()));
  const choices = [
    `How was ${project.title} built?`,
    ...(project.problem ? [`What problem does ${project.title} solve?`] : []),
    ...(project.features?.length ? [`Walk me through ${project.title}'s key features.`] : []),
    ...(project.tech ?? []).slice(0, 3).map((technology) =>
      `How does ${project.title} use ${technology}?`),
    `Tell me more about ${project.title}.`,
  ];
  return [...new Set(choices)].filter((question) => !asked.has(question.toLowerCase())).slice(0, 3);
}

export function getProjectFollowUps(project: Project, messages: readonly TextMessage[]): string[] {
  const assistant = [...messages].reverse().find((message) => message.role === "assistant");
  const related = [...(assistant?.parts ?? [])].reverse().find((part) => part && typeof part === "object"
    && "type" in part && part.type === "data-related");
  if (related && typeof related === "object" && "data" in related && related.data
    && typeof related.data === "object" && "suggestions" in related.data
    && Array.isArray(related.data.suggestions)) {
    const asked = new Set(messages.filter((message) => message.role === "user")
      .map((message) => messageText(message).trim().toLowerCase()));
    const questions = related.data.suggestions.filter((question): question is string =>
      typeof question === "string" && question.trim().length > 0 && question.length <= 160
      && !asked.has(question.trim().toLowerCase()));
    if (questions.length) return [...new Set(questions.map((question) => question.trim()))].slice(0, 3);
  }
  return getProjectQuestions(project, messages);
}
