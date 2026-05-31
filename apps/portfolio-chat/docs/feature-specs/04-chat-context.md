# Feature spec — Chat context

**Status:** Shipped

## Goal

One shared chat session for the whole app: messages, send, clear, status, and errors—backed by AI SDK `useChat` and a thin React context API.

## User story

As a visitor, I want the sidebar, chat column, and (when open) artifact mini-chat to share the same conversation without prop drilling.

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
| `clearMessages` | `() => void` | `setMessages([])` — new session, no server persistence |
| `status` | `"streaming" \| "submitted" \| "ready" \| "error"` | From `useChat` |
| `error` | `unknown` | Last request error |

- [x] **R4** — `usePortfolioChat()` throws if used outside provider: `"usePortfolioChat must be used within PortfolioChatProvider"`
- [x] **R5** — `sendMessage` and `clearMessages` memoized with `useCallback`

### Consumers (must use context, not raw `useChat`)

- [x] **R6** — `CollapsibleSidebarLayout` — `sendMessage`, `clearMessages`
- [x] **R7** — `Chat` — `messages`, `sendMessage`, `status`, `error`
- [x] **R8** — `Artifact` embeds `<Chat embedded />` — same provider tree, same session

### Embedded chat mode

- [x] **R9** — `Chat` with `embedded` skips artifact overlay (`!embedded` guard) but still uses same context messages

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

- Single provider per page tree — do not nest second `useChat` for main portfolio chat.
- API path remains `/api/chat` unless route and transport change together.
- Clearing messages does not call the server; no thread id.

## Acceptance criteria

- [x] Nav/suggestions/input share one `messages` array
- [x] Clear from sidebar empties thread immediately
- [x] Artifact embedded chat shows same history as main column
- [ ] R10–R12 per product priority

## Implementation prompt

If adding fields to context (e.g. `regenerate`), extend `ChatContextValue`, provider, and document consumers in this spec.

## Reference (not requirements)

- [chat-context.md](../chat-context.md)
