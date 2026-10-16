# UI context — Portfolio Chat

## Design system

Import shared primitives from **`@repo/design-system`**:

- **AI chat UI:** `@repo/design-system/components/ai-elements/*` (e.g. `prompt-input`, message primitives where used)
- **General UI:** `@repo/design-system/components/ui/*`

Do **not** copy shadcn components into `apps/portfolio-chat`. Request package changes only with explicit user approval.

## Theme

- Always-dark navy theme in `app/styles.css`, matched to Portfolio Chat V2: page `#10151d`, card `#171e28`, pale-blue accent `#b1caff`; `--signal` aliases the same brand color
- Fonts: V2's system sans stack and system monospace stack through Tailwind's `font-sans` / `font-mono`; no Google font fetches
- Use **semantic Tailwind tokens** and design-system variables — avoid ad-hoc hex in feature code
- `next-themes` available via design-system providers if extended

## Layout patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| Collapsible sidebar | `components/collapsible-sidebar-layout.tsx` | Desktop icon rail (label under icon) + mobile drawer |
| Chat column | `components/chat.tsx` | Input, messages, artifact slot |
| Message stream | `components/messages/`, `components/message.tsx` | Tool vs text parts |
| Detail overlay | `features/project-details/components/detail-overlay.tsx` | Stable fullscreen shared Dialog; one scrollable content column and Back to chat |
| Project questions | `features/project-details/components/project-questions.tsx` | Initially collapsed below the overview; independent inline Q&A with shared message/composer primitives |
| Project cards | `components/projects.tsx` | One vertical composition at every width: full-width preview, details, then link footer; skeletons match |
| Min-height streaming UX | See `docs/message-layout.md` (reference) | Active assistant message min-height |

## Motion

- `motion` package used for layout animations (see message-layout reference doc)
- The welcome message displays immediately with no entrance animation or fade, for all motion preferences. The user explicitly removed the entrance experiment. Greeting, section label, and topic cards remain mounted above later turns.
- Pointer-triggered chat turns use a 240ms WAAPI content-transform transition with `cubic-bezier(0.23, 1, 0.32, 1)` to preserve spatial continuity. Keyboard and reduced-motion actions place the turn immediately. Manual input interrupts at the visible position; streaming chunks do not restart motion.

## Icons

- `lucide-react` for sidebar and controls
- Brand: static `en.` wordmark with pale-blue dot in `features/branding/components/portfolio-mark.tsx`; existing brand wrappers reuse it for desktop and mobile
- Favicons: V2 artwork at the existing light/dark icon URLs

## Greeting and registered patterns

- Opening greeting is open and left-aligned: uppercase identity line, conversational two-part semantic heading with a pale-blue second line, and a short muted invitation. Four refreshed variants retain the existing random selection, stable across turns. No entrance animation, shine border, card background, or shadow.
- Welcome suggestions sit directly beneath the greeting in one persistent visual item above real message turns: four descriptive prompt cards, two desktop columns and one phone column. Cards are disabled while busy and reusable when ready. Detail views do not duplicate this welcome. The fixed composer owns only the main input; the jump-to-latest affordance is reserved for conversations with messages and hidden during motion.
- Theme, brand, and greeting patterns are recorded in [ui-registry.md](../../ui-registry.md). Preserve the original chat layout while matching V2's visual identity.

## Accessibility

- Semantic HTML in chat and sidebar
- Keyboard: focusable controls for nav, submit, clear
- [TBD] Full audit checklist for WCAG targets

## New UI checklist

1. Spec in `docs/feature-specs/`
2. Components under `features/<name>/components/` (or legacy path if migration pending)
3. Tokens from design-system / Tailwind theme — no random colors
