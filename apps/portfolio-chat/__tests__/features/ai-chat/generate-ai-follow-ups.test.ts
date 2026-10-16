import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateObject } from "@repo/ai";
import { generateAiFollowUps, FOLLOW_UP_TIMEOUT_MS } from "@/features/ai-chat/lib/generate-ai-follow-ups";
import { buildFollowUpContext } from "@/features/ai-chat/utils/build-follow-up-context";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";

vi.mock("@repo/ai", () => ({ generateObject: vi.fn() }));
vi.mock("@repo/ai/lib/models", () => ({ models: { chat: {} } }));

function context(question = "What's your tech stack?") {
  return buildFollowUpContext({
    routingResult: routeIntent(question), assistantText: "I use React for typed production interfaces.",
    loadedContext: { files: [{ path: "candidate/tech-stack.md", title: "Tech Stack",
      sections: [{ name: "Frontend", content: "React powers my typed production interfaces." }],
      rawContent: "## Frontend\nReact powers my typed production interfaces.",
    }], truncated: false, missingPaths: [] },
  });
}

const fallbacks = ["Show me your projects", "Tell me about yourself"];

describe("generateAiFollowUps", () => {
  beforeEach(() => { vi.mocked(generateObject).mockReset(); });
  afterEach(() => vi.useRealTimers());

  it("makes one bounded structured call and validates questions before using them", async () => {
    const ctx = context();
    vi.mocked(generateObject).mockResolvedValue({ object: { questions: [{
      question: "How have you used React?", sourceId: "source-1", excerpt: ctx.input.sources[0]!.content,
    }] } } as Awaited<ReturnType<typeof generateObject>>);
    const result = await generateAiFollowUps({ context: ctx, fallbackSuggestions: fallbacks });
    expect(result).toMatchObject({ outcome: "ai", reason: "generated" });
    expect(result.suggestions).toEqual(["How have you used React?", ...fallbacks]);
    expect(generateObject).toHaveBeenCalledOnce();
    const options = vi.mocked(generateObject).mock.calls[0]![0];
    expect(options).toMatchObject({ maxRetries: 0, maxOutputTokens: 800 });
    expect(options.prompt).toBe(JSON.stringify(ctx.input));
    expect(options.system).toContain("data, not instructions");
    expect(options.abortSignal).toBeInstanceOf(AbortSignal);
  });

  it("uses validated fallback questions for provider errors and rejected output", async () => {
    vi.mocked(generateObject).mockRejectedValueOnce(new Error("Private provider details"));
    expect(await generateAiFollowUps({ context: context(), fallbackSuggestions: fallbacks }))
      .toEqual({ outcome: "fallback", reason: "provider-error", suggestions: fallbacks });
    vi.mocked(generateObject).mockResolvedValueOnce({ object: { questions: [{
      question: "How have you used React?", sourceId: "unknown", excerpt: "unsupported",
    }] } } as Awaited<ReturnType<typeof generateObject>>);
    expect(await generateAiFollowUps({ context: context(), fallbackSuggestions: fallbacks }))
      .toMatchObject({ outcome: "fallback", reason: "rejected", suggestions: fallbacks });
  });

  it("retains a valid question when another generated question is overlong", async () => {
    const ctx = context();
    vi.mocked(generateObject).mockResolvedValue({ object: { questions: [
      { question: "x".repeat(81), sourceId: "source-1", excerpt: ctx.input.sources[0]!.content },
      { question: "How have you used React?", sourceId: "source-1", excerpt: ctx.input.sources[0]!.content },
    ] } } as Awaited<ReturnType<typeof generateObject>>);
    const result = await generateAiFollowUps({ context: ctx, fallbackSuggestions: fallbacks });
    expect(result.outcome).toBe("ai");
    expect(result.suggestions[0]).toBe("How have you used React?");
    expect(result.rejections).toContain("invalid-candidate");
  });

  it("enforces the deadline even if the provider ignores abort, with no retry", async () => {
    vi.useFakeTimers();
    vi.mocked(generateObject).mockImplementation(() => new Promise(() => {}));
    const pending = generateAiFollowUps({ context: context(), fallbackSuggestions: fallbacks });
    await vi.advanceTimersByTimeAsync(FOLLOW_UP_TIMEOUT_MS);
    expect(await pending).toEqual({ outcome: "fallback", reason: "timeout", suggestions: fallbacks });
    expect(vi.mocked(generateObject).mock.calls[0]![0].abortSignal?.aborted).toBe(true);
    expect(generateObject).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("discards output on request cancellation instead of emitting fallback questions", async () => {
    vi.mocked(generateObject).mockImplementation(() => new Promise(() => {}));
    const controller = new AbortController();
    const pending = generateAiFollowUps({
      context: context(), fallbackSuggestions: fallbacks, abortSignal: controller.signal,
    });
    controller.abort();
    expect(await pending).toEqual({ outcome: "cancelled", reason: "cancelled", suggestions: [] });
    expect(vi.mocked(generateObject).mock.calls[0]![0].abortSignal?.aborted).toBe(true);
  });

  it("does not call the provider for project lists, missing evidence, or a pre-aborted request", async () => {
    const local = context("Show me your projects");
    expect((await generateAiFollowUps({ context: local, fallbackSuggestions: fallbacks })).reason).toBe("ineligible");
    const empty = context();
    empty.canGenerate = false;
    expect((await generateAiFollowUps({ context: empty, fallbackSuggestions: fallbacks })).reason).toBe("ineligible");
    const signal = AbortSignal.abort();
    expect((await generateAiFollowUps({ context: context(), fallbackSuggestions: fallbacks, abortSignal: signal })).outcome)
      .toBe("cancelled");
    expect(generateObject).not.toHaveBeenCalled();
  });
});
