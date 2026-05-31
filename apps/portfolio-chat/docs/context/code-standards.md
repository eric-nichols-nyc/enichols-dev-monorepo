# Code standards — Portfolio Chat

## TypeScript

- Strict mode (`tsconfig` extends `@repo/typescript-config/nextjs.json`)
- Path alias: `@/*` → app root
- No `any` — use `unknown` + narrowing
- Export types for public props and data shapes in `data/`

## React / Next.js

- Default to Server Components in `app/`
- `"use client"` for: `useChat`, context, hooks, motion, browser APIs
- One provider at page boundary: `PortfolioChatProvider` in `app/page.tsx`
- Colocate feature hooks as `use-*` (see `.cursor/rules/prefers-hooks.mdc`)

## Styling

- Tailwind utility classes only (no CSS modules in this app)
- `app/styles.css` for global tokens / base
- Match existing spacing: `gap-4`, `gap-6`, `p-4`, `max-w-*` patterns in chat layout

## API route (`app/api/chat/route.ts`)

- Validate/transform messages defensively
- Keep route as orchestrator; extract new AI logic to `lib/ai/` or `features/ai-chat/`
- Log server errors: `console.error('[API Error]:', error)` — generic message to client
- Tool definitions: Zod parameters, clear descriptions for the model

## Data layer

- All portfolio content in `data/` as typed TS/JSON
- `about` narrative derived from `resume` — keep facts in resume, prose in `about.ts`

## Imports order

1. React / Next
2. Third-party
3. `@repo/*`
4. `@/` internal (features → components → lib → data)

## Testing

- Unit: Vitest under `__tests__/`
- E2E: Playwright in `e2e/`
- Run `pnpm test:run` / `pnpm test:e2e` when changing streaming or tools

## Git / docs

- Update `progress-tracker.md` after meaningful changes
- Update feature spec + `00-index.md` when shipping or scoping new work
