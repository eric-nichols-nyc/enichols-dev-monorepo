# UI context — Portfolio Chat

## Design system

Import shared primitives from **`@repo/design-system`**:

- **AI chat UI:** `@repo/design-system/components/ai-elements/*` (e.g. `prompt-input`, message primitives where used)
- **General UI:** `@repo/design-system/components/ui/*`

Do **not** copy shadcn components into `apps/portfolio-chat`. Request package changes only with explicit user approval.

## Theme

- Dark-first portfolio aesthetic (`app/styles.css`, layout backgrounds)
- Use **semantic Tailwind tokens** and design-system variables — avoid ad-hoc hex in feature code
- `next-themes` available via design-system providers if extended

## Layout patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| Collapsible sidebar | `components/collapsible-sidebar-layout.tsx` | Desktop collapse + mobile drawer |
| Chat column | `components/chat.tsx` | Input, messages, artifact slot |
| Message stream | `components/messages/`, `components/message.tsx` | Tool vs text parts |
| Artifact panel | `components/artifact.tsx` | Featured project/experience detail |
| Min-height streaming UX | See `docs/message-layout.md` (reference) | Active assistant message min-height |

## Motion

- `motion` package used for layout animations (see message-layout reference doc)

## Icons

- `lucide-react` for sidebar and controls

## Accessibility

- Semantic HTML in chat and sidebar
- Keyboard: focusable controls for nav, submit, clear
- [TBD] Full audit checklist for WCAG targets

## New UI checklist

1. Spec in `docs/feature-specs/`
2. Components under `features/<name>/components/` (or legacy path if migration pending)
3. Tokens from design-system / Tailwind theme — no random colors
