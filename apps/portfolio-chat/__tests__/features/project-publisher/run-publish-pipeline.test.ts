import projects from "@/data/projects";
import { runPublishPipeline } from "@/features/project-publisher/lib/run-publish-pipeline";
import { describe, expect, it, vi } from "vitest";

const draft = {
  markdown: "# Sample App\n\n## Overview\nDemo project.",
  project: {
    id: "brand-new-project",
    position: 99,
    title: "Brand New Project",
    tags: ["demo"],
    categories: ["web"],
    description: "A brand new demo project for publish tests.",
    shortDescription: "Brand new demo.",
    date: "2024-01-01",
    url: "https://brand-new.example.com",
    published: false,
    image: "/images/brand-new.png",
    gallery: [],
  },
};

vi.mock("@/features/project-publisher/lib/update-projects-file", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/project-publisher/lib/update-projects-file")
  >("@/features/project-publisher/lib/update-projects-file");

  return {
    ...actual,
    assertProjectIdAvailable: vi.fn(async () => undefined),
    updateProjectsFile: vi.fn(async () => undefined),
  };
});

vi.mock("@/features/project-publisher/lib/write-knowledge-file", () => ({
  deleteKnowledgeFile: vi.fn(async () => undefined),
  writeKnowledgeFile: vi.fn(async () => undefined),
}));

describe("runPublishPipeline", () => {
  it("returns validation errors for invalid projects", async () => {
    const result = await runPublishPipeline({
      markdown: draft.markdown,
      project: {
        ...draft.project,
        id: "Invalid ID",
      },
    });

    expect(result.project).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns a published project on success", async () => {
    const result = await runPublishPipeline(draft);

    expect(result.errors).toEqual([]);
    expect(result.project).toMatchObject({
      id: "brand-new-project",
      title: "Brand New Project",
    });
  });

  it("returns duplicate errors when the id already exists", async () => {
    const { assertProjectIdAvailable } = await import(
      "@/features/project-publisher/lib/update-projects-file"
    );

    vi.mocked(assertProjectIdAvailable).mockRejectedValueOnce(
      new (await import("@/features/project-publisher/lib/publish-errors")).DuplicateProjectIdError(
        projects[0].id
      )
    );

    const result = await runPublishPipeline({
      ...draft,
      project: {
        ...draft.project,
        id: projects[0].id,
      },
    });

    expect(result.errors[0]).toContain("already exists");
  });
});
