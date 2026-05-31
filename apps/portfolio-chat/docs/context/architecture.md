# Architecture — Portfolio Chat

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Chat client | `@ai-sdk/react` (`useChat`), `DefaultChatTransport` from `@repo/ai` |
| Chat server | `streamText`, tools, `createUIMessageStream` in `app/api/chat/route.ts` |
| Models | `@repo/ai` / Google (see route and env) |
| Validation | Zod 4 |
| Tests | Vitest (unit), Playwright (e2e) |
| Shared UI | `@repo/design-system` (ai-elements, shadcn primitives) |

## Boundaries

```
Browser
  └── PortfolioChatProvider (useChat → POST /api/chat)
        ├── CollapsibleSidebarLayout
        │     ├── Sidebar (nav → sendMessage presets)
        │     └── Chat → Messages → MessagePartRenderer
        └── Artifact panel (projects / experience detail)

app/api/chat/route.ts
  ├── streamText + tools (inline in route today)
  ├── lib/ai/prompts/portfolio-assistant.ts (system prompt)
  ├── lib/ai/tools/about.ts (show_about tool)
  └── lib/ai/about-stream-mode.ts (word stream for about)
```

## Folder conventions

| Path | Role |
|------|------|
| `app/` | Routes only (`page.tsx`, `api/chat/route.ts`, layout, styles) |
| `features/<name>/` | **New** domain code (`components/`, `hooks/`, `utils/`) |
| `components/` | Legacy UI — chat, messages, artifacts, layout |
| `contexts/` | App-wide React context (`chat-context.tsx`) |
| `lib/` | AI utilities and tools (migrate → `features/ai-chat/`) |
| `data/` | Static portfolio content (source of truth for tools) |
| `hooks/` | App-level hooks (legacy) |

## API

- **POST `/api/chat`** — body `{ messages }` (UIMessage[]); returns UI message stream compatible with `useChat`.

### Tools (registered in route)

| Tool | UI part type (typical) | Data |
|------|------------------------|------|
| `show_about` | `tool-show_about` | `data/about.ts`, `lib/ai/tools/about.ts` |
| `show_projects` | `tool-show_projects` | `data/projects.ts` |
| `show_experience` | `tool-show_experience` | `data/experience.ts` |
| `show_tech_stack` | `tool-show_tech_stack` | `data/tech.json` |

## Invariants

- Chat state is client-only (no DB); clearing chat = `setMessages([])`.
- Tool part types must stay in sync with `components/message.tsx` handlers.
- Do not import server-only code into client components without `"use client"` / boundary discipline.
- Content changes go through `data/*`; prompts in the route should reflect current tool names.

## Auth & storage

None — public portfolio, ephemeral chat in memory.
