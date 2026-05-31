# Progress tracker — Portfolio Chat

**Live session state.** Update after every meaningful change. The feature index (`docs/feature-specs/00-index.md`) is the permanent map.

## Current Phase

**Knowledge Assistant — Stage 1 (Knowledge Sources)**

## Current Goal

**Knowledge Assistant Stage 5:** Dynamic suggestions per [06-dynamic-suggestions.md](../feature-specs/knowledge-assistant/06-dynamic-suggestions.md).

## Completed

- knowledge-assistant-stage4 — Response handler wired in `post-chat.ts` (route → load → stream)
- knowledge-assistant-stage2-3 — Context loader + intent router with unit tests
- knowledge-assistant-stage1 — `knowledge/` markdown corpus (candidate + projects)
- p7-project-artifact — Click project card in chat opens artifact with `FeaturedProject` + bounding-box animation
- ai-chat-migration — `features/ai-chat/` + thin route + `@/lib/ai/*` shims
- chat-ui-migration — `features/chat-ui/` + legacy shims at `components/chat`, `messages`, etc.
- specs-all — Full specs for 02–07 feature registry (all shipped areas documented)
- specs-core — Full specs for [02-chat-ui](../feature-specs/02-chat-ui.md) and [06-ai-chat](../feature-specs/06-ai-chat.md) from codebase
- ai-prompt — System prompt extracted to `lib/ai/prompts/portfolio-assistant.ts`
- agent-docs — Spec-driven doc system (AGENTS chain, context/, feature-specs/, reference/, Cursor rules, .cursorignore)
- chat-core — Streaming chat UI with `useChat`, message parts, suggestions (`components/chat.tsx`, `messages/`, `message.tsx`)
- chat-api — POST `/api/chat` with tools: about, projects, experience, tech stack
- about-stream — Word-by-word about stream mode (`lib/ai/about-stream-mode.ts`, e2e spec)
- layout — Collapsible sidebar + artifact panel for featured project/experience
- data-layer — Typed portfolio content in `data/*`

## In Progress

- (idle — pick Stage 5 dynamic suggestions or manual QA of Stage 4 in browser)

## Next Up

- knowledge-assistant Stage 5 — dynamic suggestions
- PRD P7b — per-project routes / deep links
- PRD P8 — rate limiting on `/api/chat` (not in app today)
- Migrate sidebar, context, or artifacts into `features/`
- Data quality: R8 schema tests, R9 link checker (07-portfolio-data)

## Open Questions

- [TBD] Target hosting URL and analytics requirements
- [TBD] Priority order for legacy → `features/` migration (chat-ui vs ai-chat first)

## Architecture Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-30 | Agent scope = `apps/portfolio-chat/` only | User choice; packages require explicit approval |
| 2026-05-30 | New code under `features/<name>/` | User choice; gradual migration from flat `components/` |
| 2026-05-30 | Specs live in `docs/feature-specs/` | User choice (not under `context/`) |
| 2026-05-30 | Repo root `AGENTS.md` points here | Portfolio Chat primary entry for this repo |

## Session Notes

- **2026-05-31:** Stage 4 response handler — fixed clarification path to force `show_projects` via `toolChoice`; static tech stack pills skip follow-up prose (RH10); hybrid uses grounded narration from `tech-stack.md`.
- **2026-05-31:** Knowledge Assistant Stage 0 specs: `00-implementation-stages` through `07-integration-cleanup`; merged `feature/ai-chat` into main; branch `feature/knowledge-assistant-phase0`.
- **2026-05-30:** Completed feature specs 03, 04, 05, 07 — entire registry now Shipped-level documentation.
- **2026-05-30 (later):** Completed 02 + 06 feature specs; extracted system prompt to `lib/ai/prompts/portfolio-assistant.ts`.
- **2026-05-30:** Bootstrapped agent doc system from `AGENT-DOC-BOOTSTRAP-PROMPT.md`. Existing narrative docs (`chat-rendering.md`, etc.) linked from `reference/00-index.md` — not requirements.
