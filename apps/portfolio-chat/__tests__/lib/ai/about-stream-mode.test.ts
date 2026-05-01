import { describe, expect, it } from "vitest";
import {
  createAboutStreamModeState,
  getAboutStreamModeDecision,
} from "@/lib/ai/about-stream-mode";

describe("getAboutStreamModeDecision", () => {
  it("streams once and suppresses entire show_about tool-call lifecycle", () => {
    const state = createAboutStreamModeState();
    const toolCallId = "call_123";

    const startDecision = getAboutStreamModeDecision({
      aboutRenderMode: "text",
      chunk: { toolName: "show_about", toolCallId, type: "tool-input-start" },
      state,
    });

    expect(startDecision.shouldStreamAboutText).toBe(true);
    expect(startDecision.suppressChunk).toBe(true);

    const deltaDecision = getAboutStreamModeDecision({
      aboutRenderMode: "text",
      chunk: { toolCallId, type: "tool-input-delta" },
      state,
    });

    expect(deltaDecision.shouldStreamAboutText).toBe(false);
    expect(deltaDecision.suppressChunk).toBe(true);

    const outputDecision = getAboutStreamModeDecision({
      aboutRenderMode: "text",
      chunk: { toolCallId, type: "tool-output-available" },
      state,
    });

    expect(outputDecision.shouldStreamAboutText).toBe(false);
    expect(outputDecision.suppressChunk).toBe(true);

    const unrelatedDecision = getAboutStreamModeDecision({
      aboutRenderMode: "text",
      chunk: { toolName: "show_projects", toolCallId: "call_other" },
      state,
    });

    expect(unrelatedDecision.shouldStreamAboutText).toBe(false);
    expect(unrelatedDecision.suppressChunk).toBe(false);
  });

  it("does not suppress about chunks in component mode", () => {
    const state = createAboutStreamModeState();
    const decision = getAboutStreamModeDecision({
      aboutRenderMode: "component",
      chunk: { toolName: "show_about", toolCallId: "call_456" },
      state,
    });

    expect(decision.shouldStreamAboutText).toBe(false);
    expect(decision.suppressChunk).toBe(false);
  });
});
