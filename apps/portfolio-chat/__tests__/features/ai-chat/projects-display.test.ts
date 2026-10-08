import { describe, expect, it, vi } from "vitest";
import projects from "@/data/projects";
import { runChatStream } from "@/features/ai-chat/api/run-chat-stream";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import { getProjectsDisplayOutput } from "@/features/ai-chat/utils/get-projects-display-output";
import { streamText } from "@repo/ai";

vi.mock("@repo/ai", () => ({ streamText: vi.fn(), stepCountIs: vi.fn() }));
vi.mock("@repo/ai/lib/models", () => ({ models: { chat: {} } }));
vi.mock("@/lib/ai/tools/about", () => ({ aboutRelated: [] }));
vi.mock("@/lib/ai/tools/portfolio-tools", () => ({ portfolioChatTools: {} }));

const knowledgeContext = { files: [], truncated: false, missingPaths: [] };

describe("direct project list", () => {
  it.each([true, false])("preserves tool UI and suggestions without requesting AI (dynamic suggestions: %s)", async (dynamicSuggestionsEnabled) => {
    const write = vi.fn();
    await runChatStream({
      writer: { write },
      modelMessages: [{ role: "user", content: "Show projects" }],
      routing: routeIntent("Show projects"),
      knowledgeContext,
      userText: "Show projects",
      useLegacyAboutStream: !dynamicSuggestionsEnabled,
      dynamicSuggestionsEnabled,
    });
    const chunks = write.mock.calls.map(([chunk]) => chunk);
    expect(streamText).not.toHaveBeenCalled();
    expect(chunks.map((chunk) => chunk.type)).toEqual([
      "start", "tool-input-available", "tool-output-available", "data-related", "finish",
    ]);
    expect(chunks[1].toolName).toBe("show_projects");
    expect(chunks[2].toolCallId).toBe(chunks[1].toolCallId);
    expect(chunks[2].output).toEqual({ projectCount: 2, projects });
    expect(chunks[2].output.projects.map((project: { title: string }) => project.title)).toEqual(["Trellix", "CodeDrill"]);
    expect(chunks[3].data.suggestions.length).toBeGreaterThan(0);
  });

  it("shares the same project payload with the model tool", () => {
    expect(getProjectsDisplayOutput()).toMatchObject({ projectCount: projects.length, projects });
  });
});
