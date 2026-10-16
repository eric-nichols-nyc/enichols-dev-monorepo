# Portfolio Chat — UI registry

Updated 2026-10-16 using Imprint. This record covers the theme, brand, greeting, navigation, welcome prompt cards, conversation transition, project cards, and focused details/Q&A. Other legacy component patterns have not yet been registered.

## Theme

Source: `app/styles.css`. The original app uses semantic Tailwind utilities with Portfolio Chat V2's token values.

| Property | Pattern |
| --- | --- |
| Page / card / raised surface | `--background: #10151d` / `--card: #171e28` / `--secondary: #1d2734` |
| Primary text | `--foreground: #f0f3f7` |
| Secondary / muted text | `--text-secondary: #b4bfd0` / `--muted-foreground: #9caabd` |
| Brand and focus | `--primary`, `--signal`, `--ring`: `#b1caff` |
| Filled control text | `--primary-foreground: #101c34` |
| Selection | `--accent: #23334c`, `--accent-foreground: #e8effc` |
| Border / input | `--border: #2b3646`, `--input: #34435a` |
| Sidebar | Card surface, foreground text, accent selection, standard border |
| Body typography | System sans, 15px / 1.65, -0.15px tracking |
| Monospace | System monospace stack |

## Portfolio mark

File: `features/branding/components/portfolio-mark.tsx`.

| Property | Class / pattern |
| --- | --- |
| Background / border / shadow | None |
| Text | `font-sans text-[29px] font-semibold leading-none tracking-[-2.5px] text-foreground` |
| Accent | Dot uses `text-primary` |
| Accessibility | Mark is decorative; surrounding button/link supplies its accessible name |
| Interaction | Desktop clear-chat button has a 44px target and visible ring focus; native keyboard activation |

Existing `GreetingButton` and `SidebarLogo` wrappers reuse this mark. No lightning icon, animated shine, or glow. Favicons reuse the V2 SVG artwork at the existing public icon URLs.

## Welcome message and greeting

Files: `features/chat-ui/components/welcome-message.tsx` (persistent composition), `greeting.tsx` (copy and typography).

| Property | Class / pattern |
| --- | --- |
| Surface / border / radius / shadow | None; open composition |
| Alignment | `text-left` |
| Identity line | `font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-primary` |
| Heading | Semantic `h1`; `text-3xl sm:text-4xl font-semibold leading-[1.15] tracking-tight`; first line `text-foreground`, second line `text-primary` |
| Body | `mt-4 text-[15px] leading-7 text-muted-foreground` |
| Spacing | `py-6 sm:py-10`, 16px between identity, heading, and body |
| Motion | None; display immediately |
| Reduced motion | Same immediate display |

Four warm, conversational greeting variants live in `features/chat-ui/data/greeting-variants.ts`; each pairs a heading with an accent line and short invitation. Preserve the existing random picker. `WelcomeMessage` keeps the chosen greeting mounted above real turns, separate from AI history.

The greeting, section label, and four topic cards display immediately as one message. The user explicitly removed the unsuccessful entrance experiment; its classes, tokens, and keyframes are removed. Keep the welcome static on initial display, sends, and reset.

## Sidebar navigation

File: `components/app-sidebar-shell.tsx`.

| Property | Class / pattern |
| --- | --- |
| Surface | `bg-sidebar` |
| Border | `border-sidebar-r`, 1px sidebar border |
| Inactive item | `bg-muted/30 text-muted-foreground`; muted/foreground hover |
| Active item | `bg-accent text-accent-foreground` |
| Radius and spacing | `rounded-lg`; desktop rail `px-1 py-2 gap-1`, drawer `px-3 py-2 gap-3` |

The original icon rail, mobile drawer, social links, input, and artifact layout remain their established patterns.

## Welcome prompt cards

File: `features/chat-ui/components/suggestions.tsx`.
Last updated: 2026-10-16. Source: approved Paper prompt-card direction.

| Property | Class / pattern |
| --- | --- |
| Primitive | Shared `Button`, `variant="outline"`, native `type="button"` |
| Surface | `bg-card`; featured project prompt uses `bg-secondary` |
| Border | 1px `border-border`; featured uses `border-primary/35` |
| Radius / shadow | `rounded-[14px]`, `shadow-none` |
| Title | `text-base font-medium leading-[22px] text-foreground` |
| Description | `text-sm leading-[22px] text-[var(--text-secondary)]` |
| Section label | `text-sm font-normal text-muted-foreground` |
| Spacing | `p-5`, `gap-3.5`, header `gap-3`, label `mb-4` |
| Icon treatment | `rounded-lg bg-accent text-primary`; decorative icons |
| Hover | `border-primary/50 bg-secondary`; arrow uses `text-primary` |
| Keyboard focus | Primary border, 2px ring with 2px background offset |
| Motion | No entrance animation; 150ms color/transform feedback, motion-safe 0.99 press scale, reduced-motion feedback transitions off |

