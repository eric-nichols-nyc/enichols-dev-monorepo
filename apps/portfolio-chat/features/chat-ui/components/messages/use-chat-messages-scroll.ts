"use client";

import type { UIMessage } from "ai";
import type { CSSProperties, MutableRefObject, RefObject } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createTurnTransition } from "@/features/chat-ui/lib/turn-transition";
import {
  ACTIVE_TURN_MIN_HEIGHT_OFFSET_PX,
  CHAT_MESSAGES_CONTAINER_SELECTOR,
  NEAR_BOTTOM_THRESHOLD,
  TURN_TOP_INSET_PX,
  TURN_TRANSITION_DURATION_MS,
  TURN_TRANSITION_EASING,
} from "./constants";

export type MessageWithIndex = { globalIndex: number; msg: UIMessage };

/** One "turn" = a user message plus every following message until the next user. */
export function groupMessagesByUserTurn(
  messages: UIMessage[]
): MessageWithIndex[][] {
  const groups: MessageWithIndex[][] = [];
  let current: MessageWithIndex[] = [];

  messages.forEach((msg, globalIndex) => {
    const entry = { globalIndex, msg };
    if (msg.role === "user" && current.length > 0) {
      groups.push(current);
      current = [entry];
    } else {
      current.push(entry);
    }
  });
  if (current.length > 0) {
    groups.push(current);
  }
  return groups;
}

export function getTurnKey(
  turn: MessageWithIndex[],
  turnIndex: number
): string {
  return turn[0]?.msg.id ?? `turn-${turnIndex}`;
}

function getActiveTurnMinHeightStyle(
  isActiveTurn: boolean,
  containerHeightPx: number | null
): CSSProperties | undefined {
  if (!isActiveTurn) {
    return;
  }
  if (containerHeightPx === null) {
    return;
  }
  const minHeight = Math.max(
    0,
    containerHeightPx + ACTIVE_TURN_MIN_HEIGHT_OFFSET_PX
  );
  return { minHeight };
}

export type ChatMessagesScrollStatus =
  | "streaming"
  | "submitted"
  | "ready"
  | "error";

export type UseChatMessagesScrollArgs = {
  messages: UIMessage[];
  status: ChatMessagesScrollStatus;
  /** Latest turn wrapper element. If omitted, the hook keeps an internal ref. */
  activeTurnRef?: MutableRefObject<HTMLDivElement | null>;
};

export type UseChatMessagesScrollResult = {
  scrollRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  isTransitioning: boolean;
  scrollLatestTurnIntoView: () => void;
  messageTurns: MessageWithIndex[][];
  /** Pass spread onto each turn wrapper `div`. */
  getTurnWrapperProps: (
    turnIndex: number,
    turnCount: number
  ) => {
    ref: (el: HTMLDivElement | null) => void;
    style: CSSProperties | undefined;
  };
};

