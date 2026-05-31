# Feature spec — AI chat API & tools

**Status:** Shipped

## Goal

Stream model responses from Google (via `@repo/ai`) and execute portfolio tools. Server controls follow-up narration (word-streamed text) and about-specific rendering so the client shows one coherent experience.

## User story

As a visitor, when I ask about Eric's work, the assistant declines off-topic requests, calls the right tool, and streams readable follow-up text—not duplicate or conflicting UI.

## Requirements

### Request / response

- [x] **R1** — `POST /api/chat` accepts JSON `{ messages: UIMessage[] }`
- [x] **R2** — Returns `createUIMessageStreamResponse` compatible with `useChat` / `DefaultChatTransport`
- [x] **R3** — `400` when `messages` missing or empty
- [x] **R4** — `500` with generic JSON error; log `[chat:api] error:` server-side

### Model & steps

- [x] **R5** — `streamText` with `models.chat` from `@repo/ai`
- [x] **R6** — `stopWhen: stepCountIs(1)` — single model step; server injects extra text after tools
- [x] **R7** — System prompt in `lib/ai/prompts/portfolio-assistant.ts` (decline off-topic; tool routing rules)
- [x] **R8** — Incoming UI messages converted to simple `{ role, content }` from text parts only (tool parts omitted from model history)

### Tools

| Tool | Execute delay | Output (summary) | Client part type(s) |
|------|---------------|------------------|---------------------|
| `show_about` | none | `title`, `paragraphs`, `socialLinks`, `related` | `tool-show_about` / `tool-showAbout` (often suppressed — see R9) |
| `show_projects` | 1500ms | `projectCount`, `projects`, `related` | `tool-show_projects` / `tool-showProjects` |
| `show_experience` | 1500ms | `experience`, `copy`, `related` | `tool-show_experience` / `tool-showExperience` |
| `show_tech_stack` | none | `technologies`, `tech`, `related` | `tool-show_tech_stack` / `tool-showTechStack` |

- [x] **R9** — **About text mode** (`aboutRenderMode: "text"` in route): on first `show_about` tool chunk, suppress tool UI stream and inject word-streamed `aboutCopy` + `data-related` with `aboutRelated` suggestions (`lib/ai/about-stream-mode.ts`)
- [x] **R10** — After `tool-output-available` with `projects` key → stream `projectsFollowUp` (sample titles from first 3 projects)
- [x] **R11** — After `tool-output-available` with `technologies` key → stream `techStackFollowUp`
- [x] **R12** — Experience follow-up copy lives in tool result `copy` field (not server `streamCopy` injection)
- [x] **R13** — `streamCopy` splits on words/spaces, ~20ms per token, emits `text-start` / `text-delta` / `text-end`

### Dev / test

- [x] **R14** — `CHAT_MOCK_STREAM=true` bypasses LLM; after 3s streams `about.paragraphs` (for e2e/dev)
- [x] **R15** — E2E `e2e/about-streaming.spec.ts`: "Tell me about yourself" shows streamed copy, **no** "About" card title

### Not yet implemented

- [ ] **R16** — Rate limiting / abuse protection
- [ ] **R17** — Request body Zod validation (currently trusts shape)
- [ ] **R18** — Migrate to `features/ai-chat/` with thin `app/api/chat/route.ts`

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `app/api/chat/route.ts`, `lib/ai/**` | Editing `packages/ai` models (ask user) |
| Tool data from `@/data/*` | Persisted chat history |
| Stream orchestration | Client `MessagePartRenderer` (see 02-chat-ui) |

## API contract

```
POST /api/chat
Content-Type: application/json
Body: { messages: UIMessage[] }

200: UI message stream (SSE/data stream per AI SDK)
400: { error: "Messages are required" }
500: { error: "Failed to process chat request. Please try again." }
```

## File structure

| File | Role |
|------|------|
| `app/api/chat/route.ts` | POST handler, stream pipe, tool registry, follow-up injection |
| `lib/ai/prompts/portfolio-assistant.ts` | System prompt |
| `lib/ai/tools/about.ts` | `showAboutTool`, `aboutCopy`, `aboutRelated` |
| `lib/ai/about-stream-mode.ts` | Suppress about tool chunks; trigger text stream |
| `lib/ai/project-preview-sentence.ts` | [if used elsewhere] |

**Migration target:** `features/ai-chat/{api,tools,prompts,lib}/`

## Invariants

- Tool names in prompt, route `tools` object, and client `message.tsx` handlers must stay aligned.
- Changing about render mode requires updating e2e and `getAboutStreamModeDecision` consumers.
- Do not expose API keys or raw model errors to the client.

## Acceptance criteria

- [x] All four tools callable from model; off-topic decline in prompt
- [x] About request streams paragraph text without duplicate About card (e2e)
- [x] Projects / tech stack receive server-injected follow-up text after tool output
- [x] `pnpm test:run` and `pnpm test:e2e` pass for about streaming
- [ ] R16–R18 when prioritized in PRD/tracker

## Implementation prompt

1. Read this spec before changing route, tools, or stream mode.
2. If adding a tool: register in route, add prompt line, add client part handler in 02-chat-ui, add data source, update `00-index.md`.
3. Run `pnpm typecheck` and relevant tests after changes.

## Reference (not requirements)

- [tech-stack-flow.md](../tech-stack-flow.md)
