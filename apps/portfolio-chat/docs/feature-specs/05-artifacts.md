# Feature spec — Artifacts

**Status:** Shipped (legacy) — **Spec TODO**

## Goal

Side panel for expanded project/experience (and related) detail when user engages with featured cards or tool output.

## User story

As a visitor, I want to open detailed project or role information beside the chat without losing the thread.

## Requirements (inventory)

- [x] R1 — Artifact open/close state in `Chat`
- [x] R2 — Featured project/experience components
- [x] R3 — Empty state when nothing selected
- [ ] R4 — [TBD] Deep-link or persist selection across clear

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `artifact.tsx`, `artifact-empty-state.tsx`, `featured-project.tsx`, `featured-experience.tsx`, section components (`projects.tsx`, `experience.tsx`, `about.tsx`, `resume.tsx`, `tech-stack.tsx`) | Tool definitions |

## Proposed file structure

```
features/artifacts/
  components/
```

## Acceptance criteria

- [x] Artifact opens from chat interactions
- [ ] Full spec audit + migration to `features/artifacts/`
