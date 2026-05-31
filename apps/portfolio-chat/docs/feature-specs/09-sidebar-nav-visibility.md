# Feature spec — Sidebar navigation visibility & contrast

**Status:** In progress (P1 shipped on branch)

**Extends:** [03-sidebar-layout.md](./03-sidebar-layout.md) (R20 active nav state)

**Design review source:** May 2026 — comparison with Morphic / Perplexity dark-mode sidebar patterns. Problem: sidebar reads as decorative chrome, not primary navigation; same surface as chat column; nav items only visible on hover.

## Goal

Improve sidebar discoverability and hierarchy so visitors notice and use section navigation (Projects, About, Experience, Tech) without changing the overall dark portfolio aesthetic or chat-first layout.

## User story

As a first-time visitor, I want the sidebar to clearly look like navigation with visible, clickable section links, so I know where to explore Eric's portfolio beyond the chat thread.

## Priority overview

Implement in order unless the user specifies a subset (e.g. “implement P1–P3”). Lower numbers = higher impact.

| Priority | Summary | Est. effort |
|----------|---------|-------------|
| **P1** | Distinct sidebar surface (elevation vs main column) | Small |
| **P2** | Persistent nav pill affordance at rest | Small |
| **P3** | Active section highlight tied to chat | Medium |
| **P4** | Section group label above nav list | Small |
| **P5** | Muted default / bright hover & active text | Small |
| **P6** | Brand accent on active nav item | Small |
| **P7** | Stronger sidebar edge separation | Small |
| **P8** | Optional brand subtitle under name | Small |

---

## Requirements (by priority)

### P1 — Sidebar surface elevation (highest impact)

- [x] **R1** — Sidebar `<aside>` uses a **different background** than the main chat column — not the same `bg-background` on both planes.
- [x] **R2** — Prefer semantic tokens over raw hex in component code:
  - Sidebar: `bg-muted/40`, `bg-card`, or a new app-level utility (e.g. `.bg-sidebar`) defined once in `app/styles.css` if no suitable token exists.
  - Main column: keep `bg-background` (or current app background).
- [x] **R3** — Elevation read should match Morphic/Perplexity **layering logic** (two distinct surfaces), not their exact colors.
- [x] **R4** — Apply consistently on **desktop sidebar** and **mobile drawer** (same sidebar surface token).

**Acceptance:** At a glance, sidebar reads as a separate panel from the chat canvas without increasing global brightness.

---

### P2 — Persistent nav pill affordance

- [x] **R5** — Each nav item has a **visible resting state** — subtle rounded background at all times (not only on `:hover`).
  - Suggested: `bg-muted/30` or `bg-secondary/50` at rest; stronger on hover.
- [x] **R6** — Resting pills make items look **clickable** before any mouse interaction (addresses “won’t be seen” feedback).
- [x] **R7** — Collapsed desktop mode: pill wraps icon only; expanded mode: icon + label.
- [x] **R8** — Preserve existing behavior: click sends preset via `sendMessage({ text: message, files: [] })`.

**Acceptance:** Nav items are scannable as buttons on first paint; hover still provides feedback.

---

### P3 — Active section highlight

- [ ] **R9** — Track **active nav id** (`projects` | `about` | `experience` | `tech`) in layout or a small hook (e.g. `useActiveNavSection`).
- [ ] **R10** — Set active id when user triggers a nav preset **or** when chat content clearly maps to a section (see mapping table below).
- [ ] **R11** — Active item styling is **always visible** while that section is active:
  - Stronger pill background than rest state.
  - `text-foreground` (if P5 uses muted default for inactive items).
  - Optional left border or icon accent (see P6).
- [ ] **R12** — Clearing chat (`SidebarBrand` → `clearMessages`) resets active nav to **none** (no highlight).
- [ ] **R13** — `aria-current="page"` (or `true`) on the active nav button for accessibility.

**Section → nav id mapping (initial heuristic)**

| Trigger | Active id |
|---------|-----------|
| Nav click with preset message | Matching `NAV_ITEMS[].id` |
| Last assistant tool / artifact | Infer from tool name (e.g. `show_projects` → `projects`, `show_tech_stack` → `tech`) |
| User message closely matches preset | Match `NAV_ITEMS[].message` (case-insensitive trim) |
| Ambiguous / general chat | No active highlight |

- [ ] **R14** — Document mapping logic in code comment or hook JSDoc; refine in follow-up if false positives occur.

**Acceptance:** After “Tech stack” (nav or typed), **Tech** stays highlighted until clear or another section is selected. Resolves [03-sidebar-layout.md](./03-sidebar-layout.md) **R20**.

---

### P4 — Section group label

- [x] **R15** — Add a small label above the nav list (expanded sidebar + mobile drawer only; hidden when collapsed on desktop).
  - Copy: **“Explore”** or **“Portfolio”** (pick one at implement time; prefer “Explore”).
- [x] **R16** — Style: `text-xs font-medium uppercase tracking-wide text-muted-foreground` (or equivalent token).
- [x] **R17** — Provides framing similar to Morphic’s “History” / Perplexity section headers.

**Acceptance:** Nav list is grouped under a visible section heading.

---

### P5 — Text hierarchy (inactive vs active)

- [x] **R18** — **Inactive** nav items: `text-muted-foreground` (icons inherit or match).
- [x] **R19** — **Hover**: `text-foreground` + stronger pill (P2).
- [x] **R20** — **Active** (P3): `text-foreground` + strongest pill.
- [x] **R21** — Brand name (“Eric Nichols”) remains `text-foreground` / semibold — do not mute the brand row.

