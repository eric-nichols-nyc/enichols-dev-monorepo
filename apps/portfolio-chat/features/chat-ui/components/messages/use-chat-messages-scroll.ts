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
import {
  ACTIVE_TURN_MIN_HEIGHT_OFFSET_PX,
  CHAT_MESSAGES_CONTAINER_SELECTOR,
  NEAR_BOTTOM_THRESHOLD,
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
  isAtBottom: boolean;
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
  status,
  activeTurnRef: activeTurnRefProp,
}: UseChatMessagesScrollArgs): UseChatMessagesScrollResult {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
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

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom <= NEAR_BOTTOM_THRESHOLD);
  }, []);

  const scrollLatestTurnIntoView = useCallback(() => {
    const activeTurnEl = activeTurnRef.current;
    if (activeTurnEl) {
      requestAnimationFrame(() => {
        activeTurnEl.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      });
      return;
    }
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [activeTurnRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  useEffect(() => {
    if (status === "submitted") {
      scrollLatestTurnIntoView();
    }
  }, [status, scrollLatestTurnIntoView]);

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
    isAtBottom,
    scrollLatestTurnIntoView,
    messageTurns,
    getTurnWrapperProps,
  };
}
