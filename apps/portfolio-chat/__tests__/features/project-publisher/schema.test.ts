import projects from "@/data/projects";
import { projectMetricSchema, projectSchema } from "@/features/project-publisher/lib/schema";
import { describe, expect, it } from "vitest";

describe("projectSchema", () => {
  it("validates all existing portfolio projects", () => {
    for (const project of projects) {
      expect(projectSchema.safeParse(project).success).toBe(true);
    }
  });

  it("rejects invalid id slugs", () => {
    const result = projectSchema.safeParse({
      ...projects[0],
      id: "Bad ID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = projectSchema.safeParse({
      ...projects[0],
      extraField: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("projectMetricSchema", () => {
  it("validates metric shape", () => {
    const result = projectMetricSchema.safeParse({
      label: "Users",
      value: "100+",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty label", () => {
    const result = projectMetricSchema.safeParse({
      label: "",
      value: "100+",
    });
    expect(result.success).toBe(false);
  });
});
