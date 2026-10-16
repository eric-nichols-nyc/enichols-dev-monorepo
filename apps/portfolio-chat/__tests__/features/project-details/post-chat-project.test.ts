import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import projects from "@/data/projects";

const mocks = vi.hoisted(() => ({ create: vi.fn(), run: vi.fn(), load: vi.fn() }));
vi.mock("@repo/ai", () => ({
  createUIMessageStream: mocks.create,
  createUIMessageStreamResponse: () => new Response("stream"),
}));
vi.mock("@/features/ai-chat/api/run-chat-stream", () => ({ runChatStream: mocks.run }));
vi.mock("@/features/ai-chat/utils/load-knowledge-context", () => ({ loadKnowledgeContext: mocks.load }));

const project = projects[0]!;
const messages = [{ id: "question", role: "user", parts: [{ type: "text", text: "What's its stack?" }] }];
beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.stubEnv("CHAT_MOCK_STREAM", "false");
  vi.stubEnv("KNOWLEDGE_ASSISTANT_ENABLED", "true");
  mocks.load.mockResolvedValue({ files: [], missingPaths: [], truncated: false });
});
afterEach(() => vi.unstubAllEnvs());

async function post(body: unknown, signal?: AbortSignal) {
  const { POST } = await import("@/features/ai-chat/api/post-chat");
  const request = new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify(body), signal });
  const response = await POST(request);
  return { request, response };
}

describe("project-mode chat API", () => {
  it("passes selected-project grounding and cancellation to the existing stream", async () => {
    const controller = new AbortController();
    const { request, response } = await post({ messages, projectId: project.id }, controller.signal);
    expect(response.status).toBe(200);
    await mocks.create.mock.calls[0]![0].execute({ writer: { write: vi.fn() } });
    const params = mocks.run.mock.calls[0]![0];
    expect(params.project.id).toBe(project.id);
    expect(params.routing.entities.projectSlug).toBe(project.id);
    expect(params.routing.responseType).toBe("context_aware_ai");
    expect(params.modelMessages).toEqual([{ role: "user", content: "What's its stack?" }]);
    expect(params.knowledgeContext.files[0].rawContent).toContain(project.description);
    expect(params.abortSignal).toBe(request.signal);
    controller.abort();
    expect(params.abortSignal.aborted).toBe(true);
  });

  it.each(["unknown", "audiograph", "../private", 123, null])("rejects unavailable project ID %s without loading or calling AI", async (projectId) => {
    const { response } = await post({ messages, projectId });
    expect(response.status).toBe(404);
    expect(mocks.load).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects client system messages in project mode", async () => {
    const { response } = await post({ projectId: project.id, messages: [{ ...messages[0], role: "system" }] });
    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("keeps project questions grounded even when the legacy assistant flag is off", async () => {
    vi.stubEnv("KNOWLEDGE_ASSISTANT_ENABLED", "false");
    vi.stubEnv("AI_FOLLOW_UP_QUESTIONS_ENABLED", "true");
    await post({ projectId: project.id, messages });
    await mocks.create.mock.calls[0]![0].execute({ writer: { write: vi.fn() } });
    expect(mocks.run.mock.calls[0]![0]).toMatchObject({ useLegacyAboutStream: false, dynamicSuggestionsEnabled: true, aiFollowUpsEnabled: false, project });
  });

  it("preserves ordinary main-chat project-list routing", async () => {
    await post({ messages: [{ ...messages[0], parts: [{ type: "text", text: "Show projects" }] }] });
    await mocks.create.mock.calls[0]![0].execute({ writer: { write: vi.fn() } });
    const params = mocks.run.mock.calls[0]![0];
    expect(params.project).toBeUndefined();
    expect(params.routing.intent).toBe("show_projects");
  });
});
