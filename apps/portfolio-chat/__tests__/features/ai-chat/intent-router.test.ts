import { describe, expect, it } from "vitest";
import {
  normalizeMessage,
  routeIntent,
} from "@/features/ai-chat/utils/intent-router";

describe("normalizeMessage", () => {
  it("normalizes casing, punctuation, and suggestion aliases", () => {
    expect(normalizeMessage("  What's your tech stack?  ")).toBe(
      "what's your tech stack"
    );
    expect(normalizeMessage("Experience")).toBe("show my work experience");
  });
});

describe("routeIntent", () => {
  it("routes display intents to tools with correct response types", () => {
    expect(routeIntent("Show me your projects")).toMatchObject({
      intent: "show_projects",
      responseType: "static_display",
      tool: "show_projects",
      knowledgePaths: [],
    });

    expect(routeIntent("What's your tech stack?")).toMatchObject({
      intent: "show_tech_stack",
      responseType: "static_display",
      tool: "show_tech_stack",
    });

    expect(routeIntent("What technologies do you use?")).toMatchObject({
      intent: "show_tech_stack",
      responseType: "hybrid",
      tool: "show_tech_stack",
    });

    expect(routeIntent("Show my work experience")).toMatchObject({
      intent: "show_experience",
      responseType: "static_display",
      tool: "show_experience",
    });
  });

  it("routes candidate overview separately from experience display", () => {
    expect(routeIntent("Tell me about yourself")).toMatchObject({
      intent: "candidate_overview",
      responseType: "context_aware_ai",
      knowledgePaths: ["candidate/candidate-profile.md"],
    });

    expect(routeIntent("What's your experience?")).toMatchObject({
      intent: "show_experience",
      tool: "show_experience",
    });
  });

  it("routes named project intents with section slices", () => {
    const overview = routeIntent("Tell me about AudioGraph");
    expect(overview).toMatchObject({
      intent: "project_overview",
      entities: { projectSlug: "audiograph" },
      knowledgePaths: ["projects/audiograph.md"],
    });
    expect(overview.sectionSlices["projects/audiograph.md"]).toEqual([
      "Overview",
      "Problem",
      "Solution",
      "Links",
    ]);

    const architecture = routeIntent("How does AudioGraph collect data?");
    expect(architecture).toMatchObject({
      intent: "project_architecture",
      entities: { projectSlug: "audiograph" },
    });
    expect(architecture.sectionSlices["projects/audiograph.md"]).toEqual([
      "Overview",
      "Architecture",
      "Tech Stack",
    ]);

    const challenges = routeIntent("What was the hardest part of AudioGraph?");
    expect(challenges).toMatchObject({
      intent: "project_challenges",
      entities: { projectSlug: "audiograph" },
    });
    expect(challenges.sectionSlices["projects/audiograph.md"]).toEqual([
      "Overview",
      "Challenges",
      "Lessons Learned",
    ]);
  });

  it("resolves Trellix title to trellnode slug", () => {
    expect(routeIntent("Tell me about Trellix")).toMatchObject({
      intent: "project_overview",
      entities: { projectSlug: "trellnode" },
    });
  });

  it("routes category intents", () => {
    expect(routeIntent("What AI projects have you built?")).toMatchObject({
      intent: "ai_experience",
      entities: { categories: ["ai"], projectSlug: undefined },
    });

    expect(routeIntent("Tell me about your design system work")).toMatchObject({
      intent: "design_system_experience",
      knowledgePaths: ["candidate/experience.md"],
    });
  });

  it("flags unknown project references for clarification", () => {
    expect(routeIntent("Tell me about Unknown Project")).toMatchObject({
      intent: "general_question",
      clarificationNeeded: true,
    });
  });

  it("prefers project intent over ai experience when a project is named", () => {
    expect(routeIntent("Tell me about the AI work on AI-TaskWizard")).toMatchObject({
      intent: "project_overview",
      entities: { projectSlug: "ai-taskwizard" },
    });
  });
});
