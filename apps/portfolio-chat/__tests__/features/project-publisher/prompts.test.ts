import {
  buildKnowledgeMarkdownUserPrompt,
  getKnowledgeMarkdownSystemPrompt,
  stripMarkdownCodeFence,
} from "@/features/project-publisher/lib/prompts";
import { describe, expect, it } from "vitest";

describe("getKnowledgeMarkdownSystemPrompt", () => {
  it("includes required portfolio sections", () => {
    const prompt = getKnowledgeMarkdownSystemPrompt();

    for (const section of [
      "Overview",
      "Problem",
      "Solution",
      "Tech Stack",
      "Architecture",
      "Key Features",
      "Challenges",
      "Lessons Learned",
      "Links",
      "Metrics",
    ]) {
      expect(prompt).toContain(section);
    }
  });
});

describe("buildKnowledgeMarkdownUserPrompt", () => {
  it("includes repository metadata and readme content", () => {
    const prompt = buildKnowledgeMarkdownUserPrompt({
      readme: "# Demo\n\nHello world",
      repoUrl: "https://github.com/owner/demo",
      liveUrl: "https://demo.example.com",
      projectId: "demo",
      repoName: "demo",
    });

    expect(prompt).toContain("Suggested project id: demo");
    expect(prompt).toContain("GitHub URL: https://github.com/owner/demo");
    expect(prompt).toContain("Live URL: https://demo.example.com");
    expect(prompt).toContain("# Demo");
  });
});

describe("stripMarkdownCodeFence", () => {
  it("removes markdown code fences", () => {
    expect(stripMarkdownCodeFence("```markdown\n---\nid: demo\n---\n```")).toBe(
      "---\nid: demo\n---"
    );
  });

  it("returns trimmed text when no fence is present", () => {
    expect(stripMarkdownCodeFence("  ---\nid: demo\n---  ")).toBe(
      "---\nid: demo\n---"
    );
  });
});
