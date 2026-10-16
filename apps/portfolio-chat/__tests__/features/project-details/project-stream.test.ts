import { beforeEach, describe, expect, it, vi } from "vitest";
import { streamText } from "@repo/ai";
import projects from "@/data/projects";
import { runChatStream } from "@/features/ai-chat/api/run-chat-stream";
import { projectRouting, withProjectFacts } from "@/features/project-details/lib/project-context";
import { getProjectQuestions } from "@/features/project-details/lib/project-questions";

vi.mock("@repo/ai", () => ({ streamText: vi.fn(), stepCountIs: vi.fn(), generateObject: vi.fn() }));
vi.mock("@repo/ai/lib/models", () => ({ models: { chat: {} } }));
vi.mock("@/lib/ai/tools/about", () => ({ aboutRelated: [] }));
vi.mock("@/lib/ai/tools/portfolio-tools", () => ({ portfolioChatTools: {} }));

const project = projects[0]!;
const question = getProjectQuestions(project)[0]!;
beforeEach(() => vi.clearAllMocks());

describe("grounded project answer stream", () => {
  it("uses only the selected project's evidence, no tools, and project-specific follow-ups", async () => {
    vi.mocked(streamText).mockReturnValue({
      toUIMessageStream: () => (async function* () {
        yield { type: "start" };
        yield { type: "text-start", id: "a" };
        yield { type: "text-delta", id: "a", delta: "A grounded answer." };
        yield { type: "text-end", id: "a" };
        yield { type: "finish" };
      })(),
    } as unknown as ReturnType<typeof streamText>);
    const write = vi.fn();
    await runChatStream({
      writer: { write }, project,
      modelMessages: [{ role: "user", content: question }],
      routing: projectRouting(project, question),
      knowledgeContext: withProjectFacts({ files: [], missingPaths: [], truncated: false }, project),
      userText: question, useLegacyAboutStream: false, dynamicSuggestionsEnabled: true,
      messages: [{ role: "user", parts: [{ type: "text", text: question }] }],
    });
    const options = vi.mocked(streamText).mock.calls[0]![0];
    expect(options.tools).toBeUndefined();
    expect(options.system).toContain("Current project view");
    expect(options.system).toContain(project.title);
    expect(options.system).toContain(project.description);
    expect(options.system).not.toContain(projects[1]!.description);
    const chunks = write.mock.calls.map(([part]) => part);
    expect(chunks.at(-1).type).toBe("finish");
    const related = chunks.find((part) => part.type === "data-related");
    expect(related.data.suggestions).not.toContain(question);
    expect(related.data.suggestions.every((value: string) => value.includes(project.title))).toBe(true);
    expect(chunks.findIndex((part) => part.type === "text-delta")).toBeLessThan(chunks.findIndex((part) => part.type === "data-related"));
  });

  it("makes no provider request or writes after cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    const write = vi.fn();
    await runChatStream({
      writer: { write }, project, modelMessages: [], routing: projectRouting(project, "What next?"),
      knowledgeContext: { files: [], missingPaths: [], truncated: false }, userText: "What next?",
      useLegacyAboutStream: false, abortSignal: controller.signal,
    });
    expect(streamText).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});
