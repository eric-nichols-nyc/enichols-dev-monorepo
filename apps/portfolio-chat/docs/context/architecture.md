# Architecture — Portfolio Chat

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Chat client | `@ai-sdk/react` (`useChat`), `DefaultChatTransport` from `@repo/ai` |
| Chat server | `streamText`, tools, `createUIMessageStream` in `app/api/chat/route.ts` |
| Models | OpenAI via `@repo/ai/lib/models` (`AI_PROVIDER=openai`, `OPENAI_API_KEY`) |
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
        └── DetailOverlay (fullscreen project / experience details)
              └── ProjectQuestions (independent useChat → POST /api/chat + projectId)

app/api/chat/route.ts → features/ai-chat/api/post-chat.ts
  ├── features/ai-chat/tools/ (portfolio tools)
  ├── features/ai-chat/prompts/portfolio-assistant.ts
  └── features/ai-chat/lib/about-stream-mode.ts, stream-copy.ts
```

## Folder conventions

| Path | Role |
|------|------|
| `app/` | Routes only (`page.tsx`, `api/chat/route.ts`, layout, styles) |
| `features/<name>/` | **New** domain code (`components/`, `hooks/`, `utils/`) |
| `components/` | Legacy UI — chat, messages, artifacts, layout |
| `contexts/` | App-wide React context (`chat-context.tsx`) |
| `lib/` | App helpers (`project-preview-sentence`); AI in `features/ai-chat/` |
| `data/` | Static portfolio content (source of truth for tools) |
| `hooks/` | App-level hooks (legacy) |

## API

- **POST `/api/chat`** — body `{ messages }` (UIMessage[]); returns UI message stream compatible with `useChat`.

The focused project Q&A uses the same endpoint with `projectId`. The server resolves a published project, validates bounded user/assistant text history, and loads only its full knowledge plus published facts. Project questions always use grounded text answers without portfolio display tools; pronouns and follow-up questions stay bound to the selected project. This independent in-memory session is aborted/discarded on detail-view close and does not mutate the main provider.

Project-list intents emit the existing `show_projects` tool stream directly from local portfolio data. Sidebar and chat project-list actions share this path; no OpenAI request is needed to browse cards or open their details. Other intents retain the model stream.

When `AI_FOLLOW_UP_QUESTIONS_ENABLED=true` and the Knowledge Assistant is enabled, successful eligible responses get one supplementary structured call using bounded public evidence and recent chat. Questions are validated before one `data-related` part is emitted ahead of stream finish. The call has a three-second deadline, no retries, and template fallback. Request abort signals reach both calls; reset/new sends stop the old transport. The feature defaults off and never adds model calls to project-list browsing.

### Tools (registered in route)

| Tool | UI part type (typical) | Data |
|------|------------------------|------|
| `show_about` | `tool-show_about` | `data/about.ts`, `features/ai-chat/tools/about.ts` |
| `show_projects` | `tool-show_projects` | `data/projects.ts` |
| `show_experience` | `tool-show_experience` | `data/experience.ts` |
| `show_tech_stack` | `tool-show_tech_stack` | `data/tech.json` |

## Invariants

- Chat state is client-only (no DB); clearing chat = `setMessages([])`.
- The main chat's persistent `WelcomeMessage` is UI only, preceding real turns without entering `messages` or model context. Detail views do not duplicate the main chat or welcome.
- The fullscreen detail Dialog has stable viewport dimensions, immediately renders local details, and owns its content scroll. The main chat stays mounted beneath it; focus restoration uses `preventScroll`. There is no loading timer or bounding-box expansion.
- The message viewport owns scrolling. New user-turn keys trigger placement once; streamed chunks only update content and near-bottom detection. The interruptible visual bridge lives in `features/chat-ui/lib/turn-transition.ts`.
- Tool part types must stay in sync with `components/message.tsx` handlers.
- Do not import server-only code into client components without `"use client"` / boundary discipline.
- Content changes go through `data/*`; prompts in the route should reflect current tool names.

## Auth & storage

None — public portfolio, ephemeral chat in memory.
