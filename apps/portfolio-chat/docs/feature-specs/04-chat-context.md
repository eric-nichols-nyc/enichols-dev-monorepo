# Feature spec — Chat context

**Status:** Shipped (legacy) — **Spec TODO**

## Goal

Single chat session shared across sidebar and main chat via React context wrapping `useChat`.

## User story

As a visitor, I want sidebar actions and the chat panel to share one conversation.

## Requirements (inventory)

- [x] R1 — `PortfolioChatProvider` wraps app in `app/page.tsx`
- [x] R2 — Exposes `messages`, `sendMessage`, `clearMessages`, `status`, `error`
- [x] R3 — `usePortfolioChat` throws outside provider
- [x] R4 — Transport points to `/api/chat`

## Proposed file structure

```
features/chat-context/
  contexts/       # or index exporting provider + hook
```

**Legacy:** `contexts/chat-context.tsx`

## Reference (not requirements)

- [chat-context.md](../chat-context.md)

## Acceptance criteria

- [x] Clear and send work from sidebar and chat
- [ ] Migrated under `features/chat-context/`
