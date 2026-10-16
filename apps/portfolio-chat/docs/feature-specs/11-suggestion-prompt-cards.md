# Feature spec — Suggestion prompt cards

**Status:** Implemented; local UI verified (existing shared dependency blocks build)

## Goal

Implement the approved [Paper prompt-card direction](https://app.paper.design/file/01M52RKM19SG0SH8KV5TRHS58Y) in the original app. Replace the four welcome pills with descriptive topic cards beneath the greeting.

## User story

As a visitor, I want to see what each suggested topic offers so I can start a useful conversation about Eric's work.

## Requirements

- [x] R1 — Four cards: Explore my work, Meet the person, My experience, Inside my toolkit. Each has a decorative icon, title, description, and arrow.
- [x] R2 — Preserve the existing preset messages and shared send handler. The project card continues to use local project-list output without a model call.
- [x] R3 — Place the cards after the greeting in the scrollable welcome, using the same content width. Remove welcome suggestions from the fixed composer area.
- [x] R4 — Use a two-column desktop grid and a single-column phone layout. Content grows rather than clipping; the composer remains reachable.
- [x] R5 — Use native button behavior, descriptive accessible names, visible keyboard focus, and disabled controls while submitting/streaming. No staggered entry animation; respect reduced motion for press/hover feedback.
- [x] R6 — Keep welcome cards above the conversation and reusable when ready, as defined by [12-chat-welcome-transition](./12-chat-welcome-transition.md), which supersedes the original hide-on-send behavior. Preserve artifact mode, contextual follow-ups, and typed input.
- [x] R7 — Translate Paper's 20px padding, 14px radius/gaps, 16px titles, 14px descriptions, and navy/blue surfaces into existing semantic theme utilities. Emphasize the project card.

## System boundaries

| In scope | Out of scope |
| --- | --- |
| `features/chat-ui/components/suggestions.tsx`, greeting width and empty-state placement | AI prompts, routes, data, shared packages, V2 |
| App documentation and existing project-navigation browser check | Other Paper alternatives, composer redesign |

## API

| Endpoint / tool | Method | Notes |
| --- | --- | --- |
| `/api/chat` | POST | Existing preset strings; no API change |

## Proposed file structure

```text
features/chat-ui/components/
  suggestions.tsx       # Feature-owned card composition using shared Button
  greeting.tsx          # Alignment with the welcome card grid
  messages/index.tsx    # Scrollable welcome composition
  chat.tsx              # Composer without duplicate welcome suggestions
```

## Component responsibilities

| Component | Responsibility |
| --- | --- |
| Suggestions | Present four cards and pass their original message to the supplied callback |
| Messages | Own the persistent greeting/cards welcome and busy status |
| Chat | Preserve shared submission, artifacts, and composer behavior |

## Routes (thin)

No route changes.

## Out of scope

- Replacing AI-generated follow-up controls or changing suggestion generation.
- Changing the shared Button implementation or adding dependencies.

## Acceptance criteria

- [x] All four cards send their original messages exactly once.
- [x] Keyboard activation, reset, project navigation/artifact behavior, and narrow-screen scrolling verified.
- [x] Desktop styling matches the exported Paper values using app theme tokens.
- [x] `pnpm typecheck` run; any existing shared dependency blocker recorded.
- [x] Tracker, registry, and UI patterns updated.

## Implementation prompt (for agents)

1. Read this spec and the chat UI/context specs.
2. Keep the existing preset send path and implement only the approved prompt-card direction.
3. Verify desktop/phone presentation and interactions, then update status and tracker.

## Verification — 2026-10-16

These checks describe the original card implementation. Spec 12 subsequently makes the welcome persistent; its verification record covers that change.

- Six existing Playwright checks pass: project suggestion/sidebar/typed entry, artifact expansion, mobile navigation, and HTTP/stream failure handling.
- Manual browser checks confirm all four original messages are submitted once by keyboard activation, welcome cards hide after sending and return on clear, and keyboard focus is visible.
- Desktop and 390px/320px layouts reviewed. The welcome content scrolls to the final card without horizontal overflow; the composer remains visible. No browser console errors.
- `pnpm typecheck` and `pnpm build` remain blocked by the existing missing `radix-ui` dependency in the shared Label used by the admin form. No new TypeScript errors. Shared source was not changed.

## UI review

| Before | After | Why |
| --- | --- | --- |
| Four centered pills above the composer | Icon, title, description, and arrow cards beneath the greeting | Give visitors a reason to choose each topic |
| Staggered entrance and narrow suggestion width | Immediate controls aligned with greeting; responsive stacking | Keep the invitation readable and available |
| Empty-state overflow could show jump-to-latest | Jump control appears only with conversation messages | Keep phone welcome scrolling free of an unrelated overlay |
