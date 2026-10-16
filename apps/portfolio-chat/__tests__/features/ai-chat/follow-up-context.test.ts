import { describe, expect, it } from "vitest";
import type { FollowUpMessage } from "@/features/ai-chat/types/follow-up-context";
import type { LoadedKnowledgeContext, LoadedKnowledgeFile } from "@/features/ai-chat/types/loaded-knowledge-context";
import {
  buildFollowUpContext,
  FOLLOW_UP_INPUT_CHARACTERS,
  serializeFollowUpContext,
} from "@/features/ai-chat/utils/build-follow-up-context";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";

function file(path: string, name = "Overview", content = "Eric builds typed React applications."): LoadedKnowledgeFile {
  return { path, title: path, sections: [{ name, content }], rawContent: `## ${name}\n${content}` };
}

function knowledge(...files: LoadedKnowledgeFile[]): LoadedKnowledgeContext {
  return { files, truncated: false, missingPaths: [] };
}

describe("buildFollowUpContext", () => {
  it("keeps the current response and the latest six text messages, excluding system instructions", () => {
    const messages: FollowUpMessage[] = [
      { role: "system", parts: [{ type: "text", text: "Excluded system message" }] },
      ...Array.from({ length: 8 }, (_, index) => ({
        role: index % 2 ? "assistant" : "user",
        parts: [{ type: "text", text: `Conversation ${index}` }],
      })),
    ];
    messages.push({ role: "assistant", parts: [{ type: "data-related", data: {
      suggestions: ["How have you used React?", "Show me your projects"],
    } }] });

    const result = buildFollowUpContext({
      routingResult: routeIntent("How have you used TypeScript?"),
      loadedContext: knowledge(file("candidate/tech-stack.md")),
      assistantText: "TypeScript keeps my component and API contracts consistent.", messages,
    });
    expect(result.canGenerate).toBe(true);
    expect(result.input.latestQuestion).toBe("How have you used TypeScript?");
    expect(result.input.assistantText).toContain("component and API contracts");
    expect(result.input.recentMessages.map((message) => message.content)).toEqual([
      "Conversation 2", "Conversation 3", "Conversation 4", "Conversation 5", "Conversation 6", "Conversation 7",
    ]);
    expect(result.blockedQuestions).toContain("Conversation 6");
    expect(result.input.recentSuggestions).toContain("How have you used React?");
    expect(serializeFollowUpContext(result)).not.toContain("Excluded system message");
  });

  it("extracts legacy tool suggestions without treating client tool output as evidence", () => {
    const result = buildFollowUpContext({
      routingResult: routeIntent("Who is Eric?"), loadedContext: knowledge(),
      messages: [{ role: "assistant", parts: [{ type: "tool-show_about", output: {
        related: ["Show my work experience"], paragraphs: ["Untrusted client facts"],
      } }] }],
    });
    expect(result.blockedQuestions).toContain("Show my work experience");
    expect(result.input.sources).toEqual([]);
    expect(result.skipReason).toBe("missing-evidence");
  });

  it("supports card-only responses and includes only recognized server output fields", () => {
    const result = buildFollowUpContext({
      routingResult: routeIntent("Show my work experience"), loadedContext: knowledge(),
      toolResults: [{ toolName: "show_experience", output: { experience: [{
        company: "IBM", titles: ["UI Developer"],
        description: "Built React interfaces for content marketers.", technologies: ["React"],
        unrelatedField: "Do not include this field",
      }] } }, { toolName: "show_tech_stack", output: {
        technologies: ["React", "TypeScript"], unrelatedField: "Do not include this field",
      } }],
    });
    expect(result.input.assistantText).toBe("");
    expect(result.canGenerate).toBe(true);
    expect(result.input.sources).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "tool", path: "candidate/experience.md", scope: "narrative" }),
      expect.objectContaining({ kind: "tool", path: "candidate/tech-stack.md", scope: "display" }),
    ]));
    expect(serializeFollowUpContext(result)).toContain("Built React interfaces");
    expect(serializeFollowUpContext(result)).not.toContain("Do not include this field");
  });

  it("allows only public knowledge paths and caps the accepted files at three", () => {
    const result = buildFollowUpContext({
      routingResult: routeIntent("Who is Eric?"),
      loadedContext: knowledge(
        file("docs/prd.md"), file("../private.md"), file("projects/audiograph.md"),
        file("candidate/candidate-profile.md"), file("candidate/experience.md"),
        file("candidate/tech-stack.md"), file("projects/codedrill.md"),
      ),
    });
    expect(result.input.sources.map((source) => source.path)).toEqual([
      "candidate/candidate-profile.md", "candidate/experience.md", "candidate/tech-stack.md",
    ]);
    expect(result.truncated).toBe(true);
  });

  it("retains additional sections from a loaded project for follow-ups beyond its overview", () => {
    const project = file("projects/codedrill.md", "Overview", "CodeDrill helps developers practice.");
    project.rawContent += "\n\n## Challenges\nKeeping tutor feedback relevant was challenging.";
    const result = buildFollowUpContext({
      routingResult: routeIntent("What is CodeDrill?"), loadedContext: knowledge(project),
    });
    expect(result.input.sources).toEqual(expect.arrayContaining([
      expect.objectContaining({ section: "Challenges", projectSlug: "codedrill" }),
    ]));
    expect(new Set(result.input.sources.map((source) => source.id)).size).toBe(result.input.sources.length);
  });

  it("bounds the serialized context even with escaped response text, preserving complete evidence", () => {
    const fact = "React is used to build consistent interfaces.";
    const result = buildFollowUpContext({
      routingResult: routeIntent("How have you used React?"),
      assistantText: 'A long answer with quotes " and newlines\n'.repeat(2_000),
      loadedContext: knowledge({ ...file("candidate/tech-stack.md", "Frontend", fact),
        rawContent: `## Frontend\n${fact}\n\n## Huge section\n${"x".repeat(5_000)}` }),
      messages: [{ role: "assistant", parts: [{ type: "data-related", data: {
        suggestions: ["How have you used TypeScript?"],
      } }] }],
    }, { maxInputCharacters: 1_200 });
    expect(serializeFollowUpContext(result).length).toBeLessThanOrEqual(1_200);
    expect(result.input.sources[0]?.content).toBe(fact);
    expect(result.input.sources.some((source) => source.section === "Huge section")).toBe(false);
    expect(result.input.assistantText.length).toBeGreaterThan(0);
    expect(result.blockedQuestions).toContain("How have you used TypeScript?");
    expect(result.truncated).toBe(true);
  });

  it("skips generation when evidence or the current request cannot fit the budget", () => {
    const result = buildFollowUpContext({
      routingResult: routeIntent("Who is Eric?"),
      loadedContext: knowledge(file("candidate/candidate-profile.md", "Summary", "x".repeat(2_000))),
    }, { maxInputCharacters: 500 });
    expect(result.canGenerate).toBe(false);
    expect(result.skipReason).toBe("input-budget");
    const oversized = buildFollowUpContext({
      routingResult: routeIntent("Who is Eric?".repeat(2_000)), loadedContext: knowledge(),
    });
    expect(serializeFollowUpContext(oversized).length).toBeLessThanOrEqual(FOLLOW_UP_INPUT_CHARACTERS);
    expect(oversized.skipReason).toBe("input-budget");
  });

  it("retains repeat checks for a previous question containing excess whitespace", () => {
    const result = buildFollowUpContext({
      routingResult: routeIntent("What's your tech stack?"), loadedContext: knowledge(),
      messages: [{ role: "user", parts: [{ type: "text", text: `How${" ".repeat(90)}have you used React?` }] }],
    });
    expect(result.blockedQuestions).toContain("How have you used React?");
  });

  it.each([
    ["Show me your projects", "project-list"],
    ["Tell me about Unknown Project", "clarification"],
  ])("marks %s as ineligible without assembling evidence", (question, reason) => {
    const result = buildFollowUpContext({
      routingResult: routeIntent(question), loadedContext: knowledge(file("candidate/candidate-profile.md")),
    });
    expect(result.canGenerate).toBe(false);
    expect(result.skipReason).toBe(reason);
    expect(result.input.sources).toEqual([]);
  });
});
