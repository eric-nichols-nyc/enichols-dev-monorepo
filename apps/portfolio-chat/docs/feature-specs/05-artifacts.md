# Feature spec — Artifacts

**Status:** Shipped

## Goal

Full-screen modal for deep-diving a project or experience while keeping an embedded chat column—animated open/close, loading state, and coordination with in-thread tool UI.

## User story

As a visitor, when I expand experience (or select a project detail), I want a focused panel with rich content and the conversation still visible beside it.

## Requirements

### State ownership (`chat.tsx`)

- [x] **R1** — `artifactOpen`, `selectedProject`, `selectedExperience`, `boundingBox`, `artifactLoading` live in `Chat` (not global context)
- [x] **R2** — `handleExperienceExpand(experience, box?)` — sets experience, clears project, stores `boundingBox`, sets `artifactOpen` true
- [x] **R3** — `handleClose` — resets all artifact state
- [x] **R4** — When open + has project or experience content → `artifactLoading` true for **1s** then false (`useEffect` timer)

### Content selection

- [x] **R5** — `artifactContent` memo: `FeaturedProject` if `selectedProject`, else `FeaturedExperience` if experience list non-empty, else `ArtifactEmptyState`
- [x] **R6** — `onExperienceExpand` passed to `Messages` (default: internal handler; overridable via `Chat` prop)

### Artifact modal (`artifact.tsx`)

- [x] **R7** — Renders only when `open`; `AnimatePresence` + Motion
- [x] **R8** — `role="dialog"`, `aria-modal="true"`, `aria-labelledby="artifact-title"`
- [x] **R9** — Escape key and backdrop click call `onClose`
- [x] **R10** — `document.body.style.overflow = "hidden"` while open
- [x] **R11** — Two columns: left **400px** embedded `<Chat embedded />` (no nested artifact), right scrollable content slot
- [x] **R12** — Loading: design-system `Loader` when `isLoading`
- [x] **R13** — **Bounding-box animation**: if `boundingBox` set, panel animates from card rect to fullscreen; else slides from right (`x: 100%` → `0`)
- [x] **R14** — Uses `useWindowSize` for target dimensions

### In-thread section components (tool output, not modal-only)

| Component | Used when |
|-----------|-----------|
| `Projects` / `ProjectCard` | `tool-show_projects` in message |
| `Experience` | `tool-show_experience` — `onExpand` → artifact |
| `About` | `tool-show_about` (when card mode) |
| `TechStack` | `tool-show_tech_stack` |
| `FeaturedProject` | Artifact detail column |
| `FeaturedExperience` | Artifact detail column |

- [x] **R15** — Experience expand from thread passes `ExperienceBoundingBox` for motion origin (see `experience.tsx`)

### Props note

- [x] **R16** — `onProjectSelect` passed from `Chat` to `Artifact` — reserved for project-card → artifact flow; **project open-from-card may be incomplete** — verify `Projects` / cards wire `setSelectedProject` + `setArtifactOpen` when adding P7

### Embedded mode

- [x] **R17** — `embedded` `Chat` does not render outer `Artifact` wrapper (prevents modal-in-modal)

### Not yet implemented

- [ ] **R18** — PRD P7: per-project detail chat routes or deep links
- [ ] **R19** — Persist artifact selection across `clearMessages`
- [ ] **R20** — Migrate artifact stack to `features/artifacts/`

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `chat.tsx` artifact state, `artifact.tsx`, `artifact-empty-state.tsx`, `featured-*.tsx`, section components used in tools | API tools, sidebar |
| Target: `features/artifacts/` | |

## Acceptance criteria

- [x] Experience expand opens modal with animation and embedded chat
- [x] Close restores body scroll and clears selection state
- [x] Empty artifact shows `ArtifactEmptyState` when no selection
- [ ] Project card → artifact flow documented and wired (R16 / P7)
- [ ] R20 migration when scheduled

## Implementation prompt

Any new expand affordance must set `boundingBox` when animating from a card; update this spec and `02-chat-ui` if part types change.
