# Progress tracker — Portfolio Chat

**Live session state.** Update after every meaningful change. The feature index (`docs/feature-specs/00-index.md`) is the permanent map.

## Current Phase

**Phase 3 — Optional `features/` migration or product (P7b)**

## Current Goal

Sidebar nav visibility **P3** (active section highlight) — P1, P2, P4, P5, P7 shipped on `feature/sidebar-nav-p1`.

## Completed

- sidebar-nav-p5-p7 — Muted inactive nav text + hover pop; `--sidebar-border` + `border-sidebar-r` edge ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P5, P7)
- sidebar-nav-p4 — “Explore” section label above nav (expanded + mobile; hidden collapsed) ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P4)
- sidebar-nav-p2 — Nav pill affordance at rest: `bg-muted/30` + `hover:bg-muted` on desktop + mobile ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P2)
- sidebar-nav-p1 — Distinct sidebar surface: `--sidebar-background` + `bg-sidebar` on desktop + mobile drawer ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P1)
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

## Next Up

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

- **2026-05-30:** Completed feature specs 03, 04, 05, 07 — entire registry now Shipped-level documentation.
- **2026-05-30 (later):** Completed 02 + 06 feature specs; extracted system prompt to `lib/ai/prompts/portfolio-assistant.ts`.
- **2026-05-30:** Bootstrapped agent doc system from `AGENT-DOC-BOOTSTRAP-PROMPT.md`. Existing narrative docs (`chat-rendering.md`, etc.) linked from `reference/00-index.md` — not requirements.