**Pattern notes:** These full-card actions remain in the persistent welcome above the conversation. They are disabled while submitting/streaming and reusable when ready. Titles supply accessible button names; descriptions use `aria-describedby`. Exact semantic surface utilities use Tailwind's important modifier to override the shared outline Button's dark-specific surface styles without editing the shared package. Project names come from the published data export. Contextual chat follow-ups retain their existing styling.

## Welcome conversation transition

Files: `features/chat-ui/components/messages/use-chat-messages-scroll.ts`, `messages/constants.ts`, and `features/chat-ui/lib/turn-transition.ts`.

| Property | Pattern |
| --- | --- |
| Purpose | Spatial continuity from the welcome or an earlier turn into a new turn |
| Initial load | Greeting and cards display immediately, with no entrance animation |
| Animated property | WAAPI `transform: translateY(...)` on the content column, returning to zero |
| Duration / curve | 240ms / `cubic-bezier(0.23, 1, 0.32, 1)` |
| Trigger | New user-turn key after pointer input; streaming chunks never restart it |
| Keyboard / reduced motion | Immediate scroll placement |
| Interruption | Manual input cancels and preserves the current visible position; newer turns retarget from there |
| Reset | Cancel motion and return to the welcome immediately |

The viewport owns scrolling and the content column owns the turn transform. Keep existing surface, type, border, and card feedback patterns. The welcome is UI only; focused details do not duplicate the main chat. These turn-motion values are implemented and unit checked; browser feel review is deferred by the user's request.

## Chat reset button

File: `features/chat-ui/components/chat.tsx`.
Last updated: 2026-10-16.

| Property | Class / pattern |
| --- | --- |
| Primitive / surface | Shared `Button`, `variant="secondary"`, `size="icon"`; dark secondary background with `text-foreground` icon |
| Radius / shadow | `rounded-xl`, `shadow-none` |
| Accessible label | Icon-only; `aria-label="Reset chat"` and matching native hover title |
| Icon | Decorative `RotateCcwIcon` |
| Focus | `ring-2 ring-ring ring-offset-2 ring-offset-background` |
| Motion | Color-only 150ms transition; reduced-motion transitions off |

**Pattern notes:** Always visible at the right of the main chat's transparent top action row, outside message scrolling, with no divider beneath the row. Preserve its 44px minimum touch target. Clearing also stops the shared request and clears the local draft/detail selection. Project Q&A has its own local Clear questions action.

## Project cards

File: `components/projects.tsx` (`ProjectCard` and `ProjectsSkeleton`).

| Property | Class / pattern |
| --- | --- |
| Surface / border | `bg-muted/10`, `border border-border/70`, clipped preview |
| Title | `font-semibold text-foreground leading-snug tracking-tight`; `text-sm sm:text-base` |
| Summary | Muted text with `leading-snug`; supporting sentence uses `leading-relaxed` |
| Details spacing | `px-3 py-3 sm:px-4 sm:py-4` |
| Link footer | Horizontal icon links; `border-t border-border/40`, `gap-2`, matching horizontal padding |
| Focus / hover | Existing visible outline; color feedback on selectable cards |
| Icons | Decorative GitHub/external-link icons; each link has a descriptive accessible name |
| Expand affordance | Selectable previews show a decorative `Maximize2` at `top-3 right-3`, inside `size-10 rounded-lg border border-border/70 bg-background/90 text-foreground shadow-sm`; always visible, with the existing card as its action target |

Use one vertical composition on desktop and mobile: full-width preview, details, then links. The skeleton follows the same composition. Keep project selection and external-link behavior, including independent keyboard activation of links. Browser visual checks are deferred; this pattern records the implemented layout.

## Focused detail overlay and project questions

Files: `features/project-details/components/detail-overlay.tsx`, `project-detail.tsx`, and `project-questions.tsx`.
Last updated: 2026-10-16.

| Property | Class / pattern |
| --- | --- |
| Overlay primitive / surface | Shared `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`; theme `bg-background` |
| Header / spacing | `border-b border-border`, `px-4 py-3`; shared ghost Back to chat button |
| Q&A surface | `rounded-xl border border-border bg-card` |
| Q&A typography | `text-sm text-muted-foreground` supporting copy; `text-sm` message content |
| Q&A spacing | `p-4`, content `gap-4 px-4 pb-4`, question choices `gap-2` |
| Controls | Shared ghost/outline buttons, Collapsible trigger, PromptInput, Message/MessageContent/MessageResponse |
| Icons | Decorative message/back/chevron icons using component icon slots |
| Error | Generic readable message with `role="alert"`, `text-sm text-destructive` |
| Motion | No detail content entrance, expanding dimensions, or Q&A entrance animation |

**Pattern notes:** Present a focused detail view with one content scroll, accessible close/back controls, and focus restoration without moving the main chat. Place the initially collapsed project Q&A below the overview. Keep answers inline and project-specific; preserve the local session on collapse and discard/abort on close. Main conversation state remains independent. Unit and compiled CSS checks pass; visual/browser verification is deferred.
