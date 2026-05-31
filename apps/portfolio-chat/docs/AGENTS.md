# Portfolio Chat — agent context

Instructions for AI agents working in **`apps/portfolio-chat`**. Read this file first, then the context and feature specs below before implementing product behavior.

## Read order

1. **[context/project-overview.md](./context/project-overview.md)** — product goals, users, core flows.
2. **[context/architecture.md](./context/architecture.md)** — stack, folder boundaries, API, invariants.
3. **[context/ui-context.md](./context/ui-context.md)** — `@repo/design-system`, tokens, layout patterns.
4. **[context/code-standards.md](./context/code-standards.md)** — TypeScript, Next.js, styling, API conventions.
5. **[context/progress-tracker.md](./context/progress-tracker.md)** — current phase, goal, in progress, completed.
6. **[feature-specs/00-index.md](./feature-specs/00-index.md)** — registry; read the spec for any feature you touch.

Always follow **[context/ai-workflow-rules.md](./context/ai-workflow-rules.md)** for scoping, protected files, and keeping docs in sync.

**Product source of truth (living):** [`prd.md`](./prd.md) — use when context files are placeholders or conflict with shipped behavior.

**Learn-by-reading (not requirements):** [`reference/`](./reference/) — do not treat as product specs.

## Scope

| Area | Path | Role |
|------|------|------|
| **This app** | `apps/portfolio-chat` | Next.js UI, chat, artifacts, portfolio data, `/api/chat` |
| **Workspace packages** | `packages/design-system`, `packages/ai` | Shared UI + AI SDK wrappers — **out of scope** unless user approves |

Default: all changes stay in `apps/portfolio-chat/`. Do not edit `packages/*` without explicit user approval.

### Monorepo scope constraints

- Confined to **`apps/portfolio-chat/`** only.
- NEVER index, read, or search `packages/` or other `apps/*` unless the user expands scope.
- If a task requires design-system or `@repo/ai` changes, ask before touching those paths.

Enforced by repo-root `.cursorignore`, `.cursor/rules/project-scope.mdc`, and [`AGENTS.md`](../../AGENTS.md).

## Commands (`apps/portfolio-chat`)

```sh
pnpm dev          # http://localhost:3018
pnpm build
pnpm typecheck
pnpm test
pnpm test:run
pnpm test:e2e
```

Run from `apps/portfolio-chat` (or via Turborepo filter from repo root if configured).

## Implementation defaults

- **Spec-driven:** Do not invent behavior missing from `docs/feature-specs/`, context files, or `prd.md`. Ambiguity → **Open Questions** in `progress-tracker.md` before coding.
- **New features:** Implement under **`features/<name>/`** with `components/`, `hooks/`, `utils/` per **[feature-specs/01-design-system.md](./feature-specs/01-design-system.md)**.
- **Legacy layout:** Existing code lives in `components/`, `lib/`, `contexts/`, `data/` — migrate incrementally; do not big-bang move without a spec + tracker line.
- **UI:** Import from `@repo/design-system/components/ui/*` and `components/ai-elements/*`; semantic tokens per `ui-context.md`.
- **Next.js:** Prefer Server Components; `"use client"` only for hooks, browser APIs, and interactivity.
- **Routes:** Keep `app/` thin — page composes providers and layout; logic in features or `components/`.
- **API:** Single chat route at `app/api/chat/route.ts`; tools and streaming logic colocated or under `lib/ai/` until migrated to `features/ai-chat/`.

## Protected (unless explicitly asked)

- `packages/design-system/**` — do not edit from this app
- `packages/ai/**` — do not edit from this app
- `playwright-report/`, `.next/`, `node_modules/`
- Unrelated apps in the monorepo

## Progress tracker (required)

After **every meaningful implementation change**, update **[context/progress-tracker.md](./context/progress-tracker.md)** before considering the task done (unless the user says docs are out of scope).

When updating:

- Move finished work from **In Progress** → **Completed** (one line: `area — what shipped`).
- Set **Current Goal** to the next single unit, or clear if idle.
- Adjust **Next Up**, **Open Questions**, **Architecture Decisions**, **Session Notes** as needed.

Read the tracker at task start.

## New feature workflow

1. Copy **[feature-specs/99-feature-spec-template.md](./feature-specs/99-feature-spec-template.md)** → `feature-specs/NN-<feature-name>.md` and fill it in.
2. Add a row to **[feature-specs/00-index.md](./feature-specs/00-index.md)** (Status: Not started / In progress / Shipped).
3. Set **Current Goal** + **In Progress** in **progress-tracker.md**.
4. Implement under **`features/<name>/`** (or legacy paths only if spec says migration exception).
5. On ship: line in **Completed**; update **Status** in the index.

**Index = permanent map. Tracker = live session state.**

## After each meaningful change

1. Verify the unit works in scope (dev, targeted test, or e2e if relevant).
2. Update **progress-tracker.md** (and any context/spec whose facts changed).
3. Run **`pnpm typecheck`**; run **`pnpm build`** when touching routes, layout, or env.

## Quick map

```
apps/portfolio-chat/
  app/                 # App Router (page, api/chat)
  features/            # NEW domain code (components/, hooks/, utils/)
  features/chat-ui/    # Chat column, messages, message parts, suggestions
  components/          # Legacy shims + artifacts, layout, tool section UI
  contexts/            # React context (chat session)
  lib/                 # AI helpers, tools (legacy → features/ai-chat)
  data/                # Portfolio content (projects, experience, about, resume)
  hooks/               # App-level hooks (legacy)
  docs/
    AGENTS.md          # This file
    prd.md
    feature-specs/     # Per-feature requirements + registry
    context/           # Overview, architecture, standards, tracker
    reference/         # Human notes — NOT requirements
  AGENTS.md            # Stub → points here
```

Cursor loads **`.cursor/rules/portfolio-chat.mdc`** when `apps/portfolio-chat/**` is in context.
