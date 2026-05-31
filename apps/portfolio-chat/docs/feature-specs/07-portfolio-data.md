# Feature spec — Portfolio data

**Status:** Shipped

## Goal

Typed, version-controlled portfolio content consumed by AI tools and UI—single source of truth, no CMS.

## User story

As Eric, I update facts in one place so chat tools and components stay aligned; as a visitor, I see consistent projects, roles, and narrative.

## Requirements

### Files & roles

| File | Export | Consumers |
|------|--------|-----------|
| `data/resume.ts` | `resume` — name, title, summary, skills, raw experience bullets | `data/about.ts` (source facts) |
| `data/about.ts` | `about` — title, `paragraphs[]` (first-person narrative) | `show_about` tool, mock stream, `About` UI |
| `data/experience.ts` | `ExperienceEntry[]` | `show_experience` tool, `Experience` / artifact |
| `data/projects.ts` | `Project[]` (sorted, filtered `published`) | `show_projects` tool, `Projects` / `FeaturedProject` |
| `data/tech.json` | Categories → tech entries | `show_tech_stack` tool, `TechStack` UI |

- [x] **R1** — All imports use `@/data/*` paths
- [x] **R2** — `Project` type includes artifact fields: `subtitle`, `problem`, `solution`, `tech`, `features`, `metrics`, `githubUrl`, etc.
- [x] **R3** — `projects` default export: unpublished entries excluded from chat lists
- [x] **R4** — `about` intro copy derived from `resume` facts — update **resume** for facts, **`data/about.ts` variants** for chat intro voice; career timeline stays in `data/experience.ts` / `knowledge/candidate/experience.md`

### Tool / UI alignment

- [x] **R5** — Tool outputs must match shapes expected in `02-chat-ui` (`message.tsx`)
- [x] **R6** — `about` social links in tool (`lib/ai/tools/about.ts`) should match `socialLinks` in `components/constants.ts` when profiles change
- [x] **R7** — `lib/project-preview-sentence.ts` derives card blurbs from `project.description`

### Editorial workflow (manual today)

1. Edit `data/resume.ts` for employment facts and highlights
2. Refresh `data/about.ts` intro variants (`aboutIntroVariants`) for chat intro tone—keep each variant under ~150 words
3. Align `knowledge/candidate/candidate-profile.md` summary with the same facts for grounded Q&A
4. Add/update `data/projects.ts` entries (`published: true` to surface)
5. Update `data/experience.ts` for chat timeline cards
6. Edit `data/tech.json` for stack categories
7. Smoke-test: nav presets + one tool per section in dev

- [ ] **R8** — [TBD] JSON schema or Vitest snapshot tests for data shape
- [ ] **R9** — [TBD] Script to validate broken image URLs / links

### Not in `data/`

- System prompts → `lib/ai/prompts/`
- Nav preset strings → `components/constants.ts` (should stay semantically aligned with tools)

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `data/*`, `lib/project-preview-sentence.ts` | Database, CMS, admin UI |
| Stays at app root `data/` (not under `features/`) | Generating copy via LLM at runtime except model narration |

## Invariants

- Do not duplicate project lists inside components—always import from `data/projects`.
- Changing `ExperienceEntry` shape requires updates to tool execute, `message.tsx`, and artifact components.
- Images live under `public/images/`; paths in `Project.image` / `gallery`.

## Acceptance criteria

- [x] All four tools return data consistent with files on disk
- [x] About narrative reflects resume companies/order
- [ ] R8–R9 when quality gates are prioritized

## Implementation prompt

Content-only PRs should run `pnpm dev` and trigger each tool once. No API route changes unless shapes change.
