# Feature spec — Portfolio data

**Status:** Shipped — **Spec TODO** for editorial workflow.

## Goal

Single source of truth for projects, experience, about narrative, resume facts, and tech stack JSON consumed by tools and UI.

## User story

As Eric, I want to update portfolio facts in one place so chat and components stay consistent.

## Requirements (inventory)

- [x] R1 — `data/projects.ts`, `experience.ts`, `about.ts`, `resume.ts`, `tech.json`
- [x] R2 — About prose derived from resume experience entries
- [ ] R3 — [TBD] Validation script or CI check for data shape
- [ ] R4 — [TBD] Content update checklist in docs

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `data/*` | CMS, database |

**Note:** Data remains at `data/` (not under `features/`) — cross-cutting content layer.

## Acceptance criteria

- [x] Tools and components import from `@/data/*`
- [ ] Editorial workflow documented
