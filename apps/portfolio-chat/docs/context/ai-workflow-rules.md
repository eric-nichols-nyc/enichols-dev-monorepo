# AI workflow rules — Portfolio Chat

Rules for Cursor and other agents implementing in this app.

## Scoping

1. **One unit at a time** — align with **Current Goal** in `progress-tracker.md`.
2. **No invented behavior** — requirements live in `docs/feature-specs/`, `docs/context/`, and `prd.md`.
3. **Ambiguity** — add to **Open Questions** in the tracker; do not guess product behavior.
4. **Package changes** — ask the user before editing `packages/design-system` or `packages/ai`.

## New feature gate

- No new code under **`features/<name>/`** without:
  - A row in **`docs/feature-specs/00-index.md`**, and
  - A spec file (`NN-<name>.md`) or explicit **Spec TODO** in the index + tracker **In Progress** line.

## Legacy code

- May edit `components/`, `lib/`, `contexts/` when the active spec or task targets that path.
- Prefer creating **`features/<name>/`** for new domains; document migration in the feature spec.

## Protected files

Unless the user explicitly requests:

| Path | Reason |
|------|--------|
| `packages/design-system/**` | Shared monorepo UI |
| `packages/ai/**` | Shared AI SDK wrapper |
| `playwright-report/**` | Generated |
| `.env.local` | Secrets — never commit or paste keys |

## Before finishing a unit

- [ ] Behavior matches the active feature spec (or agreed Open Question resolution)
- [ ] **progress-tracker.md** updated
- [ ] Feature index **Status** updated if shipping
- [ ] `pnpm typecheck` passes (from `apps/portfolio-chat`)
- [ ] `pnpm build` if routes, layout, or env changed
- [ ] Targeted test/e2e if streaming or tools changed

## Doc sync

When implementation changes facts (new tool, new route, renamed part type):

- Update the feature spec
- Update `architecture.md` or `code-standards.md` if cross-cutting
- Add **Architecture Decisions** in tracker for non-obvious choices

## Conflict resolution

`docs/feature-specs/NN-*.md` → `context/architecture.md` + `code-standards.md` → `prd.md` → **never** `reference/`
