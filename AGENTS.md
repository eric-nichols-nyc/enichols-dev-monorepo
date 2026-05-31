# Portfolio Chat monorepo — agent scope

Before searching or editing code, read **[apps/portfolio-chat/docs/AGENTS.md](./apps/portfolio-chat/docs/AGENTS.md)** for product context, read order, and workflow.

## Scope

You are strictly confined to **`apps/portfolio-chat/`** unless the user explicitly expands scope in the current task.

- Do **not** index, read, or edit `packages/`, other `apps/*`, or repo-wide config without asking first.
- Shared dependencies (`@repo/design-system`, `@repo/ai`) are consumed via imports; package changes require explicit user approval.

Enforced by **`.cursorignore`**, **`.cursor/rules/project-scope.mdc`** (`alwaysApply: true`), and **`.cursor/rules/portfolio-chat.mdc`** (when `apps/portfolio-chat/**` is in context).

## Quick entry

| What | Path |
|------|------|
| App stub | `apps/portfolio-chat/AGENTS.md` |
| Main playbook | `apps/portfolio-chat/docs/AGENTS.md` |
| Live session state | `apps/portfolio-chat/docs/context/progress-tracker.md` |
| Feature registry | `apps/portfolio-chat/docs/feature-specs/00-index.md` |
