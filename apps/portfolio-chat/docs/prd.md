# Portfolio Chat — product requirements (living)

Eric Nichols' AI portfolio: a single-page chat experience where visitors explore work, experience, tech stack, and bio through conversation and tool-driven UI.

## Users

- Recruiters and hiring managers skimming projects and experience
- Engineers evaluating stack and implementation quality
- Casual visitors who prefer chat over scrolling a static resume site
- **Eric (owner)** — internal admin for publishing new projects via Project Publisher (not a public CMS)

## Core flows

1. **Land** → sidebar + greeting; optional nav pills send preset prompts.
2. **Chat** → user message → streamed assistant reply via `/api/chat`.
3. **Tools** → model calls `show_about`, `show_projects`, `show_experience`, `show_tech_stack` → inline UI in message stream + artifact panel for detail.
4. **Clear** → sidebar logo clears session (`clearMessages`).
5. **Artifacts** → selecting featured project/experience opens side artifact with expand affordances.

### Internal (owner only)

6. **Project Publisher** → owner opens admin UI → supplies GitHub repo URL + metadata → AI generates draft knowledge markdown + `Project` object → preview → approve → writes `knowledge/projects/{id}.md` and `data/projects.ts` locally → owner commits to git manually. Spec: [project-publisher/00-index.md](./feature-specs/project-publisher/00-index.md).

## Functional requirements (high level)

| ID | Requirement | Status |
|----|-------------|--------|
| P1 | Stream text and tool results in one message thread | Shipped |
| P2 | Portfolio tools backed by `data/*` (no live CMS) | Shipped |
| P3 | About tool with optional word-by-word stream mode | Shipped |
| P4 | Responsive collapsible sidebar + mobile menu | Shipped |
| P5 | Suggestion pills for common prompts | Shipped |
| P6 | E2E coverage for about streaming (`e2e/about-streaming.spec.ts`) | Shipped |
| P7 | Project detail in artifact panel (click project card in chat) | Shipped |
| P7b | Multi-route detail chats per project/role | [TBD] |
| P8 | Rate limiting / abuse protection on `/api/chat` | Not implemented |
| P9 | Project Publisher — AI-assisted project authoring (internal admin) | Not started — [spec](./feature-specs/project-publisher/00-index.md) |

## Non-goals (current)

- User accounts and persisted chat history for visitors
- Public CMS or visitor-facing content editing
- Automatic git commit or deploy from Project Publisher (owner commits manually after local publish)
- Separate BFF service (API is Next.js route handler)

## Content source of truth

- `data/projects.ts`, `data/experience.ts`, `data/about.ts`, `data/resume.ts`, `data/tech.json` — structured UI and tool payloads
- `knowledge/**/*.md` — narrative corpus for Knowledge Assistant Q&A ([knowledge-assistant spec](./feature-specs/knowledge-assistant/02-knowledge-sources.md))
- Manual edits: update data files for facts; update `data/about.ts` prose when narrative changes
- **New projects:** Project Publisher generates both `knowledge/projects/{id}.md` and a `data/projects.ts` entry; owner reviews, publishes locally, then commits to version control

## Internal admin (Project Publisher)

| Constraint | Rule |
|------------|------|
| Audience | Owner only — not linked from public portfolio UI |
| Deployment | Local dev only for **publish**; `PROJECT_PUBLISHER_ENABLE_WRITES=true` required |
| Git | Owner commits manually after publish — no auto-commit or deploy |
| Auth | `ADMIN_SECRET` — Bearer on APIs; unlock flow + middleware on `/admin/*` ([spec](./feature-specs/project-publisher/architecture.md#authentication)) |
| Outputs | `knowledge/projects/{id}.md`, append to `data/projects.ts` |
| Out of scope for MVP | Auto-commit, auto-deploy, update existing projects, public CMS |

## Environment

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI model access (via `@repo/ai` / `@ai-sdk/openai`) |
| `AI_PROVIDER` | Set to `openai` (Google/Gemini not used) |
| `ADMIN_SECRET` | Owner-only admin routes (`/admin/*`, `/api/admin/*`); never commit |
| `PROJECT_PUBLISHER_ENABLE_WRITES` | Set to `true` in `.env.local` to allow local file publish |
| `GITHUB_TOKEN` | Optional for public repos; required for private; improves rate limits |
| `CHAT_MOCK_STREAM` | Optional mock streaming for dev/tests |

## Conflict resolution

Per-feature spec → `docs/context/architecture.md` + `code-standards.md` → this PRD. Reference docs never override specs.
