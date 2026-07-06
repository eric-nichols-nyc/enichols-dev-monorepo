import { runGeneratePipeline } from "@/features/project-publisher/lib/run-generate-pipeline";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pipelineInput = {
  repoUrl: "https://github.com/owner/sample-app",
  image: "/images/sample-app.png",
  gallery: ["/images/sample-app-2.png"],
  liveUrl: "https://sample-app.example.com",
  position: 5,
  published: true,
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

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

vi.mock("@/features/project-publisher/lib/generate-knowledge-markdown", () => ({
  GenerateKnowledgeMarkdownError: class GenerateKnowledgeMarkdownError extends Error {
    name = "GenerateKnowledgeMarkdownError";
  },
  generateKnowledgeMarkdown: vi.fn(async () => generatedMarkdown),
}));

const generatedProject = {
  id: "sample-app",
  title: "Sample App",
  tags: ["demo"],
  categories: ["web"],
  description: "Demo project description for the portfolio.",
  shortDescription: "Demo project.",
  date: "2024-01-01",
  url: pipelineInput.liveUrl,
  published: pipelineInput.published,
  image: pipelineInput.image,
  gallery: pipelineInput.gallery,
  position: pipelineInput.position,
  githubUrl: pipelineInput.repoUrl,
};

vi.mock("@/features/project-publisher/lib/generate-project-object", () => ({
  GenerateProjectObjectError: class GenerateProjectObjectError extends Error {
    name = "GenerateProjectObjectError";
  },
  generateProjectObject: vi.fn(async () => generatedProject),
}));

describe("runGeneratePipeline", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = getRequestUrl(input);

        if (url.includes("/repos/owner/sample-app/readme")) {
          return Promise.resolve(
            new Response("# Sample App\n\nA demo project.", { status: 200 })
          );
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a validated draft on success", async () => {
    const result = await runGeneratePipeline(pipelineInput);

    expect(result.errors).toEqual([]);
    expect(result.readme).toContain("Sample App");
    expect(result.markdown).toContain("id: sample-app");
    expect(result.project).toMatchObject({
      id: "sample-app",
      image: pipelineInput.image,
      gallery: pipelineInput.gallery,
      position: pipelineInput.position,
      published: true,
      url: pipelineInput.liveUrl,
      githubUrl: pipelineInput.repoUrl,
    });
  });

  it("returns early on invalid repository URLs", async () => {
    const result = await runGeneratePipeline({
      ...pipelineInput,
      repoUrl: "https://gitlab.com/owner/repo",
    });

    expect(result.errors).toEqual(["Invalid GitHub repository URL"]);
    expect(result.readme).toBeUndefined();
    expect(result.markdown).toBeUndefined();
    expect(result.project).toBeUndefined();
  });

  it("returns early on GitHub README errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(null, { status: 429 })))
    );

    const result = await runGeneratePipeline(pipelineInput);

    expect(result.errors).toEqual([
      "GitHub rate limit exceeded. Try again or set GITHUB_TOKEN.",
    ]);
    expect(result.project).toBeUndefined();
  });

  it("returns validation errors when the generated project is invalid", async () => {
    const { generateProjectObject } = await import(
      "@/features/project-publisher/lib/generate-project-object"
    );

    vi.mocked(generateProjectObject).mockResolvedValueOnce({
      ...generatedProject,
      id: "Invalid ID",
    });

    const result = await runGeneratePipeline(pipelineInput);

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain(
      "Project ID must be lowercase letters, numbers, and hyphens only"
    );
    expect(result.markdown).toBeUndefined();
    expect(result.project).toBeUndefined();
  });
});
