# Feature spec — Artifacts

**Status:** Focused overlay implemented; browser review deferred

## Goal

Full-window project or experience details, with an independent contextual Q&A section for projects. The main conversation stays mounted behind the overlay. See [13-project-detail-overlay](./13-project-detail-overlay.md) for the current interaction and verification.

## User story

As a visitor, I want to read project details, ask about that project in place, and return to my main conversation without losing my position.

## Requirements

### State ownership (`chat.tsx`)

- [x] **R1** — `artifactOpen`, `selectedProject`, and `selectedExperience` live in `Chat` (not global context)
- [x] **R2** — `handleExperienceExpand(experience)` sets experience, clears project, and opens the overlay
- [x] **R3** — `handleClose` — resets all artifact state
- [x] **R4** — Selected local content renders immediately; no artificial loading timer

### Content selection

- [x] **R5** — `artifactContent` memo: `ProjectDetail` (existing `FeaturedProject` plus Q&A) if a project is selected, else `FeaturedExperience` or `ArtifactEmptyState`
- [x] **R6** — `onExperienceExpand` passed to `Messages` (default: internal handler; overridable via `Chat` prop)

### Focused modal (`features/project-details/components/detail-overlay.tsx`)

- [x] **R7** — Shared `Dialog` controls modal lifetime and focus containment
- [x] **R8** — `DialogTitle` and `DialogDescription` provide accessible naming
- [x] **R9** — Escape, Close, and Back to chat dismiss; restore opener focus with `preventScroll`
- [x] **R10** — Shared Dialog owns background scroll locking
- [x] **R11** — One scrollable content column; no embedded main chat
- [x] **R12** — Project Q&A has its own streaming/busy/error controls; details render immediately
- [x] **R13** — Stable fullscreen dimensions, without card expansion or content entrance animation
- [x] **R14** — CSS viewport sizing, without a window-measurement hook

### In-thread section components (tool output, not modal-only)

| Component | Used when |
|-----------|-----------|
| `Projects` / `ProjectCard` | `tool-show_projects` in message |
| `Experience` | `tool-show_experience` — `onExpand` → artifact |
| `About` | `tool-show_about` (when card mode) |
| `TechStack` | `tool-show_tech_stack` |
| `ProjectDetail` / `FeaturedProject` | Focused project content with collapsed Q&A below the overview |
| `FeaturedExperience` | Focused experience content |

- [x] **R15** — Legacy section callbacks may still supply a bounding box; the stable overlay does not consume it

### Props note

- [x] **R16** — Project cards call `onProjectSelect` → `Chat` selects the project and opens the focused overlay. Selectable cards show a persistent top-right expand icon over the preview, using the card's existing click/keyboard action.
- [x] **R21** — Project cards use one vertical column at every viewport width: full-width 16:9 preview, readable details underneath, then a horizontal link footer with a top divider. Loading skeletons match this layout.

### Project questions

- [x] **R17** — Project questions use a separate ephemeral `useChat` session, retain state when collapsed, abort/discard on close, and never mount a second main chat; see spec 13

### Not yet implemented

- [ ] **R18** — PRD P7b: per-project detail chat routes or deep links
- [ ] **R19** — Persist artifact selection across `clearMessages`
- [ ] **R20** — Migrate remaining legacy rich-content components; overlay/Q&A ownership is now `features/project-details/`

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `Chat` selection state, `features/project-details/`, legacy rich content and section components | Sidebar, shared package source |
| `components/artifact.tsx` is a legacy export shim | |

## Acceptance criteria

- [ ] Project/experience details, keyboard/focus, and mobile layout verified in browser (deferred; code-only checks requested)
- [x] Close restores body scroll and clears selection state
- [x] Empty artifact shows `ArtifactEmptyState` when no selection
- [x] Project card → artifact flow wired (R16)
- [ ] R20 migration when scheduled

## Implementation prompt

Use the shared focused overlay for detail expansion. Keep the main conversation mounted and project Q&A independent. Follow spec 13 for scope and verification.

## Project card layout refinement — 2026-10-16

Removed desktop horizontal-card rules and fixed thumbnail widths from both cards and loading skeletons. Cards retain selection/bounding-box handlers and external links. This addresses the user's screenshot of cramped copy beside the preview in embedded chat. Verification is code-only; desktop/mobile browser review remains deferred. Typecheck/build retain the existing shared `radix-ui` dependency blocker.

Spec 13 subsequently removes the embedded chat and the loading/expansion sequence. Existing section/card callbacks remain compatible.
