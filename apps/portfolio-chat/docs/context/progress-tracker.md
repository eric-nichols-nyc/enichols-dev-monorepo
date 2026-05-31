# Progress tracker — Portfolio Chat

**Live session state.** Update after every meaningful change. The feature index (`docs/feature-specs/00-index.md`) is the permanent map.

## Current Phase

**Knowledge Assistant — Stage 1 (Knowledge Sources)**

## Current Goal

## Current Goal

Sidebar nav visibility **P3** (active section highlight) on `feature/sidebar-nav-p1` — P1–P2 shipped.

## Completed

- sidebar-nav-p2 — Nav pill affordance at rest: `bg-muted/30` + `hover:bg-muted` on desktop + mobile ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P2)
- sidebar-nav-p1 — Distinct sidebar surface: `--sidebar-background` + `bg-sidebar` on desktop + mobile drawer ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P1)
- tech-stack-table — `TechStack` renders per-category tables (Technology, Proficiency, Experience) from `data/tech.json` ([08-tech-stack-table](../feature-specs/08-tech-stack-table.md))
- concise-about-intro — Short rule-based intro variants (`data/about.ts`, `select-about-intro.ts`); all `candidate_overview` use about-stream; trimmed `candidate-profile.md`
- knowledge-assistant-stage5 — Dynamic suggestions (`generate-suggestions.ts`, `suggestion-templates.ts`, wired in `run-chat-stream.ts`)
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

- (idle — Stage 7 integration cleanup or manual QA of dynamic suggestions)

## Next Up

- knowledge-assistant Stage 7 — integration cleanup (remove static tool `related`, guardrails)
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

- **2026-05-31:** Concise about intro — `selectAboutIntro()` variants by phrase cluster; sidebar “About” sends “Tell me about yourself”; stream path for all `candidate_overview`.
- **2026-05-31:** Stage 5 dynamic suggestions — rule-based `generateSuggestions()` per intent; emits `data-related` at end of turn; strips static tool `related` when KA enabled.
- **2026-05-31:** Knowledge Assistant Stage 0 specs: `00-implementation-stages` through `07-integration-cleanup`; merged `feature/ai-chat` into main; branch `feature/knowledge-assistant-phase0`.
- **2026-05-30:** Completed feature specs 03, 04, 05, 07 — entire registry now Shipped-level documentation.
- **2026-05-30 (later):** Completed 02 + 06 feature specs; extracted system prompt to `lib/ai/prompts/portfolio-assistant.ts`.
- **2026-05-30:** Bootstrapped agent doc system from `AGENT-DOC-BOOTSTRAP-PROMPT.md`. Existing narrative docs (`chat-rendering.md`, etc.) linked from `reference/00-index.md` — not requirements.
