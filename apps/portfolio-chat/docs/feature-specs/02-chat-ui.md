# Feature spec — Chat UI

**Status:** Shipped

## Goal

Present the chat column: empty greeting, turn-grouped messages, streaming loaders, per-part rendering (text, tools, related suggestions), scroll UX, and input—all driven by `usePortfolioChat`.

## User story

As a visitor, I want streamed replies and portfolio sections embedded in the thread, with clear loading states and follow-up suggestions, without layout jumpiness while the assistant responds.

## Requirements

### Data & send path

- [x] **R1** — `PortfolioChatProvider` (`contexts/chat-context.tsx`) exposes `messages`, `sendMessage`, `clearMessages`, `status`, `error`
- [x] **R2** — Transport: `DefaultChatTransport({ api: "/api/chat" })`
- [x] **R3** — `Chat` composes `Messages`, `Suggestions`, `PromptInput`, artifact state (see 05-artifacts)

### Message list (`components/messages/`)

- [x] **R4** — Empty state: `ConversationEmptyState` + `Greeting`
- [x] **R5** — Messages grouped into **turns** (user message + following assistant messages until next user) via `groupMessagesByUserTurn`
- [x] **R6** — Active turn min-height from scroll container (`use-chat-messages-scroll`, `ACTIVE_TURN_MIN_HEIGHT_OFFSET_PX`) so streaming content appears below a stable viewport
- [x] **R7** — Thinking header on active assistant turn: shimmer while waiting, **Thought** pinned at top once content starts (not inline per tool)
- [x] **R8** — Scroll-to-bottom affordance when not near bottom (`NEAR_BOTTOM_THRESHOLD`)
- [x] **R9** — Display `error.message` when present (destructive banner)

### Part rendering (`components/message.tsx`)

| Part type | States | UI |
|-----------|--------|-----|
| `text` | — | `MessageResponse` |
| `data-related` | — | `Related` suggestions from `data.suggestions` |
| `tool-show_projects` / `tool-showProjects` | input-* | (loader at top of message only) |
| | output-available | `<Projects />` |
| | output-error | Error text |
| `tool-show_experience` / `tool-showExperience` | input-* | (loader at top of message only) |
| | output-available | `<Experience />` + optional `copy` + `Related` |
| `tool-show_about` / `tool-showAbout` | input-* | (loader at top of message only) |
| | output-available | `<About />` (+ preliminary hint if `preliminary`) |
| | output-error | Error text |
| `tool-show_tech_stack` / `tool-showTechStack` | input-* | (loader at top of message only) |
| | output-available | `<TechStack />` — scrollable card (400px) with per-category tables |

- [x] **R10** — Support **both** snake_case and camelCase tool part type strings (SDK/version tolerance)
- [x] **R11** — After text exists in message, show `related` from projects/tech tool output at message bottom via `getRelatedForMessage` (experience/about related render inline in part handler)
- [x] **R12** — `onExperienceExpand` passed through for artifact panel integration
- [x] **R13** — `onSuggestionClick` sends preset user messages (sidebar + inline `Related`)

### About UX (pairs with 06-ai-chat R9)

- [x] **R14** — When server uses about **text mode**, streamed about prose appears as `text` parts; e2e expects **no** visible "About" title from `<About />` card for typical "Tell me about yourself" flow
- [x] **R15** — If `tool-show_about` `output-available` does render, show `About` + optional `preliminary` "Streaming about..." label

### Suggestions & input

- [x] **R16** — `Suggestions` pills trigger `sendMessage` with preset strings
- [x] **R17** — `PromptInput` from design-system ai-elements; local text state in `Chat`

### Not yet implemented

- [ ] **R18** — Full WCAG audit (focus order, live regions for stream)
- [x] **R19** — Migrated to `features/chat-ui/` (legacy re-exports under `components/`) (components + `use-chat-messages-scroll`)

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `features/chat-ui/components/*` | Route handler, tool execute, system prompt |
| Legacy shims: `components/chat`, `messages`, `message`, … | `@repo/design-system` source changes |

## Component map

```
Chat
├── Messages (scroll, turns, ChatMessage)
├── Suggestions
├── PromptInput
└── Artifact slot (05-artifacts)

ChatMessage
└── MessagePartRenderer (per part)
```

## Invariants

- Any new server tool **must** add matching branches in `MessagePartRenderer` (both naming conventions if applicable).
- Tool loading UI is always `ThinkingMessage` for `input-available` / `input-streaming`.
- User messages align right; assistant left (`Message` from design-system).

## Acceptance criteria

- [x] Text and all four tool types render without hydration errors
- [x] Turn min-height behavior preserved during streaming (see reference message-layout)
- [x] Related suggestions clickable and send new messages
- [ ] R18–R19 when scheduled in tracker

## Implementation prompt

1. Read 06-ai-chat when changing part types or stream chunks.
2. Do not add tool UI only on client—server must emit the part type.
3. After part-type changes, run `pnpm typecheck` and `pnpm test:e2e` if about/projects/tech flows touched.

## Reference (not requirements)

- [chat-rendering.md](../chat-rendering.md)
- [message-layout.md](../message-layout.md)
