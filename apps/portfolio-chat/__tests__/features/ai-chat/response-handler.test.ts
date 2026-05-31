import { describe, expect, it } from "vitest";
import { buildGroundedSystemPrompt } from "@/features/ai-chat/utils/build-grounded-prompt";
import { shouldUseAboutStreamLegacy } from "@/features/ai-chat/utils/should-use-about-stream-legacy";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import { extractLatestUserText } from "@/features/ai-chat/utils/extract-latest-user-text";
import type { UIMessage } from "@repo/ai";

describe("extractLatestUserText", () => {
  it("returns the latest user text part", () => {
    const messages = [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "Show me your projects" }],
      },
      {
        id: "2",
        role: "assistant",
        parts: [{ type: "text", text: "Here you go." }],
      },
      {
        id: "3",
        role: "user",
        parts: [{ type: "text", text: "Tell me about AudioGraph" }],
      },
    ] as UIMessage[];

    expect(extractLatestUserText(messages)).toBe("Tell me about AudioGraph");
  });
});

describe("shouldUseAboutStreamLegacy", () => {
  it("keeps about-stream only for the about pill phrase", () => {
    const aboutRouting = routeIntent("Tell me about yourself");
    expect(shouldUseAboutStreamLegacy(aboutRouting, "Tell me about yourself")).toBe(
      true
    );
    expect(shouldUseAboutStreamLegacy(aboutRouting, "Who is Eric?")).toBe(false);
  });
});

describe("buildGroundedSystemPrompt", () => {
  it("includes knowledge content and grounding rules", () => {
    const prompt = buildGroundedSystemPrompt({
      files: [
        {
          path: "projects/audiograph.md",
          title: "AudioGraph",
          sections: [{ name: "Overview", content: "Artist analytics platform." }],
          rawContent: "# AudioGraph\n\n## Overview\nArtist analytics platform.",
        },
      ],
      truncated: false,
      missingPaths: [],
    });

    expect(prompt).toContain("Portfolio knowledge");
    expect(prompt).toContain("Artist analytics platform.");
    expect(prompt).toContain("I don't have that in my portfolio materials.");
  });
});

describe("clarification routing", () => {
  it("forces show_projects tool when an unknown project is referenced", () => {
    const routing = routeIntent("Tell me about Unknown Project");
    expect(routing).toMatchObject({
      clarificationNeeded: true,
      responseType: "context_aware_ai",
    });

    const forcedTool =
      routing.responseType === "static_display" || routing.responseType === "hybrid"
        ? routing.tool
        : routing.clarificationNeeded
          ? "show_projects"
          : undefined;

    expect(forcedTool).toBe("show_projects");
  });
});
