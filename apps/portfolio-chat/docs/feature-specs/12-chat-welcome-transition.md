# Feature spec — Welcome conversation transition

**Status:** Implemented; unit checks pass; browser review deferred by user

## Goal

Keep the current welcome layout as the first visual item in the chat. A new turn moves the conversation upward instead of replacing the welcome screen. Work starts from redesign checkpoint `51c9055` on `codex/chat-welcome-transition`.

## User story

As a visitor, I want choosing a topic to flow into a conversation, with the introduction and topic cards still available above my messages.

## Requirements

- [x] R1 — Keep one stable welcome at the start of the main chat, including the existing greeting and cards. It is UI only: do not insert a synthetic message into model history or tool context.
- [x] R2 — Each new user turn scrolls to its beginning once, including fast local project replies. Streaming chunks do not restart motion or pull someone away from older content.
- [x] R3 — Pointer-triggered turn changes use a 240ms WAAPI transform transition with `cubic-bezier(0.23, 1, 0.32, 1)`. Scroll position is assigned once; animate only the content transform. Keyboard actions and reduced motion use immediate placement.
- [x] R4 — Wheel, touch, pointer, keyboard, reset, and unmount interrupt motion safely. Preserve the visible position when the visitor takes over scrolling. A newer turn retargets from the currently visible position.
- [x] R5 — Welcome cards are disabled while submitting/streaming, then reusable after scrolling back up. Suggestion sends focus the composer without scrolling it.
- [x] R6 — Reset clears the conversation/draft and returns the viewport to the welcome immediately. Keep the chosen greeting stable across turns. Focused detail views do not duplicate the welcome or main chat (spec 13).
- [x] R7 — Preserve turn min-height, errors, follow-ups, artifacts, and a jump-to-latest control. Observe content growth so a long streamed answer exposes the jump control without forcing scrolling.
- [x] R8 — Display the entire welcome immediately, with no entrance animation, fade, delayed visibility, or starting transform. The user explicitly removed the entrance experiment after reporting it did not animate. This applies to all motion preferences.

## System boundaries

| In scope | Out of scope |
| --- | --- |
| `features/chat-ui/`, app browser checks and docs | Shared package source, API/model changes, V2, new dependencies |
| Existing chat scroll ownership | App-wide motion redesign, persistence |

## API

Existing `/api/chat` payloads and stream parts are unchanged. The welcome never enters `messages`.

## File structure

```text
features/chat-ui/
  components/welcome-message.tsx                 # Stable visual introduction
  components/chat.tsx                            # Main/embedded choice and composer focus
  components/messages/index.tsx                  # Welcome followed by user turns
  components/messages/use-chat-messages-scroll.ts # Scroll owner and interruption
  components/messages/constants.ts               # Scroll constants and motion timing
  lib/turn-transition.ts                         # Testable placement/cancellation controller
```

## Component responsibilities

| Component | Responsibility |
| --- | --- |
| WelcomeMessage | Render the greeting/cards immediately as one persistent visual item |
| Messages | Compose welcome and turns, preserve existing renderers |
| Scroll hook | Measure, place latest turns, animate and interrupt, reset viewport |
| Turn transition controller | Clamp placement, preserve visual position on cancellation, ignore stale completion |
| Chat | Reuse shared send/reset actions and focus the composer after suggestions |

## Routes (thin)

No route changes.

## Out of scope

- Creating a real assistant message for the greeting.
- Animating streaming words, card reordering, or unrelated artifact motion.

## Acceptance criteria

Implementation is complete. The interaction checks below remain unverified in a browser because the user requested code checks only.

- [ ] Welcome survives first and later sends with the same content and can be revisited.
- [ ] New turns align in the viewport for pointer, keyboard, phone, reduced motion, and immediate project output.
- [ ] Active motion can be interrupted; streamed output does not steal manual scroll position.
- [ ] Reset returns to the top with no stale messages or lingering transform.
- [x] Browser regression cases added and deferred status recorded alongside typecheck/build results.
- [x] Tracker, registry, and architecture/UI notes updated.

## Verification — 2026-10-16

- `pnpm test:run`: 24 files and 161 tests pass, including seven new controller cases for continuity, immediate placement, interruption in both directions, rapid retargeting, reset cancellation, and bounds.
- New `e2e/welcome-transition.spec.ts` covers welcome reuse/model history, later turns, composer focus, keyboard/reduced motion, and mobile reset. The existing follow-up reset check uses the persistent welcome marker. Browser cases were not run: after browser access was denied, the user selected “Finish with code checks only.”
- `pnpm typecheck` reports only the existing missing shared `radix-ui` dependency in the design-system Label. `pnpm build` fails on the same dependency. Shared source remains outside scope.
- Browser feel, manual scrolling during streaming, and the full visual acceptance criteria remain deferred; no visual verification is claimed.
- Entrance experiment removed at the user's explicit request: no welcome animation classes, tokens, or keyframes remain. The greeting and cards display immediately. Earlier timing/CSS checks did not verify the visual result; the user reported the animation was not working.

## UI review

| Before | After | Why |
| --- | --- | --- |
| Welcome disappears when the first message is sent | One stable visual welcome remains above real turns | Preserve the visitor's starting point and reusable topics |
| Submitted status starts native smooth scrolling | A new turn key places the viewport once with an interruptible transform bridge | Handle immediate replies and avoid repeated motion while streaming |
| Near-bottom detection observes the viewport only | It also observes content growth and hides the jump control during motion | Keep the control accurate as answers grow |
| Unsuccessful entrance animation experiment | Greeting and cards display immediately | Follow the user's request to remove the animation completely |

## Implementation prompt

1. Preserve the checkpoint's visual design and existing API/session behavior.
2. Keep the scroll viewport as the sole scroll owner; avoid window-level `scrollIntoView`.
3. Record code and interaction verification separately, including any checks the user explicitly defers.
