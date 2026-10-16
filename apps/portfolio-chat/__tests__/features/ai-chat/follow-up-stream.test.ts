import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateObject, streamText } from "@repo/ai";
import { runChatStream } from "@/features/ai-chat/api/run-chat-stream";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import type { FollowUpPromptContext } from "@/features/ai-chat/types/follow-up-context";

vi.mock("@repo/ai", () => ({ streamText: vi.fn(), generateObject: vi.fn(), stepCountIs: vi.fn() }));
vi.mock("@repo/ai/lib/models", () => ({ models: { chat: {} } }));
vi.mock("@/lib/ai/tools/about", () => ({ aboutRelated: [] }));
vi.mock("@/lib/ai/tools/portfolio-tools", () => ({ portfolioChatTools: {} }));

type Chunk = { type: string; [key: string]: unknown };

function mockStream(chunks: Chunk[]) {
  vi.mocked(streamText).mockReturnValue({ toUIMessageStream: () => ({
    async *[Symbol.asyncIterator]() { for (const chunk of chunks) yield chunk; },
  }) } as unknown as ReturnType<typeof streamText>);
}

function params(question = "What's your tech stack?") {
  return {
    writer: { write: vi.fn() }, modelMessages: [{ role: "user" as const, content: question }],
    routing: routeIntent(question), userText: question, useLegacyAboutStream: false,
    dynamicSuggestionsEnabled: true, aiFollowUpsEnabled: true,
    knowledgeContext: { files: [{ path: "candidate/tech-stack.md", title: "Tech Stack",
      sections: [{ name: "Frontend", content: "React powers my typed interfaces." }],
      rawContent: "## Frontend\nReact powers my typed interfaces.",
    }], truncated: false, missingPaths: [] },
  };
}

describe("follow-up stream integration", () => {
  beforeEach(() => { vi.mocked(streamText).mockReset(); vi.mocked(generateObject).mockReset(); });

  it("streams card content immediately, captures its facts, and emits one suggestion set before finish", async () => {
    const input = params();
    mockStream([
      { type: "start" },
      { type: "tool-input-available", toolCallId: "tech", toolName: "show_tech_stack", input: {} },
      { type: "tool-output-available", toolCallId: "tech", output: {
        technologies: ["React"], tech: { frontend: [{ name: "React" }] }, related: ["Static duplicate"],
      } },
      { type: "finish" },
    ]);
    vi.mocked(generateObject).mockImplementation(async (options) => {
      const chunks = input.writer.write.mock.calls.map(([chunk]) => chunk);
      expect(chunks.some((chunk) => chunk.type === "tool-output-available")).toBe(true);
      expect(chunks.some((chunk) => chunk.type === "finish")).toBe(false);
      const ctx: FollowUpPromptContext = JSON.parse(options.prompt as string);
      expect(ctx.sources.some((source) => source.kind === "tool" && source.scope === "display")).toBe(true);
      const source = ctx.sources.find((source) => source.kind === "knowledge")!;
      return { object: { questions: [{ question: "How have you used React?", sourceId: source.id, excerpt: source.content }] } } as Awaited<ReturnType<typeof generateObject>>;
    });
    await runChatStream(input);
    const chunks = input.writer.write.mock.calls.map(([chunk]) => chunk);
    expect(chunks.filter((chunk) => chunk.type === "data-related")).toHaveLength(1);
    expect(chunks.at(-1)?.type).toBe("finish");
    expect(chunks.at(-2)?.data.suggestions).toContain("How have you used React?");
    expect(chunks.find((chunk) => chunk.type === "tool-output-available")?.output).not.toHaveProperty("related");
  });

  it("keeps the template path when the AI flag is off", async () => {
    mockStream([{ type: "start" }, { type: "finish" }]);
    const input = { ...params(), aiFollowUpsEnabled: false };
    await runChatStream(input);
    expect(generateObject).not.toHaveBeenCalled();
    expect(input.writer.write.mock.calls.at(-1)?.[0].type).toBe("finish");
    expect(input.writer.write.mock.calls.some(([chunk]) => chunk.type === "data-related")).toBe(true);
  });

  it("does not generate suggestions after a failed main response", async () => {
    mockStream([{ type: "start" }, { type: "error", errorText: "Safe failure" }]);
    const input = params();
    await runChatStream(input);
    expect(generateObject).not.toHaveBeenCalled();
    expect(input.writer.write.mock.calls.some(([chunk]) => chunk.type === "data-related")).toBe(false);
  });

  it("does not generate follow-ups when a displayed tool fails", async () => {
    mockStream([
      { type: "start" },
      { type: "tool-input-available", toolName: "show_tech_stack", toolCallId: "failed", input: {} },
      { type: "tool-output-error", toolCallId: "failed", errorText: "Safe tool failure" },
      { type: "finish" },
    ]);
    const input = params();
    await runChatStream(input);
    expect(generateObject).not.toHaveBeenCalled();
    expect(input.writer.write.mock.calls.some(([chunk]) => chunk.type === "data-related")).toBe(false);
    expect(input.writer.write.mock.calls.at(-1)?.[0].type).toBe("finish");
  });

  it("emits safe fallback questions after a supplementary provider failure", async () => {
    mockStream([{ type: "start" }, { type: "finish" }]);
    vi.mocked(generateObject).mockRejectedValue(new Error("Private provider failure"));
    const input = params();
    await runChatStream(input);
    const chunks = input.writer.write.mock.calls.map(([chunk]) => chunk);
    expect(chunks.some((chunk) => chunk.type === "error")).toBe(false);
    expect(chunks.find((chunk) => chunk.type === "data-related")?.data.suggestions).toContain("Show me your projects");
    expect(chunks.at(-1)?.type).toBe("finish");
  });

  it("does not emit pending questions or a finish event after cancellation", async () => {
    mockStream([{ type: "start" }, { type: "finish" }]);
    const controller = new AbortController();
    vi.mocked(generateObject).mockImplementation(() => {
      controller.abort();
      return new Promise(() => {});
    });
    const input = { ...params(), abortSignal: controller.signal };
    await runChatStream(input);
    expect(input.writer.write.mock.calls.map(([chunk]) => chunk.type)).toEqual(["start"]);
  });
});
