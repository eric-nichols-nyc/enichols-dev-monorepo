# Progress tracker — Portfolio Chat

**Live session state.** Update after every meaningful change. The feature index (`docs/feature-specs/00-index.md`) is the permanent map.

## Current Phase

**Project Publisher — implementation (Stage 5)**

## Current Goal

Project Publisher Stage 5 — generate endpoint: `POST /api/admin/projects/generate` ([implementation](../feature-specs/project-publisher/implementation.md#stage-5--generate-endpoint)).

## Completed

- project-publisher-stage4 — Admin page skeleton: thin `app/admin/projects/new/page.tsx`, form with gallery field, preview UI, `use-generate-draft` wired with loading/error states ([implementation](../feature-specs/project-publisher/implementation.md#stage-4--admin-page-skeleton))

- project-publisher-stage3 — Zod `projectSchema` + `projectMetricSchema` mirroring `Project` / `ProjectMetric`; `ValidatedProject` types; `publishRequestBodySchema` uses `projectSchema` ([implementation](../feature-specs/project-publisher/implementation.md#stage-3--project-schema))
- project-publisher-stage2 — Admin auth: `POST /api/admin/unlock`, `middleware.ts`, thin `app/admin/unlock/page.tsx`, real `use-admin-auth` ([implementation](../feature-specs/project-publisher/implementation.md#stage-2--admin-auth))
- project-publisher-stage1 — Feature foundation: `features/project-publisher/{components,hooks,utils,lib}` with typed stubs; `pnpm typecheck` passes ([implementation](../feature-specs/project-publisher/implementation.md#stage-1--feature-foundation))
- project-publisher-alignment — All 8 pre-implementation steps complete ([00-index](../feature-specs/project-publisher/00-index.md#pre-implementation-alignment-checklist))
- project-publisher-github — README via GitHub REST API (`read-github-readme.ts`); optional `GITHUB_TOKEN`; not Cursor MCP ([architecture](../feature-specs/project-publisher/architecture.md#github-readme-fetch))
- project-publisher-publish-model — Local writes only (`PROJECT_PUBLISHER_ENABLE_WRITES`); blocked on Vercel; manual git commit ([architecture](../feature-specs/project-publisher/architecture.md#publish-model))
- project-publisher-auth — `ADMIN_SECRET` + Bearer header; unlock cookie; middleware on `/admin/*` ([architecture](../feature-specs/project-publisher/architecture.md#authentication))
- project-publisher-model — OpenAI only (`OPENAI_API_KEY`, `AI_PROVIDER=openai`); no Google/Gemini in app docs
- project-publisher-orchestration — MVP uses AI SDK typed pipeline; LangGraph deferred to Phase 2 ([architecture](../feature-specs/project-publisher/architecture.md))
- project-publisher-prd — Updated [docs/prd.md](../prd.md): P9 Project Publisher in scope; internal admin constraints; knowledge layer in content model
- project-publisher-registry — Registered in [00-index](../feature-specs/00-index.md); specs under [project-publisher/](../feature-specs/project-publisher/00-index.md) (canonical name; was `project-agent/`)
- sidebar-nav-p3 — Active section highlight via `useActiveNavSection` + optimistic nav clicks ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P3)
- sidebar-nav-shell — Matched header heights (`h-[4.5rem]`), social icons right + 10% smaller
- sidebar-nav-p8 — Brand subtitle “Ask about my work” under name (expanded + mobile) ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P8)
- sidebar-nav-p5-p7 — Muted inactive nav text + hover pop; `--sidebar-border` + `border-sidebar-r` edge ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P5, P7)
- sidebar-nav-p4 — “Explore” section label above nav (expanded + mobile; hidden collapsed) ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P4)
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

- _(none — start Stage 5 when ready)_

## Next Up

- Project Publisher Stages 3–16 — schema → admin UI → pipeline → publish ([implementation](../feature-specs/project-publisher/implementation.md))
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
| 2026-07-01 | Admin UI in `features/project-publisher/components/` | `app/admin/**/page.tsx` thin shells only — no root `components/` |
| 2026-07-01 | Code layout: `features/project-publisher/{components,hooks,utils,lib}` | No `src/`; specs in docs only; no barrel indexes |
| 2026-07-01 | GitHub README: REST API, not MCP | `GET /repos/{owner}/{repo}/readme`; optional `GITHUB_TOKEN` |
| 2026-07-01 | Publish: local FS writes + manual git | `PROJECT_PUBLISHER_ENABLE_WRITES=true`; block on `VERCEL=1`; no auto-commit |
| 2026-07-01 | Admin auth via `ADMIN_SECRET` | Bearer on APIs; httpOnly cookie + unlock page; 404 if unset |
| 2026-07-01 | OpenAI only — no Google/Gemini | Owner preference; `AI_PROVIDER=openai`, `OPENAI_API_KEY` |
| 2026-07-01 | Project Publisher MVP: AI SDK pipeline, not LangGraph | Linear workflow; matches `features/ai-chat/`; LangGraph in Phase 2 for branching/retries |
| 2026-05-30 | Repo root `AGENTS.md` points here | Portfolio Chat primary entry for this repo |

## Session Notes

- **2026-05-31:** Concise about intro — `selectAboutIntro()` variants by phrase cluster; sidebar “About” sends “Tell me about yourself”; stream path for all `candidate_overview`.
- **2026-05-31:** Stage 5 dynamic suggestions — rule-based `generateSuggestions()` per intent; emits `data-related` at end of turn; strips static tool `related` when KA enabled.
- **2026-05-31:** Knowledge Assistant Stage 0 specs: `00-implementation-stages` through `07-integration-cleanup`; merged `feature/ai-chat` into main; branch `feature/knowledge-assistant-phase0`.
- **2026-05-30:** Completed feature specs 03, 04, 05, 07 — entire registry now Shipped-level documentation.
- **2026-05-30 (later):** Completed 02 + 06 feature specs; extracted system prompt to `lib/ai/prompts/portfolio-assistant.ts`.
- **2026-05-30:** Bootstrapped agent doc system from `AGENT-DOC-BOOTSTRAP-PROMPT.md`. Existing narrative docs (`chat-rendering.md`, etc.) linked from `reference/00-index.md` — not requirements.
