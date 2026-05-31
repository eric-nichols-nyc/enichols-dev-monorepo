# Features

New domain code goes here: `features/<name>/` with `components/`, `hooks/`, and `utils/`.

## Migrated

| Feature | Path | Legacy shims |
|---------|------|----------------|
| Chat UI | [`chat-ui/`](./chat-ui/) | `@/components/chat`, `message`, `messages`, `suggestions`, `greeting`, `thinking-message` |

Before creating a new folder:

1. Add a spec under `docs/feature-specs/`
2. Register in `docs/feature-specs/00-index.md`
3. Note work in `docs/context/progress-tracker.md`

Legacy code in `components/`, `lib/`, and `contexts/` migrates incrementally — see feature specs for target paths.
