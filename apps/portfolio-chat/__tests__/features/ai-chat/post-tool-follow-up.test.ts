import { describe, expect, it } from "vitest";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import {
  getTechStackPostToolText,
  shouldStreamProjectsFollowUp,
  TECH_STACK_FOLLOW_UP,
} from "@/features/ai-chat/utils/post-tool-follow-up";

describe("shouldStreamProjectsFollowUp", () => {
  it("streams follow-up for static display projects", () => {
    const routing = routeIntent("Show me your projects");
    expect(shouldStreamProjectsFollowUp(routing, false)).toBe(true);
  });

  it("skips follow-up when clarification already introduced the grid", () => {
    const routing = routeIntent("Tell me about Unknown Project");
    expect(shouldStreamProjectsFollowUp(routing, false)).toBe(false);
  });

  it("keeps legacy behavior when knowledge assistant is disabled", () => {
    const routing = routeIntent("Tell me about Unknown Project");
    expect(shouldStreamProjectsFollowUp(routing, true)).toBe(true);
  });
});

describe("getTechStackPostToolText", () => {
  const techStackContext = {
    files: [
      {
        path: "candidate/tech-stack.md",
        title: "Tech Stack",
        sections: [
          {
            name: "Overview",
            content: "Eric builds with React, Next.js, and TypeScript.",
          },
        ],
        rawContent: "# Tech Stack\n\nEric builds with React, Next.js, and TypeScript.",
      },
    ],
    truncated: false,
    missingPaths: [],
  };

  it("returns no prose for exact tech stack pill (RH10)", () => {
    const routing = routeIntent("What's your tech stack?");
    expect(getTechStackPostToolText(routing, techStackContext, false)).toBeNull();
  });

  it("returns grounded narration for hybrid tech stack questions", () => {
    const routing = routeIntent("What technologies do you use?");
    expect(getTechStackPostToolText(routing, techStackContext, false)).toBe(
      "Eric builds with React, Next.js, and TypeScript."
    );
  });

  it("falls back to generic copy for hybrid when knowledge is missing", () => {
    const routing = routeIntent("What technologies do you use?");
    expect(
      getTechStackPostToolText(
        routing,
        { files: [], truncated: false, missingPaths: [] },
        false
      )
    ).toBe(TECH_STACK_FOLLOW_UP);
  });

  it("keeps legacy generic follow-up when knowledge assistant is disabled", () => {
    const routing = routeIntent("What's your tech stack?");
    expect(getTechStackPostToolText(routing, techStackContext, true)).toBe(
      TECH_STACK_FOLLOW_UP
    );
  });
});
