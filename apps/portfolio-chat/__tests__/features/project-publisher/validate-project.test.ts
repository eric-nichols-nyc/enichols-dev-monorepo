import projects from "@/data/projects";
import {
  formatValidationErrors,
  isValidDraft,
  validateProject,
} from "@/features/project-publisher/lib/validate-project";
import { projectSchema } from "@/features/project-publisher/lib/schema";
import { describe, expect, it } from "vitest";

describe("validateProject", () => {
  it("accepts a valid project", () => {
    const result = validateProject(projects[0]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(projects[0].id);
    }
  });

  it("returns helpful errors for invalid id slugs", () => {
    const result = validateProject({
      ...projects[0],
      id: "Bad ID",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain(
        "Project ID must be lowercase letters, numbers, and hyphens only"
      );
    }
  });

  it("returns helpful errors for invalid URLs", () => {
    const result = validateProject({
      ...projects[0],
      url: "not-a-url",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain(
        "Live URL must be a valid URL (include https://)"
      );
    }
  });

  it("returns helpful errors for unexpected fields", () => {
    const result = validateProject({
      ...projects[0],
      extraField: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain("Remove unexpected field(s): extraField");
    }
  });

  it("returns helpful errors for empty required strings", () => {
    const result = validateProject({
      ...projects[0],
      title: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toBe("Title cannot be empty");
    }
  });
});

describe("formatValidationErrors", () => {
  it("maps Zod issues to readable messages", () => {
    const parsed = projectSchema.safeParse({
      ...projects[0],
      date: "2024/01/01",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(formatValidationErrors(parsed.error.issues)[0]).toBe(
        "Date must use YYYY-MM-DD format"
      );
    }
  });
});

describe("isValidDraft", () => {
  it("returns true only when errors are empty and draft fields exist", () => {
    expect(
      isValidDraft({
        errors: [],
        markdown: "# Demo",
        project: projects[0],
      })
    ).toBe(true);
  });

  it("returns false when validation errors are present", () => {
    expect(
      isValidDraft({
        errors: ["Title cannot be empty"],
        markdown: "# Demo",
        project: projects[0],
      })
    ).toBe(false);
  });

  it("returns false when project or markdown is missing", () => {
    expect(
      isValidDraft({
        errors: [],
        markdown: "# Demo",
      })
    ).toBe(false);
  });
});
