# Feature spec — Chat context

**Status:** Shipped

## Goal

One shared main conversation for navigation, suggestions, and input, backed by AI SDK `useChat`. Focused project questions intentionally use a separate ephemeral session; see [13-project-detail-overlay](./13-project-detail-overlay.md).

## User story

As a visitor, I want navigation and main chat to share a conversation, while project questions stay inside their detail view.

## Requirements

### Provider

- [x] **R1** — `PortfolioChatProvider` in `contexts/chat-context.tsx` wraps the app in `app/page.tsx`
- [x] **R2** — Client-only (`"use client"`) — required for `useChat`
- [x] **R3** — `useChat` config: `transport: new DefaultChatTransport({ api: "/api/chat" })`

### Context API

| Member | Type | Behavior |
|--------|------|----------|
| `messages` | `UIMessage[]` | From `useChat` |
| `sendMessage` | `(message: { text: string; files?: unknown[] }) => void` | Wraps SDK `sendMessage`; normalizes `files` to `[]` |
| `clearMessages` | `() => void` | Stop the active request and clear messages/error immediately; re-clear after stopping if no newer action superseded the reset |
| `status` | `"streaming" \| "submitted" \| "ready" \| "error"` | From `useChat` |
| `error` | `unknown` | Last request error |

- [x] **R4** — `usePortfolioChat()` throws if used outside provider: `"usePortfolioChat must be used within PortfolioChatProvider"`
- [x] **R5** — `sendMessage` and `clearMessages` memoized with `useCallback`
- A new send stops the previous transport request first. An action version prevents an obsolete queued send or reset from affecting newer actions, keeping pending follow-ups out of later turns.

### Main conversation consumers

- [x] **R6** — `CollapsibleSidebarLayout` — `sendMessage`, `clearMessages`
- [x] **R7** — `Chat` — `messages`, `sendMessage`, `clearMessages` (top-right reset), `status`, `error`
- [x] **R8** — Project Q&A uses its own `useChat` and validated project context, without reading or mutating this provider

### Embedded chat mode

- [x] **R9** — Legacy `Chat embedded` remains compatible, but no current detail overlay mounts it

### Not yet implemented

- [ ] **R10** — Persist history (localStorage / account) — out of PRD today
- [ ] **R11** — Migrate to `features/chat-context/`
- [ ] **R12** — Typed `error` narrowing for UI (currently `unknown`)

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `contexts/chat-context.tsx`, provider mount in `app/page.tsx` | Route handler, tool logic, message part rendering |
| Target: `features/chat-context/` | Changing `@repo/ai` transport in package without approval |

## Invariants

- Single provider for the main portfolio conversation. The project Q&A hook is the explicit independent-session exception and aborts on unmount.
- API path remains `/api/chat` unless route and transport change together.
- Clearing messages does not call the server; no thread id.

## Acceptance criteria

- [x] Nav/suggestions/input share one `messages` array
- [x] Clear from sidebar empties thread immediately
- [ ] Project Q&A/main-conversation isolation verified in browser (cases added, execution deferred)
- [ ] R10–R12 per product priority

## Implementation prompt

If adding fields to context (e.g. `regenerate`), extend `ChatContextValue`, provider, and document consumers in this spec.

## Reference (not requirements)

- [chat-context.md](../chat-context.md)
