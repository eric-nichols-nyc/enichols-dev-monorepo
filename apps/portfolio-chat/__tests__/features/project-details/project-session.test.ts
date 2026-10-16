import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  stop: vi.fn(), sendMessage: vi.fn(), setMessages: vi.fn(), clearError: vi.fn(),
  setDraft: vi.fn(), cleanups: [] as (() => void)[],
}));
vi.mock("react", () => ({
  useState: () => ["", state.setDraft],
  useRef: (value: unknown) => ({ current: value }),
  useMemo: (factory: () => unknown) => factory(),
  useEffect: (setup: () => () => void) => { state.cleanups.push(setup()); },
}));
vi.mock("@repo/ai", () => ({ DefaultChatTransport: class { constructor(readonly options: unknown) {} } }));
vi.mock("@ai-sdk/react", () => ({ useChat: () => ({
  messages: [], status: "ready", error: undefined, stop: state.stop,
  sendMessage: state.sendMessage, setMessages: state.setMessages, clearError: state.clearError,
}) }));

import { useProjectQuestions } from "@/features/project-details/hooks/use-project-questions";

beforeEach(() => {
  vi.clearAllMocks();
  state.cleanups.length = 0;
  state.stop.mockResolvedValue(undefined);
  state.sendMessage.mockResolvedValue(undefined);
});

describe("independent project session actions", () => {
  it("sends only one request for rapid repeated activation", async () => {
    let finish!: () => void;
    state.sendMessage.mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
    const chat = useProjectQuestions("trellnode");
    const sending = chat.send("  How was it built?  ");
    await Promise.resolve();
    await chat.send("A rapid second question");
    expect(state.sendMessage).toHaveBeenCalledOnce();
    expect(state.sendMessage).toHaveBeenCalledWith({ text: "How was it built?" });
    finish();
    await sending;
  });

  it("clear cancels a send waiting for an earlier stop and resets the local transcript", async () => {
    let stopped!: () => void;
    state.stop.mockReturnValueOnce(new Promise<void>((resolve) => { stopped = resolve; }));
    const chat = useProjectQuestions("trellnode");
    const sending = chat.send("A queued question");
    await chat.clear();
    stopped();
    await sending;
    expect(state.sendMessage).not.toHaveBeenCalled();
    expect(state.setMessages).toHaveBeenCalledWith([]);
    expect(state.clearError).toHaveBeenCalled();
  });

  it("closing/unmounting aborts and invalidates a queued request", async () => {
    let stopped!: () => void;
    state.stop.mockReturnValueOnce(new Promise<void>((resolve) => { stopped = resolve; }));
    const chat = useProjectQuestions("trellnode");
    const sending = chat.send("A queued question");
    state.cleanups[0]!();
    stopped();
    await sending;
    expect(state.stop).toHaveBeenCalledTimes(2);
    expect(state.sendMessage).not.toHaveBeenCalled();
  });
});
