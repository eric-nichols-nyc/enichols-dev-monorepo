# Feature spec — Sidebar & layout

**Status:** Shipped (legacy) — **Spec TODO**

## Goal

Collapsible sidebar with nav presets, branding, clear-chat, and responsive mobile menu wrapping the chat column.

## User story

As a visitor, I want quick navigation and a clear layout on mobile and desktop.

## Requirements (inventory)

- [x] R1 — Sidebar collapse/expand on desktop
- [x] R2 — Mobile drawer + menu control
- [x] R3 — Nav items call `sendMessage` with preset text
- [x] R4 — Logo clears chat via `clearMessages`
- [ ] R5 — [TBD] Social links behavior / external link policy

## Proposed file structure

```
features/sidebar-layout/
  components/
```

**Legacy:** `components/collapsible-sidebar-layout.tsx`, `sidebar-brand.tsx`, `sidebar-logo.tsx`, `constants.ts`

## Acceptance criteria

- [x] Layout works at mobile and desktop breakpoints
- [ ] Migrated under `features/sidebar-layout/`
