import { describe, expect, it, vi } from "vitest";
import { createTurnTransition } from "@/features/chat-ui/lib/turn-transition";

function fixture() {
  const surface = { scrollTop: 0, scrollHeight: 2400, clientHeight: 800 };
  let offset = 0;
  const frames: {
    distance: number;
    cancel: ReturnType<typeof vi.fn>;
    finish: () => void;
  }[] = [];
  const settled = vi.fn();
  const transition = createTurnTransition(surface, {
    readOffset: () => offset,
    start: (distance) => {
      offset = distance;
      let complete!: () => void;
      let reject!: (reason: Error) => void;
      const finished = new Promise<void>((resolve, fail) => {
        complete = resolve;
        reject = fail;
      });
      const cancel = vi.fn(() => { offset = 0; reject(new Error("Cancelled")); });
      frames.push({ distance, cancel, finish: () => { offset = 0; complete(); } });
      return { cancel, finished };
    },
  }, settled);
  return {
    surface, frames, settled, transition,
    setOffset: (value: number) => { offset = value; },
    visibleTop: () => surface.scrollTop - offset,
  };
}

describe("conversation turn transition", () => {
  it("bridges new scroll placement without teleporting the visible content", async () => {
    const f = fixture();
    f.transition.move(600, true);
    expect(f.surface.scrollTop).toBe(600);
    expect(f.visibleTop()).toBe(0);
    f.frames[0]!.finish();
    await Promise.resolve();
    expect(f.visibleTop()).toBe(600);
    expect(f.settled).toHaveBeenCalledOnce();
  });

  it("places keyboard/reduced-motion turns immediately without starting motion", () => {
    const f = fixture();
    f.transition.move(600, false);
    expect(f.visibleTop()).toBe(600);
    expect(f.frames).toHaveLength(0);
  });

  it("preserves the visible position when scrolling is interrupted", async () => {
    const f = fixture();
    f.transition.move(600, true);
    f.setOffset(230);
    const before = f.visibleTop();
    f.transition.cancel(true);
    await Promise.resolve();
    expect(f.visibleTop()).toBe(before);
    expect(f.surface.scrollTop).toBe(370);
    expect(f.frames[0]!.cancel).toHaveBeenCalledOnce();
    expect(f.settled).not.toHaveBeenCalled();
  });

  it("retargets a rapid new turn from the current visual position", async () => {
    const f = fixture();
    f.transition.move(600, true);
    f.setOffset(200);
    f.transition.move(1200, true);
    expect(f.visibleTop()).toBe(400);
    expect(f.frames[1]!.distance).toBe(800);
    await Promise.resolve();
    expect(f.settled).not.toHaveBeenCalled();
    f.frames[1]!.finish();
    await Promise.resolve();
    expect(f.visibleTop()).toBe(1200);
    expect(f.settled).toHaveBeenCalledOnce();
  });

  it("resets to the welcome without letting cancelled motion restore old scrolling", async () => {
    const f = fixture();
    f.transition.move(600, true);
    f.transition.cancel();
    f.surface.scrollTop = 0;
    await Promise.resolve();
    expect(f.visibleTop()).toBe(0);
    expect(f.settled).not.toHaveBeenCalled();
  });

  it("clamps navigation to real viewport bounds and skips imperceptible movement", () => {
    const f = fixture();
    f.transition.move(9999, false);
    expect(f.surface.scrollTop).toBe(1600);
    f.transition.move(-50, false);
    expect(f.surface.scrollTop).toBe(0);
    f.transition.move(1, true);
    expect(f.frames).toHaveLength(0);
    f.surface.scrollHeight = 400;
    f.transition.move(100, false);
    expect(f.surface.scrollTop).toBe(0);
  });

  it("preserves the visible position during upward as well as downward movement", () => {
    const f = fixture();
    f.surface.scrollTop = 1200;
    f.transition.move(400, true);
    f.setOffset(-300);
    const before = f.visibleTop();
    f.transition.cancel(true);
    expect(f.surface.scrollTop).toBe(before);
  });
});
