type ScrollSurface = Pick<HTMLElement, "scrollTop" | "scrollHeight" | "clientHeight">;

type RunningMotion = {
  cancel: () => void;
  finished: Promise<unknown>;
};

type TurnMotion = {
  /** Current visual displacement, measured before cancelling the animation. */
  readOffset: () => number;
  start: (distance: number) => RunningMotion;
};

/** Owns scroll placement and its interruptible visual bridge, independent of React. */
export function createTurnTransition(
  surface: ScrollSurface,
  motion: TurnMotion,
  onSettled: () => void
) {
  let running: RunningMotion | null = null;

  const cancel = (preservePosition = false) => {
    if (!running) return false;
    const offset = preservePosition ? motion.readOffset() : 0;
    const previous = running;
    running = null;
    previous.cancel();
    // Rebase actual scrolling to the position the visitor currently sees.
    if (offset) surface.scrollTop -= offset;
    return true;
  };

  const move = (targetTop: number, animate: boolean) => {
    cancel(true);
    const previousTop = surface.scrollTop;
    const maximumTop = Math.max(0, surface.scrollHeight - surface.clientHeight);
    surface.scrollTop = Math.max(0, Math.min(maximumTop, targetTop));
    const distance = surface.scrollTop - previousTop;
    if (!animate || Math.abs(distance) <= 1) return false;

    const next = motion.start(distance);
    running = next;
    const settled = () => {
      if (running !== next) return;
      running = null;
      onSettled();
    };
    // Cancellation rejects WAAPI's finished promise; it is an expected outcome.
    void next.finished.then(settled, settled);
    return true;
  };

  return { move, cancel };
}
