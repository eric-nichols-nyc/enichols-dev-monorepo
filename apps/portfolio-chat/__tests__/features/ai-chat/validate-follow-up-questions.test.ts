import { describe, expect, it } from "vitest";
import type { FollowUpContext } from "@/features/ai-chat/types/follow-up-context";
import { buildFollowUpContext } from "@/features/ai-chat/utils/build-follow-up-context";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import { validateFollowUpQuestions } from "@/features/ai-chat/utils/validate-follow-up-questions";

function context(question = "What's your tech stack?", path = "candidate/tech-stack.md", section = "Frontend", content = "React, TypeScript, and Next.js power my production interfaces."): FollowUpContext {
  return buildFollowUpContext({
    routingResult: routeIntent(question), loadedContext: {
      files: [{ path, title: section, sections: [{ name: section, content }], rawContent: `## ${section}\n${content}` }],
      truncated: false, missingPaths: [],
    },
  });
}

function candidate(ctx: FollowUpContext, question = "How have you used React?") {
  const source = ctx.input.sources[0]!;
  return { question, sourceId: source.id, excerpt: source.content };
}

describe("validateFollowUpQuestions", () => {
  it.each([
    ["What's your tech stack?", "candidate/tech-stack.md", "Frontend", "How have you used React?", "React powers production interfaces."],
    ["Show my work experience", "candidate/experience.md", "IBM", "What did you build at IBM?", "At IBM, Eric built React interfaces for content marketers."],
    ["Who is Eric?", "candidate/candidate-profile.md", "Working Style", "How do you collaborate with product and design?", "Eric partners with product and design to ship intuitive UIs."],
    ["What is CodeDrill?", "projects/codedrill.md", "Challenges", "What was the hardest part of CodeDrill?", "Keeping tutor feedback relevant was challenging."],
  ])("accepts a supported and correctly routed follow-up after %s", (current, path, section, question, content) => {
    const ctx = context(current, path, section, content);
    const result = validateFollowUpQuestions({ questions: [candidate(ctx, question)] }, ctx);
    expect(result.suggestions).toEqual([question]);
    expect(result.rejections).toEqual([]);
  });

  it("rejects fabricated evidence and unknown source IDs while retaining a valid candidate", () => {
    const ctx = context();
    const result = validateFollowUpQuestions({ questions: [
      { ...candidate(ctx), sourceId: "not-supplied" },
      { ...candidate(ctx), excerpt: "An invented achievement" },
      candidate(ctx),
    ] }, ctx);
    expect(result.suggestions).toEqual(["How have you used React?"]);
    expect(result.rejections).toEqual(["unknown-source", "unsupported-excerpt"]);
  });

  it("tolerates Markdown emphasis, casing, and whitespace while matching a contiguous excerpt", () => {
    const ctx = context("Show my work experience", "candidate/experience.md", "IBM",
      "At **IBM**,\nEric built React interfaces for content marketers.");
    const result = validateFollowUpQuestions({ questions: [{
      ...candidate(ctx, "What did you build at IBM?"), excerpt: "at IBM, Eric built React interfaces",
    }] }, ctx);
    expect(result.suggestions).toEqual(["What did you build at IBM?"]);
  });

  it("rejects altered numbers and non-contiguous excerpts after formatting normalization", () => {
    const ctx = context("Show my work experience", "candidate/experience.md", "IBM",
      "At IBM, Eric guided a team of 4 developers and built React interfaces.");
    const result = validateFollowUpQuestions({ questions: [
      { ...candidate(ctx, "How many developers were on your team at IBM?"), excerpt: "guided a team of 5 developers" },
      { ...candidate(ctx, "What did you build at IBM?"), excerpt: "At IBM, Eric built React interfaces" },
    ] }, ctx);
    expect(result.rejections).toEqual(["unsupported-excerpt", "unsupported-excerpt"]);
  });

  it.each([
    "What was the hardest part?", "What was the hardest part of Trellix?",
    "What was the hardest part of AudioGraph?", "What was the hardest part of CodeDrillExtra?",
    "How does CodeDrill use TypeScript?",
  ])("rejects a project question with the wrong subject or section: %s", (question) => {
    const ctx = context("What is CodeDrill?", "projects/codedrill.md", "Challenges");
    const result = validateFollowUpQuestions({ questions: [candidate(ctx, question)] }, ctx);
    expect(result.suggestions).toEqual([]);
    expect(result.rejections).toEqual(["wrong-route"]);
  });

  it("does not allow a displayed technology list to support a usage story", () => {
    const ctx = buildFollowUpContext({
      routingResult: routeIntent("What technologies do you use?"),
      loadedContext: { files: [], truncated: false, missingPaths: [] },
      toolResults: [{ toolName: "show_tech_stack", output: { technologies: ["React"] } }],
    });
    expect(validateFollowUpQuestions({ questions: [candidate(ctx)] }, ctx).rejections)
      .toEqual(["display-only-source"]);
  });

  it("rejects favorite questions when a source only documents tools in use", () => {
    const ctx = context();
    const result = validateFollowUpQuestions({ questions: [candidate(ctx, "What are your favorite TypeScript tools?")] }, ctx);
    expect(result.rejections).toEqual(["unsupported-preference"]);
    expect(result.suggestions).toEqual([]);
  });

  it("permits favorite questions when the preference is explicitly documented", () => {
    const ctx = context("What's your tech stack?", "candidate/tech-stack.md", "Frontend",
      "My favorite TypeScript tools are its compiler and Zod.");
    const question = "What are your favorite TypeScript tools?";
    expect(validateFollowUpQuestions({ questions: [candidate(ctx, question)] }, ctx).suggestions).toEqual([question]);
  });

  it("does not turn using a named design system into a claim of building it", () => {
    const ctx = context("Show my work experience", "candidate/experience.md", "IBM",
      "Built SPAs with React, TypeScript, and IBM Design System.");
    const result = validateFollowUpQuestions({ questions: [candidate(ctx,
      "What role did you play in building the IBM Design System?")] }, ctx);
    expect(result.rejections).toEqual(["unsupported-authorship"]);
  });

  it("permits a named system authorship question when the source explicitly documents it", () => {
    const ctx = context("Show my work experience", "candidate/experience.md", "IBM",
      "Eric built the IBM Design System for IBM teams.");
    const question = "What role did you play in building the IBM Design System?";
    expect(validateFollowUpQuestions({ questions: [candidate(ctx, question)] }, ctx).suggestions).toEqual([question]);
  });

  it("filters the latest question, recent questions, and duplicate generated questions", () => {
    const ctx = context("How have you used React?");
    ctx.blockedQuestions.push("HOW HAVE YOU USED TYPESCRIPT!");
    const result = validateFollowUpQuestions({ questions: [
      candidate(ctx), candidate(ctx, "How have you used TypeScript?"), candidate(ctx, "How have you used Next.js?"),
    ] }, ctx);
    expect(result.suggestions).toEqual(["How have you used Next.js?"]);
    expect(result.rejections).toEqual(["repeated", "repeated"]);
    const duplicate = validateFollowUpQuestions({ questions: [
      candidate(ctx, "How have you used Next.js?"), candidate(ctx, "How have you used Next.js?"),
    ] }, ctx);
    expect(duplicate.suggestions).toHaveLength(1);
    expect(duplicate.rejections).toEqual(["repeated"]);
  });

  it("fills gaps with safe navigation and rejects ambiguous, repeated, or cut-off fallback text", () => {
    const ctx = context();
    const result = validateFollowUpQuestions({ questions: [] }, ctx, [
      "Tell me about a specific project", "What's your tech stack?", "Tell me more…",
      "Tell me about AudioGraph", "Show me your projects", "Tell me about yourself", "Show my work experience",
      "Show me your projects",
    ]);
    expect(result.suggestions).toEqual([
      "Show me your projects", "Tell me about yourself", "Show my work experience",
    ]);
  });

  it.each([null, [], { questions: "invalid" }, { questions: Array(4).fill({}) }])(
    "falls back when the output envelope is malformed", (output) => {
      const ctx = context();
      const result = validateFollowUpQuestions(output, ctx, ["Show me your projects"]);
      expect(result.suggestions).toEqual(["Show me your projects"]);
      expect(result.rejections).toContain("invalid-output");
    }
  );

  it("rejects malformed, overlong, and incomplete candidates without trimming question wording", () => {
    const ctx = context();
    const result = validateFollowUpQuestions({ questions: [
      null, { ...candidate(ctx), question: "x".repeat(81) }, { ...candidate(ctx), question: "How have you used React…?" },
    ] }, ctx);
    expect(result.suggestions).toEqual([]);
    expect(result.rejections).toEqual(["invalid-candidate", "invalid-candidate", "invalid-question"]);
  });

  it("permits fewer than two questions and omits the block when no safe choices remain", () => {
    const ctx = context();
    expect(validateFollowUpQuestions({ questions: [candidate(ctx)] }, ctx).suggestions).toHaveLength(1);
    expect(validateFollowUpQuestions({ questions: [] }, ctx, [ctx.input.latestQuestion]).suggestions).toEqual([]);
  });

  it("ignores model candidates on an ineligible project-list turn", () => {
    const ctx = context("Show me your projects");
    const result = validateFollowUpQuestions({ questions: [{
      question: "How have you used React?", sourceId: "source-1", excerpt: "React",
    }] }, ctx, ["What's your tech stack?"]);
    expect(result.acceptedCandidates).toEqual([]);
    expect(result.suggestions).toEqual(["What's your tech stack?"]);
  });
});
