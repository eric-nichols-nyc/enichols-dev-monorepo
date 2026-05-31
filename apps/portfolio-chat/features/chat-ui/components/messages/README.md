# Messages list and scrolling

Implementation: **`index.tsx`** (`Messages` + helpers). Import from `@/features/chat-ui/components/messages` or legacy `@/components/messages` (re-export shim).

`Messages` renders the chat transcript inside the scroll region used by `Chat`. This note describes how scrolling, “near bottom” detection, and the active-turn min-height interact.

## DOM layout

- **Outer shell** (`relative flex h-full min-h-0 flex-1 flex-col`): fills the area given by `Chat` and is the positioning context for the floating control.
- **Scroll viewport** (`flex-1 overflow-y-auto`, `scrollRef`): the only element that scrolls. `overscroll-contain` keeps scroll chaining predictable on trackpads.
- **Inner column** (`max-w-[720px] …`): message list and error banner.

The parent in `chat.tsx` wraps this tree in a node with class **`chat-messages-container`**. That wrapper’s height is measured so the **last turn** can use a matching `min-height` (see below).

## “Near bottom” and the scroll-to-bottom button

- **`NEAR_BOTTOM_THRESHOLD`** (px): if the distance from the scroll viewport’s bottom is at most this value, we treat the user as “at bottom.”
- **`updateScrollState`**: reads `scrollHeight`, `scrollTop`, and `clientHeight`, then sets `isAtBottom` from the distance-from-bottom check.
- **Listeners**: `scroll` on the viewport (passive) plus a **`ResizeObserver`** on the same viewport so layout changes (new messages, wrapped text) recompute distance from bottom.
- **Floating button**: when `!isAtBottom`, a button calls **`scrollLatestTurnIntoView`** (same handler as the auto-scroll path).

## Auto-scroll when sending

When **`status === "submitted"`** (message accepted, waiting for / receiving the stream), we call **`scrollLatestTurnIntoView`**:

1. If **`activeTurnRef`** (prop or internal ref on the **last** turn wrapper) points to a node, we **`scrollIntoView`** on it with `behavior: "smooth"`, `block: "end"`, `inline: "nearest"` inside `requestAnimationFrame`.
2. Otherwise we fall back to **`scrollTo({ top: scrollHeight, behavior: "smooth" })`** on the scroll viewport.

So the scrollable ancestor is the messages viewport, not the window.

## Active-turn min-height

- On mount, a **`ResizeObserver`** watches **`.chat-messages-container`** (the parent from `chat.tsx`) and stores **`clientHeight`** in state (minus a fixed pixel offset in code).
- That value is applied as **`minHeight`** on the **last turn** wrapper only, so the active “beat” can reserve vertical space aligned with the chat column height.

If `Messages` is ever used without an ancestor matching `.chat-messages-container`, no min-height is applied (measurement never runs).

## Turns

Messages are grouped into **turns**: each **user** message starts a new group; following assistant (and tool) messages stay in that group until the next user message. The **last** group is the active turn (refs and min-height target).