**Acceptance:** Inactive links recede; hover and active states pop without changing theme globally.

---

### P6 — Brand accent on active item

- [ ] **R22** — Active nav item uses **one** brand accent from the logo (purple/violet) — sparingly:
  - Option A: `border-l-2 border-violet-500` on active pill, or
  - Option B: active icon `text-violet-400`, or
  - Option C: both border + icon (only if not visually noisy).
- [ ] **R23** — Prefer a semantic token or CSS variable in `app/styles.css` (e.g. `--sidebar-accent`) if hardcoded violet is used — single source for future theme tweaks.
- [ ] **R24** — Inactive items stay neutral (no accent).

**Acceptance:** Active section is identifiable at a glance; accent does not appear on every nav item.

---

### P7 — Sidebar edge separation

- [x] **R25** — Strengthen separation between sidebar and main column:
  - Prefer slightly more visible `border-border` **or**
  - Subtle inset shadow on sidebar inner edge (`shadow-[inset_-1px_0_0_0_...]`) **or**
  - 1px divider with higher contrast token.
- [x] **R26** — Do not rely on border alone if P1 surface change is skipped (P1 + P7 together recommended).

**Acceptance:** Panel boundary is visible even when nav text is muted.

---

### P8 — Optional brand subtitle (lowest priority)

- [ ] **R27** — Under “Eric Nichols” (expanded + mobile only), optional one-line subtitle:
  - Example: **“Ask about my work”**
- [ ] **R28** — `text-xs text-muted-foreground`, truncated on narrow widths.
- [ ] **R29** — **Skip by default** unless user requests P8 when saying “implement” — reinforces primary IA without adding clutter.

**Acceptance:** Subtitle supports discoverability; hidden when sidebar collapsed.

---

## Explicitly out of scope

- Copying Morphic/Perplexity **history list density** (this app has four nav items, not chat history).
- Global theme brightening or raising contrast on all body text.
- Changes to `@repo/design-system` package tokens (app-level `styles.css` utilities only unless user expands scope).
- New nav items or preset message changes (still governed by `NAV_ITEMS` in `constants.ts` + 03-sidebar-layout).
- Migration to `features/sidebar-layout/` (remains **R19** in 03-sidebar-layout — can be combined with this work if desired).

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `components/collapsible-sidebar-layout.tsx` | Chat message bubbles, tool cards |
| `app/styles.css` (sidebar surface / accent utilities) | `packages/design-system/**` |
| New hook e.g. `hooks/use-active-nav-section.ts` or colocated under future `features/sidebar-layout/` | AI prompt / tool behavior changes |
| `constants.ts` (types for nav ids only if needed) | E2E test suite (unless user asks) |

## Proposed file structure

```
components/
  collapsible-sidebar-layout.tsx   # Surface, nav pills, label, active classes
  constants.ts                       # NAV_ITEMS (unchanged presets unless needed)
hooks/
  use-active-nav-section.ts        # P3: derive active id from chat state
app/
  styles.css                       # P1/P6: --sidebar-bg, --sidebar-accent if needed
```

## Component responsibilities

| Piece | Responsibility |
|-------|----------------|
| `CollapsibleSidebarLayout` | Apply sidebar surface, nav item variants (rest/hover/active), section label |
| `useActiveNavSection` | Read chat messages/context; return `activeNavId \| null` |
| `app/styles.css` | Optional sidebar-specific semantic utilities |

## API

| Endpoint / tool | Method | Notes |
|-----------------|--------|-------|
| None | — | UI-only; reads existing `usePortfolioChat()` messages |

## Visual reference (intent, not pixel-match)

| Pattern | Morphic / Perplexity | This feature |
|---------|-------------------|--------------|
| Sidebar ≠ main bg | ✓ | P1 |
| Selected row pill | ✓ | P2 + P3 |
| Section header | “History”, etc. | P4 “Explore” |
| Primary CTA in sidebar | “New” button | N/A — four presets are the CTAs; make them look like buttons (P2) |

## Acceptance criteria (full feature)

- [ ] P1–P7 implemented (P8 only if requested)
- [ ] Desktop collapsed/expanded and mobile drawer all consistent
- [ ] Active nav resets on clear chat
- [ ] No regression: nav presets, collapse, mobile drawer, social links
- [ ] `pnpm typecheck` passes from `apps/portfolio-chat`
- [ ] [03-sidebar-layout.md](./03-sidebar-layout.md) **R20** checked off; index Status updated

## Implementation prompt (for agents)

When the user says **“implement sidebar nav visibility”** or **“implement P1–P3”** (etc.):

1. Read this spec + [progress-tracker.md](../context/progress-tracker.md) + [03-sidebar-layout.md](./03-sidebar-layout.md).
2. Implement **only** the priority range the user named; default to **P1–P7** if they say “implement” without a range.
3. Use semantic Tailwind / app CSS tokens per [ui-context.md](../context/ui-context.md) — avoid scattered hex in components.
4. Wire P3 to `usePortfolioChat()` message list; keep mapping heuristic simple and documented.
5. Update progress-tracker + set this spec and 03-sidebar-layout R20 status when shipped.

## Open questions

- [x] **OQ1** — Section label copy: **“Explore”** (chosen at P4 ship).
- [ ] **OQ2** — P6 accent: left border vs icon color vs both?
- [ ] **OQ3** — Include P8 subtitle on first ship or defer?
