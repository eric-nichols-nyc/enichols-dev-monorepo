# Feature spec — [Feature name]

> Copy this file to `NN-<feature-name>.md`, fill every section, register in [00-index.md](./00-index.md).

## Goal

[One paragraph: what this feature delivers]

## User story

As a [visitor], I want [action] so that [outcome].

## Requirements

- [ ] R1 — …
- [ ] R2 — …

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| … | … |

## API

| Endpoint / tool | Method | Notes |
|-----------------|--------|-------|
| [none / POST /api/chat / tool name] | | |

## Proposed file structure

```
features/<name>/
  components/
  hooks/
  utils/
```

## Component responsibilities

| Component | Responsibility |
|-----------|----------------|
| | |

## Routes (thin)

| Route | File | Notes |
|-------|------|-------|
| | | |

## Out of scope

- …

## Acceptance criteria

- [ ] …
- [ ] `pnpm typecheck` passes
- [ ] Tracker + index updated on ship

## Implementation prompt (for agents)

1. Read this spec + [progress-tracker.md](../context/progress-tracker.md)
2. Implement only listed requirements
3. Update tracker and index Status when done
