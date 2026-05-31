# Feature spec — Tech stack table UI

**Status:** Shipped

**Branch:** `feature/tech-stack-table`

## Goal

Replace the chip-based tech stack layout in chat with a scannable **table** so visitors can compare technologies at a glance. Surface proficiency and experience fields already present in `data/tech.json` but hidden by the current UI.

## Problem (current UX)

The `show_tech_stack` tool renders `<TechStack />` as:

- Five category headings with **wrapped pill chips** (icon + name only).
- No visible **level** or **years** despite those fields existing on every entry in `data/tech.json`.
- Long rows of similar-looking chips are hard to scan, especially on wide layouts where categories stack vertically with uneven wrap.

## Recommendation

Use **one table per category** (Frontend, Database, Cloud & DevOps, AI & Integration, Backend), each with the same column headers:

| Technology | Proficiency | Experience |

- **Technology** — icon (decorative) + name; icon has `aria-hidden`.
- **Proficiency** — `level` from data (e.g. Expert, Intermediate).
- **Experience** — `years` from data (e.g. `4 years exp`).

This preserves the mental model of the current sectioned layout while making rows easy to compare. A single mega-table with a Category column is **out of scope** unless we revisit after ship.

**Responsive:** wrap each table in `overflow-x-auto` so narrow viewports scroll horizontally instead of crushing columns.

**Accessibility:** semantic `<table>`, `<caption>` or visible `<h3>` per category (match current heading level), `scope="col"` on headers.

## User story

As a portfolio visitor, when I ask for the tech stack, I want a clear table of technologies with proficiency and experience so I can quickly understand what Eric uses and how deep his experience is.

## Requirements

### Data & API (unchanged contract)

- [x] **R1** — `show_tech_stack` tool output shape stays the same: `{ technologies, tech, related }` where `tech` is `Record<string, TechEntry[]>`.
- [x] **R2** — No changes required to `data/tech.json` schema for v1 (optional copy edits only).
- [x] **R3** — Server follow-up copy in `post-chat.ts` (`techStackFollowUp`) unchanged unless copy explicitly revised in a separate editorial pass.

### UI — `TechStack` component

- [x] **R4** — Replace chip/`flex-wrap` layout in `components/tech-stack.tsx` with design-system **Table** primitives (`@repo/design-system/components/ui/table`).
- [x] **R5** — For each category in `tech`, render a section: category title (`<h3>`, same visual weight as today: `text-sm font-medium text-muted-foreground`) + one `<Table>`.
- [x] **R6** — Table columns: **Technology**, **Proficiency**, **Experience** — map to `name` (+ optional `icon`), `level`, `years`.
- [x] **R7** — If `level` or `years` is missing on an entry, show em dash (`—`) in that cell (defensive; all current rows have both).
- [x] **R8** — Update `TechStackSkeleton` to mirror table layout (header row + N body rows per category block), not chip skeletons.
- [x] **R9** — Styling: dark-theme friendly borders (`border-border`), compact row padding consistent with chat message density; no new CSS files.

### Integration (no behavior change)

- [x] **R10** — `features/chat-ui/components/message.tsx` continues to render `<TechStack tech={output.tech} />` for `tool-show_tech_stack` / `tool-showTechStack` with no prop changes.
- [x] **R11** — Artifact / sidebar flows unchanged; only in-thread tool UI changes.

### Documentation

- [x] **R12** — Update `docs/tech-stack-flow.md` and `docs/feature-specs/02-chat-ui.md` tool-output row to describe table UI (not chip grid).
- [x] **R13** — On ship: set this spec and registry row to **Shipped**; line in `progress-tracker.md` **Completed**.

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `components/tech-stack.tsx` (render only) | `show_tech_stack` tool logic, intent router |
| Skeleton + table a11y/responsive | New columns in JSON (e.g. “last used”, links) |
| Doc touch-ups listed in R12 | Migrating component to `features/` (unless trivial colocation) |
| | Filtering, sorting, or search on the table |
| | Knowledge markdown `candidate/tech-stack.md` authoring |

## Proposed file structure

```
components/tech-stack.tsx     # primary change (legacy path; matches 05-artifacts registry)
data/tech.json                # read-only unless copy edits requested
```

Optional later: move to `features/artifacts/components/tech-stack.tsx` under artifact migration (05-artifacts R20).

## Component responsibilities

| Component | Responsibility |
|-----------|----------------|
| `TechStack` | Map `tech` categories → titled table sections |
| `TechStackSkeleton` | Loading placeholder matching table layout |
| `MessagePartRenderer` (`message.tsx`) | Unchanged wiring for tool part |

## API

| Endpoint / tool | Method | Notes |
|-----------------|--------|-------|
| `show_tech_stack` | tool execute | No schema change |

## Routes (thin)

| Route | File | Notes |
|-------|------|-------|
| — | — | UI-only; triggered via chat tool |

## Visual reference

**Before:** category heading + horizontal chip pills (icon + name only).

**After:** category heading + table:

```
Frontend
┌─────────────────┬──────────────┬──────────────┐
│ Technology      │ Proficiency  │ Experience   │
├─────────────────┼──────────────┼──────────────┤
│ ⚛️ React         │ Expert       │ 4 years exp  │
│ ▲ Next.js       │ Expert       │ 3 years exp  │
└─────────────────┴──────────────┴──────────────┘
```

(repeated per category)

## Out of scope

- Collapsing categories into one sortable table
- Clickable rows that open artifact or project detail
- Replacing emoji icons with SVG brand icons
- Changes to related-question pills below the stack

## Acceptance criteria

- [ ] Asking “Tech stack” (sidebar or chat) shows tables with Proficiency and Experience visible for every entry in `tech.json`
- [ ] Layout readable at ~375px width (horizontal scroll acceptable; no overlapping text)
- [ ] `pnpm typecheck` passes from `apps/portfolio-chat`
- [ ] Manual smoke: nav **Tech** preset + one free-text tech stack question
- [x] Registry + tracker updated on ship (R13)

## Implementation prompt (for agents)

1. Read this spec + [progress-tracker.md](../context/progress-tracker.md); confirm branch `feature/tech-stack-table`.
2. Implement R4–R9 in `components/tech-stack.tsx` using design-system Table; do not change tool output shape (R1).
3. Update R12 docs; run `pnpm typecheck`.
4. Mark spec **Shipped** in [00-index.md](./00-index.md) and add Completed line in tracker.
