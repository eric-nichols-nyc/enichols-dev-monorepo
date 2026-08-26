import {
  GenerateProjectObjectError,
  generateProjectObject,
  mergeAdminProjectFields,
} from "@/features/project-publisher/lib/generate-project-object";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const generatedFields = {
  id: "sample-app",
  title: "Sample App",
  tags: ["nextjs", "typescript"],
  categories: ["web"],
  description: "A demo application for portfolio publishing.",
  shortDescription: "Demo app for portfolio publishing.",
  date: "2024-01-15",
  subtitle: "Demo Application",
  problem: "Teams needed a faster way to publish projects.",
  solution: "Built an admin workflow to generate portfolio artifacts.",
  tech: ["Next.js", "TypeScript"],
  features: ["Admin generate flow", "Draft preview"],
  metrics: [{ label: "Projects", value: "10+" }],
  githubUrl: "https://github.com/owner/sample-app",
  badges: ["Full Stack"],
  highlights: ["Automated draft generation"],
};

const objectInput = {
  readme: "# Sample App\n\nA demo project.",
  markdown: "---\nid: sample-app\n---\n\n# Sample App",
  input: {
    repoUrl: "https://github.com/owner/sample-app",
    image: "/images/sample-app.png",
    gallery: ["/images/sample-app-2.png"],
    liveUrl: "https://sample-app.example.com",
    position: 5,
    published: true,
  },
};

vi.mock("@repo/ai", () => ({
  generateObject: vi.fn(),
}));

vi.mock("@repo/ai/lib/models", () => ({
  models: {
    chat: "mock-model",
  },
}));

describe("mergeAdminProjectFields", () => {
  it("applies admin-provided portfolio fields", () => {
    expect(mergeAdminProjectFields(generatedFields, objectInput.input)).toEqual({
      ...generatedFields,
      url: "https://sample-app.example.com",
      image: "/images/sample-app.png",
      gallery: ["/images/sample-app-2.png"],
      position: 5,
      published: true,
    });
  });

  it("defaults url to GitHub when liveUrl is omitted", () => {
    expect(
      mergeAdminProjectFields(generatedFields, {
        ...objectInput.input,
        liveUrl: undefined,
      }).url
    ).toBe("https://github.com/owner/sample-app");
  });
});

describe("generateProjectObject", () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY;

  beforeEach(async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const { generateObject } = await import("@repo/ai");
    vi.mocked(generateObject).mockResolvedValue({
      object: generatedFields,
    } as Awaited<ReturnType<typeof generateObject>>);
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalOpenAiKey;
    vi.clearAllMocks();
  });

  it("calls structured generation with the project schema", async () => {
    const { generateObject } = await import("@repo/ai");

    await generateProjectObject(objectInput);

    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
        system: expect.stringContaining("data/projects.ts"),
        prompt: expect.stringContaining("Suggested project id: sample-app"),
      })
    );
  });

  it("returns a project merged with admin fields", async () => {
    await expect(generateProjectObject(objectInput)).resolves.toMatchObject({
      id: "sample-app",
      title: "Sample App",
      image: "/images/sample-app.png",
      gallery: ["/images/sample-app-2.png"],
      position: 5,
      published: true,
      url: "https://sample-app.example.com",
      tags: ["nextjs", "typescript"],
    });
  });

  it("fails when OPENAI_API_KEY is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(generateProjectObject(objectInput)).rejects.toThrow(
      "OPENAI_API_KEY is not configured."
    );
  });

  it("wraps model failures", async () => {
    const { generateObject } = await import("@repo/ai");
    vi.mocked(generateObject).mockRejectedValue(new Error("model down"));

    await expect(generateProjectObject(objectInput)).rejects.toBeInstanceOf(
      GenerateProjectObjectError
    );
  });
});
