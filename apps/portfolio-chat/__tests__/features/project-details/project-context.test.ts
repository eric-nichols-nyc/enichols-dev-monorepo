import { describe, expect, it } from "vitest";
import projects from "@/data/projects";
import { getPublishedProject, parseProjectMessages, projectRouting, withProjectFacts } from "@/features/project-details/lib/project-context";
import { getProjectFollowUps, getProjectQuestions, messageText } from "@/features/project-details/lib/project-questions";

const project = projects[0]!;
const message = (text: string) => ({ id: "q", role: "user", parts: [{ type: "text", text }] });

describe("project question boundaries", () => {
  it("resolves only published IDs", () => {
    expect(getPublishedProject(project.id)).toEqual(project);
    for (const id of ["audiograph", "unknown", "../candidate/experience", null, 4]) expect(getPublishedProject(id)).toBeUndefined();
  });

  it.each(["What's its tech stack?", "Show me your projects", "Tell me about yourself", `How does ${projects[1]!.title} work?`])("binds %s to the selected project without global tools", (question) => {
    const routing = projectRouting(project, question);
    expect(routing.entities.projectSlug).toBe(project.id);
    expect(routing.knowledgePaths).toEqual([`projects/${project.id}.md`]);
    expect(routing.sectionSlices).toEqual({});
    expect(routing.responseType).toBe("context_aware_ai");
    expect(routing.tool).toBeUndefined();
    expect(routing.clarificationNeeded).toBeUndefined();
  });

  it("strips supplied tool data and preserves text history", () => {
    const input = [{ id: "a", role: "assistant", parts: [{ type: "text", text: "Answer" }, { type: "data-related", data: { suggestions: ["untrusted"] } }, { type: "tool-show_projects", output: { private: "not model evidence" } }] }, message("What next?")];
    expect(parseProjectMessages(input)).toEqual([
      { id: "a", role: "assistant", parts: [{ type: "text", text: "Answer" }] }, message("What next?"),
    ]);
  });

  it.each([null, [], [message(" ")], [message("q"), message(" ")], [message("q"), { ...message(""), role: "assistant" }], [{ ...message("q"), role: "system" }], [{ ...message("q"), role: "assistant" }], [{ ...message("q"), parts: [{ type: "text", text: 12 }] }], [message("x".repeat(6001))], Array(41).fill(message("q"))])("rejects invalid or oversized project history %#", (history) => {
    expect(parseProjectMessages(history)).toBeNull();
  });

  it("adds server-owned facts even when project markdown is unavailable", () => {
    const context = { files: [], missingPaths: [`projects/${project.id}.md`], truncated: false };
    const enriched = withProjectFacts(context, project);
    expect(context.files).toHaveLength(0);
    expect(enriched.files).toHaveLength(1);
    expect(enriched.files[0]!.rawContent).toContain(project.description);
    expect(enriched.files[0]!.title).toBe(project.title);
    expect(enriched.files[0]!.rawContent).not.toContain(projects[1]!.description);
  });

  it("offers grounded starters, excludes asked questions, and uses server follow-ups", () => {
    const initial = getProjectQuestions(project);
    expect(initial).toHaveLength(3);
    expect(initial.every((question) => question.includes(project.title))).toBe(true);
    const history = [message(initial[0]!), { role: "assistant", parts: [{ type: "data-related", data: { suggestions: [initial[0], "A relevant follow-up?", 4, "A relevant follow-up?"] } }] }];
    expect(getProjectFollowUps(project, history)).toEqual(["A relevant follow-up?"]);
    expect(getProjectQuestions(project, [message(initial[0]!)])).not.toContain(initial[0]);
    expect(messageText({ role: "assistant", parts: [null, { type: "text", text: "Only text" }, { type: "tool", text: "ignore" }] })).toBe("Only text");
  });
});
