import projects from "@/data/projects";
import { serializeProjectObject } from "@/features/project-publisher/lib/serialize-project-object";
import { describe, expect, it } from "vitest";

describe("serializeProjectObject", () => {
  it("serializes required project fields", () => {
    const serialized = serializeProjectObject({
      id: "sample-app",
      position: 10,
      title: "Sample App",
      tags: ["demo"],
      categories: ["web"],
      description: "A demo project for the portfolio.",
      shortDescription: "Demo project.",
      date: "2024-01-01",
      url: "https://sample-app.example.com",
      published: true,
      image: "/images/sample-app.png",
      gallery: [],
    });

    expect(serialized).toContain('id: "sample-app"');
    expect(serialized).toContain('title: "Sample App"');
    expect(serialized).toContain("published: true");
    expect(serialized).toContain("gallery: []");
  });

  it("includes optional rich fields when present", () => {
    const serialized = serializeProjectObject({
      ...projects[0],
      id: "preview-project",
      subtitle: "Preview subtitle",
      githubUrl: "https://github.com/owner/preview-project",
      metrics: [{ label: "Users", value: "100+" }],
    });

    expect(serialized).toContain('subtitle: "Preview subtitle"');
    expect(serialized).toContain(
      'githubUrl: "https://github.com/owner/preview-project"'
    );
    expect(serialized).toContain('{ label: "Users", value: "100+" }');
  });
});
