import { generateKnowledgeMarkdown } from "@/features/project-publisher/lib/generate-knowledge-markdown";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const markdownInput = {
  readme: "# Sample App\n\nA demo project.",
  repoUrl: "https://github.com/owner/sample-app",
  liveUrl: "https://sample-app.example.com",
  projectId: "sample-app",
  repoName: "sample-app",
};

const generatedMarkdown = [
  "---",
  "id: sample-app",
  "title: Sample App",
  "tags: [demo]",
  "categories: [web]",
  "---",
  "",
  "# Sample App",
  "",
  "## Overview",
  "Demo project overview.",
].join("\n");

vi.mock("@repo/ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@repo/ai/lib/models", () => ({
  models: {
    chat: "mock-model",
  },
}));

describe("generateKnowledgeMarkdown", () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY;

  beforeEach(async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const { generateText } = await import("@repo/ai");
    vi.mocked(generateText).mockResolvedValue({
      text: generatedMarkdown,
    } as Awaited<ReturnType<typeof generateText>>);
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalOpenAiKey;
    vi.clearAllMocks();
  });

  it("calls the model with portfolio markdown prompts", async () => {
    const { generateText } = await import("@repo/ai");

    await generateKnowledgeMarkdown(markdownInput);

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
        system: expect.stringContaining("Overview"),
        prompt: expect.stringContaining("Suggested project id: sample-app"),
      })
    );
  });

  it("returns generated markdown with frontmatter", async () => {
    await expect(generateKnowledgeMarkdown(markdownInput)).resolves.toBe(
      generatedMarkdown
    );
  });

  it("strips code fences from model output", async () => {
    const { generateText } = await import("@repo/ai");
    vi.mocked(generateText).mockResolvedValue({
      text: `\`\`\`markdown\n${generatedMarkdown}\n\`\`\``,
    } as Awaited<ReturnType<typeof generateText>>);

    await expect(generateKnowledgeMarkdown(markdownInput)).resolves.toBe(
      generatedMarkdown
    );
  });

  it("fails when OPENAI_API_KEY is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(generateKnowledgeMarkdown(markdownInput)).rejects.toThrow(
      "OPENAI_API_KEY is not configured."
    );
  });
});
