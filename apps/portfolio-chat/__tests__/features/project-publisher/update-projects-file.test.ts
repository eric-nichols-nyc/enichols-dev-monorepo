import projects from "@/data/projects";
import { DuplicateProjectIdError } from "@/features/project-publisher/lib/publish-errors";
import { getProjectsFilePath } from "@/features/project-publisher/lib/project-publish-paths";
import {
  assertProjectIdAvailable,
  insertProjectIntoProjectsFile,
} from "@/features/project-publisher/lib/update-projects-file";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("assertProjectIdAvailable", () => {
  it("rejects an existing portfolio project id", async () => {
    await expect(assertProjectIdAvailable(projects[0].id)).rejects.toBeInstanceOf(
      DuplicateProjectIdError
    );
  });

  it("rejects ids that already have a knowledge file", async () => {
    await expect(assertProjectIdAvailable("audiograph")).rejects.toBeInstanceOf(
      DuplicateProjectIdError
    );
  });
});

describe("insertProjectIntoProjectsFile", () => {
  it("appends a project while preserving the export footer", async () => {
    const content = await readFile(getProjectsFilePath(), "utf8");
    const updated = insertProjectIntoProjectsFile(content, {
      id: "insert-test-project",
      position: 99,
      title: "Insert Test Project",
      tags: ["demo"],
      categories: ["web"],
      description: "Insert test project description.",
      shortDescription: "Insert test.",
      date: "2024-01-01",
      url: "https://insert-test.example.com",
      published: false,
      image: "/images/insert-test.png",
      gallery: [],
    });

    expect(updated).toContain('id: "insert-test-project"');
    expect(updated).toContain(
      "const projects = [...projectsUnsorted].sort((a, b) => a.position - b.position);"
    );
    expect(updated).toContain("export default projects;");
  });
});
