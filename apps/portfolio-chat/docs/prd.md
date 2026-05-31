# Portfolio Chat — product requirements (living)

Eric Nichols' AI portfolio: a single-page chat experience where visitors explore work, experience, tech stack, and bio through conversation and tool-driven UI.

## Users

- Recruiters and hiring managers skimming projects and experience
- Engineers evaluating stack and implementation quality
- Casual visitors who prefer chat over scrolling a static resume site

## Core flows

1. **Land** → sidebar + greeting; optional nav pills send preset prompts.
2. **Chat** → user message → streamed assistant reply via `/api/chat`.
3. **Tools** → model calls `show_about`, `show_projects`, `show_experience`, `show_tech_stack` → inline UI in message stream + artifact panel for detail.
4. **Clear** → sidebar logo clears session (`clearMessages`).
5. **Artifacts** → selecting featured project/experience opens side artifact with expand affordances.

## Functional requirements (high level)

| ID | Requirement | Status |
|----|-------------|--------|
| P1 | Stream text and tool results in one message thread | Shipped |
| P2 | Portfolio tools backed by `data/*` (no live CMS) | Shipped |
| P3 | About tool with optional word-by-word stream mode | Shipped |
| P4 | Responsive collapsible sidebar + mobile menu | Shipped |
| P5 | Suggestion pills for common prompts | Shipped |
| P6 | E2E coverage for about streaming (`e2e/about-streaming.spec.ts`) | Shipped |
| P7 | Multi-route detail chats per project/role | [TBD] |
| P8 | Rate limiting / abuse protection on `/api/chat` | [TBD] |

## Non-goals (current)

- User accounts and persisted chat history
- CMS or admin UI for content edits (content is TypeScript in `data/`)
- Separate BFF service (API is Next.js route handler)

## Content source of truth

- `data/projects.ts`, `data/experience.ts`, `data/about.ts`, `data/resume.ts`, `data/tech.json`
- Update data files for facts; update `data/about.ts` prose when narrative changes

## Environment

| Variable | Purpose |
|----------|---------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Model access (via `@repo/ai`) |
| `CHAT_MOCK_STREAM` | Optional mock streaming for dev/tests |

## Conflict resolution

Per-feature spec → `docs/context/architecture.md` + `code-standards.md` → this PRD. Reference docs never override specs.
