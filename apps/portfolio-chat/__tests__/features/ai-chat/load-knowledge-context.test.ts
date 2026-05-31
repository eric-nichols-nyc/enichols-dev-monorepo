import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatKnowledgeForPrompt,
  loadKnowledgeContext,
} from "@/features/ai-chat/utils/load-knowledge-context";
import { parseMarkdown } from "@/features/ai-chat/utils/parse-markdown-sections";
import type { RoutingResult } from "@/features/ai-chat/types/routing-result";

const knowledgeRoot = path.join(process.cwd(), "knowledge");

describe("parseMarkdown", () => {
  it("parses frontmatter, title, and sections", () => {
    const parsed = parseMarkdown(`---
id: sample
title: Sample Project
---

# Sample Project

## Overview
Overview copy.

## Architecture
Architecture copy.
`);

    expect(parsed.title).toBe("Sample Project");
    expect(parsed.sections).toHaveLength(2);
    expect(parsed.sections[0]?.name).toBe("Overview");
    expect(parsed.sections[1]?.content).toContain("Architecture copy");
  });
});

describe("loadKnowledgeContext", () => {
  it("returns empty context when no paths are provided", async () => {
    const routing: RoutingResult = {
      intent: "show_projects",
      entities: {},
      knowledgePaths: [],
      sectionSlices: {},
      responseType: "static_display",
      tool: "show_projects",
      originalMessage: "Show me your projects",
    };

    const context = await loadKnowledgeContext(routing, { knowledgeRoot });

    expect(context.files).toEqual([]);
    expect(context.truncated).toBe(false);
    expect(context.missingPaths).toEqual([]);
  });

  it("loads a full candidate profile file", async () => {
    const routing: RoutingResult = {
      intent: "candidate_overview",
      entities: {},
      knowledgePaths: ["candidate/candidate-profile.md"],
      sectionSlices: {},
      responseType: "context_aware_ai",
      originalMessage: "Tell me about yourself",
    };

    const context = await loadKnowledgeContext(routing, { knowledgeRoot });

    expect(context.files).toHaveLength(1);
    expect(context.files[0]?.title).toBeTruthy();
    expect(context.files[0]?.sections.length).toBeGreaterThan(0);
  });

  it("slices project architecture sections for AudioGraph", async () => {
    const routing: RoutingResult = {
      intent: "project_architecture",
      entities: { projectSlug: "audiograph" },
      knowledgePaths: ["projects/audiograph.md"],
      sectionSlices: {
        "projects/audiograph.md": ["Overview", "Architecture", "Tech Stack"],
      },
      responseType: "context_aware_ai",
      originalMessage: "How does AudioGraph collect data?",
    };

    const context = await loadKnowledgeContext(routing, { knowledgeRoot });
    const sectionNames = context.files[0]?.sections.map((section) => section.name);

    expect(sectionNames).toEqual(
      expect.arrayContaining(["Overview", "Architecture", "Tech Stack"])
    );
    expect(sectionNames).not.toContain("Challenges");
  });

  it("records missing files without throwing", async () => {
    const routing: RoutingResult = {
      intent: "general_question",
      entities: {},
      knowledgePaths: ["projects/does-not-exist.md"],
      sectionSlices: {},
      responseType: "context_aware_ai",
      originalMessage: "Tell me about FakeProject",
    };

    const context = await loadKnowledgeContext(routing, { knowledgeRoot });

    expect(context.files).toEqual([]);
    expect(context.missingPaths).toEqual(["projects/does-not-exist.md"]);
  });

  it("enforces the three-file cap", async () => {
    const routing: RoutingResult = {
      intent: "ai_experience",
      entities: { categories: ["ai"] },
      knowledgePaths: [
        "candidate/experience.md",
        "projects/github-codebase-copilot.md",
        "projects/trellnode.md",
        "projects/ai-taskwizard.md",
      ],
      sectionSlices: {},
      responseType: "context_aware_ai",
      originalMessage: "What AI projects have you built?",
    };

    const context = await loadKnowledgeContext(routing, { knowledgeRoot });

    expect(context.truncated).toBe(true);
    expect(context.files.length).toBeLessThanOrEqual(3);
  });
});

describe("formatKnowledgeForPrompt", () => {
  it("formats loaded files for prompt injection", async () => {
    const routing: RoutingResult = {
      intent: "candidate_overview",
      entities: {},
      knowledgePaths: ["candidate/candidate-profile.md"],
      sectionSlices: {},
      responseType: "context_aware_ai",
      originalMessage: "Tell me about yourself",
    };

    const context = await loadKnowledgeContext(routing, { knowledgeRoot });
    const prompt = formatKnowledgeForPrompt(context);

    expect(prompt).toContain("candidate/candidate-profile.md");
    expect(prompt).toContain("### Summary");
  });
});
