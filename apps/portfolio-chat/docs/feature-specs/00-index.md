# Feature registry — Portfolio Chat

Permanent map of features. Update **Status** when shipping; use **progress-tracker.md** for live session work.

| Feature | Spec | App UI (legacy → target) | API / BFF | Status |
|---------|------|--------------------------|-----------|--------|
| Design system (shared) | [01-design-system.md](./01-design-system.md) | `features/*` + `@repo/design-system` | — | Shipped (rules) |
| Chat UI | [02-chat-ui.md](./02-chat-ui.md) | `features/chat-ui/` (legacy shims: `components/chat`, `messages`, …) | — | Shipped |
| Sidebar & layout | [03-sidebar-layout.md](./03-sidebar-layout.md) | `components/collapsible-sidebar-layout.tsx` → `features/sidebar-layout/` | — | Shipped |
| Chat context | [04-chat-context.md](./04-chat-context.md) | `contexts/chat-context.tsx` → `features/chat-context/` | — | Shipped |
| Artifacts | [05-artifacts.md](./05-artifacts.md) | `artifact.tsx`, `featured-*`, `about.tsx`, etc. → `features/artifacts/` | — | Shipped |
| AI chat API & tools | [06-ai-chat.md](./06-ai-chat.md) | `features/ai-chat/` (thin `app/api/chat/route.ts`) | POST `/api/chat` | Shipped |
| Portfolio data | [07-portfolio-data.md](./07-portfolio-data.md) | `data/*` (stays at app root) | Tools read data | Shipped |
| Sidebar nav visibility | [09-sidebar-nav-visibility.md](./09-sidebar-nav-visibility.md) | `collapsible-sidebar-layout.tsx` → `features/sidebar-layout/` | — | In progress (P1–P2) |
| Agent documentation | — | `docs/**` | — | Shipped |

### Status legend

- **Not started** — spec written, no code
- **In progress** — active in tracker
- **Shipped** — live in production codebase
- **Spec TODO** — shipped code; spec file needs full requirements pass

### Adding a feature

1. Copy [99-feature-spec-template.md](./99-feature-spec-template.md) → `NN-<name>.md`
2. Add a row above
3. Update [progress-tracker.md](../context/progress-tracker.md)
