# Feature spec — Design system (shared)

Applies to **all** features in Portfolio Chat.

## Goal

Consistent UI built on `@repo/design-system` with predictable folder layout for new work under `features/`.

## Folder layout (new features)

```
features/<feature-name>/
  components/     # Presentational UI
  hooks/          # use-* hooks (client)
  utils/          # Pure helpers
  lib/            # Feature-local non-UI logic (optional)
```

## Legacy layout (until migrated)

| Area | Current path |
|------|----------------|
| Shared chat UI | `components/` |
| App hooks | `hooks/` |
| AI | `lib/ai/` |
| Session | `contexts/` |
| Content | `data/` (remains at app root) |

## Import rules

```typescript
// UI primitives
import { Button } from "@repo/design-system/components/ui/button";

// AI elements (chat input, etc.)
import { PromptInput } from "@repo/design-system/components/ai-elements/prompt-input";

// App code
import { usePortfolioChat } from "@/contexts/chat-context";
// Future:
import { ChatMessages } from "@/features/chat-ui/components/chat-messages";
```

## Tokens & styling

- Use Tailwind semantic colors / design-system CSS variables
- No one-off hex in feature components
- Dark theme consistent with `app/styles.css`

## Component boundaries

- **Presentational:** receive data via props; no direct `useChat`
- **Container/client:** may use `usePortfolioChat` or feature hooks
- **Data:** read from `data/` or tool output — do not duplicate project lists in components

## Routes

- `app/page.tsx` stays thin: provider + layout only
- No business logic in `app/` beyond API route orchestration

## Out of scope

- Adding or forking shadcn components inside this app
- Editing `packages/design-system` without user approval

## Acceptance criteria

- [ ] New feature code lives under `features/<name>/` unless spec documents legacy exception
- [ ] UI imports from `@repo/design-system` paths only
- [ ] Hooks extracted when logic is reused or clutters a component file
