import { describe, expect, it } from "vitest";
import { generateSuggestions } from "@/features/ai-chat/utils/generate-suggestions";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import { loadKnowledgeContext } from "@/features/ai-chat/utils/load-knowledge-context";
import {
  MAX_SUGGESTION_LENGTH,
  MAX_SUGGESTIONS,
} from "@/features/ai-chat/utils/suggestion-templates";

async function suggestionsFor(message: string, toolName?: string) {
  const routingResult = routeIntent(message);
  const loadedContext = await loadKnowledgeContext(routingResult);

  return generateSuggestions({
    routingResult,
    loadedContext,
    toolName,
  });
}

describe("generateSuggestions", () => {
  it("returns 2-3 unique suggestions within length limits", async () => {
    const suggestions = await suggestionsFor("Show me your projects", "show_projects");

    expect(suggestions.length).toBeGreaterThanOrEqual(2);
    expect(suggestions.length).toBeLessThanOrEqual(MAX_SUGGESTIONS);
    expect(new Set(suggestions).size).toBe(suggestions.length);
    for (const suggestion of suggestions) {
      expect(suggestion.length).toBeLessThanOrEqual(MAX_SUGGESTION_LENGTH);
    }
  });

  it("names real project titles after show_projects", async () => {
    const suggestions = await suggestionsFor("Show me your projects", "show_projects");

    expect(
      suggestions.some(
        (suggestion) =>
          suggestion.includes("Trellix") ||
          suggestion.includes("GitHub Codebase Copilot")
      )
    ).toBe(true);
    expect(suggestions).not.toContain("Tell me about a specific project");
  });

  it("suggests architecture and challenges after project overview", async () => {
    const suggestions = await suggestionsFor("Tell me about AudioGraph");

    expect(suggestions).toEqual(
      expect.arrayContaining([
        "How does AudioGraph collect data?",
        "What was the hardest part of AudioGraph?",
        "Show me your other projects",
      ])
    );
  });

  it("suggests architecture follow-ups after project architecture intent", async () => {
    const suggestions = await suggestionsFor(
      "How does AudioGraph collect data?"
    );

    expect(suggestions.some((s) => s.includes("hardest part of AudioGraph"))).toBe(
      true
    );
    expect(suggestions.some((s) => s.includes("What is AudioGraph"))).toBe(true);
  });

  it("suggests architecture after project challenges intent", async () => {
    const suggestions = await suggestionsFor(
      "What was the hardest part of AudioGraph?"
    );

    expect(suggestions.some((s) => s.includes("collect data"))).toBe(true);
    expect(suggestions.some((s) => s.includes("What is AudioGraph"))).toBe(true);
  });

  it("suggests tech usage after show_tech_stack", async () => {
    const suggestions = await suggestionsFor(
      "What's your tech stack?",
      "show_tech_stack"
    );

    expect(suggestions.some((s) => s.startsWith("How have you used"))).toBe(
      true
    );
    expect(suggestions).toContain("Show me your projects");
  });

  it("suggests display intents after candidate overview", async () => {
    const suggestions = await suggestionsFor("Who is Eric?");

    expect(suggestions).toEqual(
      expect.arrayContaining([
        "Show me your projects",
        "What's your tech stack?",
        "Show my work experience",
      ])
    );
  });

  it("suggests AI project titles for ai_experience", async () => {
    const suggestions = await suggestionsFor("What AI projects have you built?");

    expect(
      suggestions.some((suggestion) => suggestion.includes("use AI"))
    ).toBe(true);
  });

  it("suggests design-system questions for design_system_experience", async () => {
    const suggestions = await suggestionsFor(
      "Tell me about your design system work"
    );

    expect(suggestions.some((s) => s.toLowerCase().includes("storybook"))).toBe(
      true
    );
  });

  it("suggests clarification fallbacks for unknown projects", async () => {
    const suggestions = await suggestionsFor("Tell me about Unknown Project");

    expect(suggestions).toEqual([
      "Show me your projects",
      "Tell me about yourself",
      "What's your tech stack?",
    ]);
  });

  it("suggests experience follow-ups after show_experience", async () => {
    const suggestions = await suggestionsFor(
      "Show my work experience",
      "show_experience"
    );

    expect(suggestions).toContain("Tell me about yourself");
    expect(suggestions).toContain("Show me your projects");
  });
});
