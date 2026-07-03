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

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

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
    expect(result.markdown).toContain("Project knowledge (placeholder)");
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
});
