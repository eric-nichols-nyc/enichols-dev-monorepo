# Feature spec — Sidebar & layout

**Status:** Shipped

## Goal

Provide the app shell: desktop icon-rail sidebar, mobile drawer, header social links, and main chat column—wired to chat actions (nav presets, clear session).

## User story

As a visitor, I want quick section prompts from the sidebar and social links in the header, on desktop and mobile, without losing my place in the chat.

## Requirements

### Layout shell

- [x] **R1** — Root layout: `h-dvh` flex row — sidebar + main column (`collapsible-sidebar-layout.tsx`)
- [x] **R2** — Main column: sticky header + flex child containing `<Chat />`
- [x] **R3** — Page wiring: `app/page.tsx` wraps `PortfolioChatProvider` → `CollapsibleSidebarLayout`

### Desktop sidebar (`md:flex`)

- [x] **R4** — Fixed rail width `5.5rem` (`SIDEBAR_WIDTH` in `constants.ts`); no expand/collapse toggle
- [x] **R5** — Nav items show icon with label text stacked below
- [x] **R6** — Brand row is logo-only (name + subtitle remain in the mobile drawer)
- [x] **R7** — Nav list from `NAV_ITEMS` — each item sends a preset via `sendMessage({ text: message, files: [] })`

| id | Label | Preset message |
|----|-------|----------------|
| projects | Projects | "Show projects" |
| about | About | "About Me" |
| experience | Experience | "Show my work experience" |
| tech | Tech | "Tech stack" |

- [x] **R9** — `nav` with `aria-label="Navigation"`

### Mobile (`md:hidden`)

- [x] **R10** — Hamburger in header opens fixed `w-64` drawer (`translateX` animation)
- [x] **R11** — Backdrop overlay closes drawer on click
- [x] **R12** — Close button in drawer; nav click calls `handleNavClick` and sets `mobileOpen` false

### Brand & clear chat

- [x] **R13** — `SidebarBrand`: logo (`GreetingButton`); desktop rail is logo-only; click/keyboard triggers `onClear` → `clearMessages()`
- [x] **R14** — `aria-label="Clear chat and start fresh"`
- [x] **R15** — Mobile drawer header uses `SidebarLogo` + "Eric Nichols" (clear via brand only on desktop sidebar)

### Header social links

- [x] **R16** — `socialLinks` in `constants.ts`: GitHub, Instagram, LinkedIn — external `Link` with `rel="noopener noreferrer"`, `target="_blank"`, `aria-label`
- [x] **R17** — Same URLs as about tool social links in `lib/ai/tools/about.ts` (keep in sync when changing)

### Dependencies

- [x] **R18** — Uses `usePortfolioChat()` for `sendMessage` and `clearMessages` (see 04-chat-context)

### Not yet implemented

- [ ] **R19** — Migrate to `features/sidebar-layout/`
- [x] **R20** — Active nav state / highlight for current section ([09-sidebar-nav-visibility.md](./09-sidebar-nav-visibility.md) P3)

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `collapsible-sidebar-layout.tsx`, `sidebar-brand.tsx`, `sidebar-logo.tsx`, `constants.ts` (nav/social) | Message rendering, artifact panel, API |
| Target: `features/sidebar-layout/` | `packages/design-system` edits |

## File structure

```
components/
  collapsible-sidebar-layout.tsx   # Shell
  sidebar-brand.tsx
  sidebar-logo.tsx
  constants.ts                     # NAV_ITEMS, widths, socialLinks
app/page.tsx                       # Provider + layout mount
```

## Acceptance criteria

- [x] Desktop rail shows icon + label stacked; nav sends correct presets
- [x] Mobile menu opens/closes; nav closes drawer after click
- [x] Brand control clears chat session
- [x] Social links open correct external profiles
- [ ] R19 when migration scheduled

## Implementation prompt

Changing nav presets requires updating `NAV_ITEMS` and verifying model tool routing in `06-ai-chat` / system prompt still matches user expectations.
