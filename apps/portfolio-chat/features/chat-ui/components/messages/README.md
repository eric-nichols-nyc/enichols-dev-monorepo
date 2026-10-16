# Messages list and scrolling

Import `Messages` from `@/features/chat-ui/components/messages` or the legacy `@/components/messages` shim. The behavior is specified in [12-chat-welcome-transition](../../../../docs/feature-specs/12-chat-welcome-transition.md).

## DOM ownership

- The outer shell fills the area provided by `Chat` and positions the floating jump control.
- The viewport (`scrollRef`) is the sole scroll owner. `overscroll-contain` prevents scroll chaining and `overflow-anchor: none` prevents browser anchoring from competing with turn placement.
- The content column (`contentRef`) contains one persistent `WelcomeMessage`, followed by real message turns. This column receives the temporary turn transform; the welcome has no entrance animation.
- The error alert sits outside the scroll viewport so it remains visible above the composer.

The welcome contains the greeting and topic cards, displays immediately, stays mounted across sends, and never enters AI message history. There is no entrance animation or fade. Cards are disabled while busy and reusable when ready. Embedded artifact chat sets `showWelcome={false}`.

## New-turn placement

`useChatMessagesScroll` groups each user message and its following assistant messages into one turn. A new latest-turn key places that turn 16px below the viewport top once, after the active-turn height is measured. This also catches immediate local responses whose submitted status can be batched away. Streaming chunks do not trigger placement.

The hook adapts the DOM to `features/chat-ui/lib/turn-transition.ts`, which owns placement and cancellation independently of React:

1. Cancel prior motion and rebase scrolling to the currently visible position.
2. Assign the bounded target scroll position once.
3. After pointer input, bridge the visual displacement with a content `translateY` returning to zero over 240ms, using `cubic-bezier(0.23, 1, 0.32, 1)`.

Keyboard and reduced-motion actions use immediate placement. Wheel, touch, pointer, and keyboard input cancel motion at the visible position. A new turn retargets from that position; stale animation completion cannot override it. Reset cancels without restoring old scrolling and immediately sets `scrollTop` to zero. Unmount also cancels motion.

## Active-turn min-height

A `ResizeObserver` measures the parent `.chat-messages-container` from `Chat`. Only the latest turn receives `minHeight`, using the measured height plus `ACTIVE_TURN_MIN_HEIGHT_OFFSET_PX` (-30px). This reserves space for the new answer and makes start alignment possible even before a short answer arrives. Older turns return to their natural height.

## Near-bottom detection and jumping

The viewport scroll listener and `ResizeObserver` on both viewport and content update `isAtBottom` using `NEAR_BOTTOM_THRESHOLD`. Content growth can therefore expose the jump control without moving a visitor reading older content. The control appears only when real messages exist, the viewport is away from the bottom, and no transition is running. It explicitly places the viewport at the content end, using the same modality and motion rules.

The controller has seven unit cases covering continuity, immediate placement, bounds, reset, interruption in both directions, and rapid retargeting. Browser regression cases are in `e2e/welcome-transition.spec.ts`; they were added but left unrun at the user's request for code checks only.