export function useChatMessagesScroll({
  messages,
  activeTurnRef: activeTurnRefProp,
}: UseChatMessagesScrollArgs): UseChatMessagesScrollResult {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<ReturnType<typeof createTurnTransition> | null>(null);
  const pointerActionRef = useRef(false);
  const lastPlacedTurnRef = useRef<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTurnMinHeightPx, setActiveTurnMinHeightPx] = useState<
    number | null
  >(null);
  const internalActiveTurnRef = useRef<HTMLDivElement | null>(null);
  const activeTurnRef = activeTurnRefProp ?? internalActiveTurnRef;

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) {
      return;
    }
    const container = scrollEl.closest(CHAT_MESSAGES_CONTAINER_SELECTOR);
    if (!(container instanceof HTMLElement)) {
      return;
    }

    const sync = () => {
      setActiveTurnMinHeightPx(container.clientHeight);
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(container);
    return () => {
      ro.disconnect();
    };
  }, []);

  const messageTurns = useMemo(
    () => groupMessagesByUserTurn(messages),
    [messages]
  );
  const latestTurnKey = messageTurns.at(-1)?.[0]?.msg.id ?? null;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom <= NEAR_BOTTOM_THRESHOLD);
  }, []);

  const cancelTransition = useCallback((preservePosition = false) => {
    if (transitionRef.current?.cancel(preservePosition)) {
      setIsTransitioning(false);
      updateScrollState();
    }
  }, [updateScrollState]);

  useLayoutEffect(() => {
    const viewport = scrollRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const transition = createTurnTransition(viewport, {
      readOffset: () => {
        const transform = getComputedStyle(content).transform;
        return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
      },
      start: (distance) => content.animate(
        [{ transform: `translateY(${distance}px)` }, { transform: "translateY(0)" }],
        { duration: TURN_TRANSITION_DURATION_MS, easing: TURN_TRANSITION_EASING }
      ),
    }, () => {
      setIsTransitioning(false);
      updateScrollState();
    });
    transitionRef.current = transition;
    return () => {
      transition.cancel();
      transitionRef.current = null;
    };
  }, [updateScrollState]);

  const placeLatestTurn = useCallback((alignment: "start" | "end") => {
    const viewport = scrollRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    cancelTransition(true);
    const activeTurn = activeTurnRef.current;
    const maximumTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const targetTop = alignment === "start" && activeTurn
      ? viewport.scrollTop + activeTurn.getBoundingClientRect().top
        - viewport.getBoundingClientRect().top - TURN_TOP_INSET_PX
      : maximumTop;
    const moving = transitionRef.current?.move(
      targetTop,
      pointerActionRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    setIsTransitioning(moving ?? false);
    updateScrollState();
  }, [activeTurnRef, cancelTransition, updateScrollState]);

  const scrollLatestTurnIntoView = useCallback(() => {
    placeLatestTurn("end");
  }, [placeLatestTurn]);

  useEffect(() => {
    const viewport = scrollRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPointer = () => {
      cancelTransition(true);
      pointerActionRef.current = true;
    };
    const onKeyboard = () => {
      cancelTransition(true);
      pointerActionRef.current = false;
    };
    const onGesture = () => cancelTransition(true);
    const onMotionPreference = () => {
      if (reducedMotion.matches) cancelTransition();
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKeyboard, true);
    viewport?.addEventListener("wheel", onGesture, { passive: true });
    viewport?.addEventListener("touchstart", onGesture, { passive: true });
    reducedMotion.addEventListener("change", onMotionPreference);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKeyboard, true);
      viewport?.removeEventListener("wheel", onGesture);
      viewport?.removeEventListener("touchstart", onGesture);
      reducedMotion.removeEventListener("change", onMotionPreference);
      cancelTransition();
    };
  }, [cancelTransition]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  useLayoutEffect(() => {
    if (latestTurnKey === null) {
      lastPlacedTurnRef.current = null;
      cancelTransition();
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      updateScrollState();
      return;
    }
    if (latestTurnKey === lastPlacedTurnRef.current || activeTurnMinHeightPx === null) return;
    lastPlacedTurnRef.current = latestTurnKey;
    placeLatestTurn("start");
  }, [latestTurnKey, activeTurnMinHeightPx, cancelTransition, placeLatestTurn, updateScrollState]);

  const getTurnWrapperProps = useCallback(
    (turnIndex: number, turnCount: number) => {
      const isActiveTurn = turnIndex === turnCount - 1;
      return {
        ref: (el: HTMLDivElement | null) => {
          if (isActiveTurn) {
            activeTurnRef.current = el;
          } else if (activeTurnRef.current === el) {
            activeTurnRef.current = null;
          }
        },
        style: getActiveTurnMinHeightStyle(isActiveTurn, activeTurnMinHeightPx),
      };
    },
    [activeTurnRef, activeTurnMinHeightPx]
  );

  return {
    scrollRef,
    contentRef,
    isAtBottom,
    isTransitioning,
    scrollLatestTurnIntoView,
    messageTurns,
    getTurnWrapperProps,
  };
}
