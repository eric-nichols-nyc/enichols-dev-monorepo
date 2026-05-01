export type AboutRenderMode = "text" | "component";

export type StreamChunkMeta = {
  type?: string;
  toolName?: string;
  toolCallId?: string;
};

export type AboutStreamModeState = {
  hasStreamedAboutText: boolean;
  suppressedAboutToolCallIds: Set<string>;
};

export function createAboutStreamModeState(): AboutStreamModeState {
  return {
    hasStreamedAboutText: false,
    suppressedAboutToolCallIds: new Set<string>(),
  };
}

export function getAboutStreamModeDecision({
  aboutRenderMode,
  chunk,
  state,
}: {
  aboutRenderMode: AboutRenderMode;
  chunk: StreamChunkMeta;
  state: AboutStreamModeState;
}): { suppressChunk: boolean; shouldStreamAboutText: boolean } {
  if (aboutRenderMode !== "text") {
    return { suppressChunk: false, shouldStreamAboutText: false };
  }

  if (chunk.toolName === "show_about") {
    if (typeof chunk.toolCallId === "string") {
      state.suppressedAboutToolCallIds.add(chunk.toolCallId);
    }

    if (!state.hasStreamedAboutText) {
      state.hasStreamedAboutText = true;
      return { suppressChunk: true, shouldStreamAboutText: true };
    }

    return { suppressChunk: true, shouldStreamAboutText: false };
  }

  if (
    typeof chunk.toolCallId === "string" &&
    state.suppressedAboutToolCallIds.has(chunk.toolCallId)
  ) {
    return { suppressChunk: true, shouldStreamAboutText: false };
  }

  return { suppressChunk: false, shouldStreamAboutText: false };
}
