# Project Publisher — Feature specs

**Status:** Spec aligned — ready to implement  
**Registry:** [Feature index](../00-index.md)

Internal admin workflow: supply a GitHub repo URL and metadata → generate `knowledge/projects/{id}.md` and a `data/projects.ts` entry → preview → publish after approval.

## Spec documents

| Doc | Purpose |
|-----|---------|
| [PRD.md](./PRD.md) | Product requirements, user story, acceptance criteria |
| [architecture.md](./architecture.md) | System design, routes, workflow, state |
| [implementation.md](./implementation.md) | Staged build plan (16 stages) |

## Related features

| Feature | Relationship |
|---------|--------------|
| [07-portfolio-data](../07-portfolio-data.md) | Publish target: `data/projects.ts` |
| [Knowledge Assistant](../knowledge-assistant/02-knowledge-sources.md) | Publish target: `knowledge/projects/*.md` |

## Pre-implementation alignment checklist

Resolve before writing code:

1. [x] Register in [feature index](../00-index.md)
2. [x] Update [docs/prd.md](../../prd.md) — internal admin UI is in scope
3. [x] Orchestration: **AI SDK typed pipeline for MVP**; LangGraph deferred to Phase 2
4. [x] Model provider: **OpenAI only** via Vercel AI SDK (`@ai-sdk/openai` / `@repo/ai/lib/models` with `AI_PROVIDER=openai`)
5. [x] Auth: **`ADMIN_SECRET`** env var — Bearer token on APIs; middleware + unlock flow on `/admin/*`
6. [x] Publish model: **local filesystem writes only** + owner **manual git commit** (blocked on Vercel)
7. [x] GitHub README fetch: **GitHub REST API** in `lib/read-github-readme.ts` (not Cursor MCP)
8. [x] Code layout: `features/project-publisher/{components,hooks,utils,lib}` per [01-design-system](../01-design-system.md)

**All alignment steps complete.** Begin [implementation.md](./implementation.md) Stage 1.

## Code layout (MVP)

Per [01-design-system](../01-design-system.md). **No `src/` folder.** Specs stay in `docs/` only.

```text
features/project-publisher/
  components/
    admin-secret-gate.tsx       # unlock form (client)
    admin-unlock-page.tsx       # full unlock screen (client)
    project-publisher-page.tsx  # composes form + preview (client)
    project-publish-form.tsx    # repo URL + metadata fields
    draft-preview.tsx           # markdown + Project JSON preview
    publish-success.tsx         # post-publish git instructions
  hooks/
    use-admin-auth.ts           # unlock state, Bearer header for fetch
    use-generate-draft.ts       # POST /api/admin/projects/generate
    use-publish-project.ts      # POST /api/admin/projects/publish
  utils/
    parse-github-repo-url.ts    # pure URL → { owner, repo }
  lib/                          # server-safe; imported by API routes + pipeline
    schema.ts                   # Zod Project + request body schemas
    prompts.ts
    verify-admin-secret.ts
    ensure-local-publish.ts
    read-github-readme.ts
    generate-knowledge-markdown.ts
    generate-project-object.ts
    run-generate-pipeline.ts
    write-knowledge-file.ts
    update-projects-file.ts

app/                            # thin routes — delegate to features/project-publisher/lib
  admin/...
  api/admin/...

middleware.ts                   # app root — admin auth matcher (not under features/)
```

### Boundaries

| Layer | Location | Rule |
|-------|----------|------|
| UI | `features/project-publisher/components/` | **All admin UI here** — not `components/` at app root, not inline in `app/admin/` |
| Client logic | `features/project-publisher/hooks/` | `use-*` only; call admin APIs with Bearer |
| Pure helpers | `features/project-publisher/utils/` | No React, no `fs`, no env secrets |
| Server logic | `features/project-publisher/lib/` | Pipeline, GitHub fetch, Zod, file writers, auth verify |
| Routes | `app/admin/**/page.tsx`, `app/api/admin/**` | **Thin only** — import feature components / call `lib/`; no form or preview markup in routes |
| Content outputs | `knowledge/`, `data/` | **App root** — not under `features/` |
| Specs | `docs/feature-specs/project-publisher/` | Never copy into feature folder |

**Admin pages pattern:**

```tsx
// app/admin/projects/new/page.tsx — thin shell
import { ProjectPublisherPage } from "@/features/project-publisher/components/project-publisher-page";

export default function Page() {
  return <ProjectPublisherPage />;
}
```

### Import examples

```typescript
import { runGeneratePipeline } from "@/features/project-publisher/lib/run-generate-pipeline";
import { useGenerateDraft } from "@/features/project-publisher/hooks/use-generate-draft";
import { ProjectPublishForm } from "@/features/project-publisher/components/project-publish-form";
```

No barrel `index.ts` re-exports — import from concrete files ([no-barrel-indexes](../../../.cursor/rules/no-barrel-indexes.mdc)).

## Architecture decisions

| Decision | MVP | Phase 2+ |
|----------|-----|----------|
| Orchestration | Typed pipeline in `lib/run-generate-pipeline.ts` | LangGraph when branching/retries needed |
| Model | OpenAI (`OPENAI_API_KEY`, `AI_PROVIDER=openai`) | Same |
| GitHub | [GitHub REST API](#github-readme-fetch) — `GET /repos/{owner}/{repo}/readme` | Fallback sources in Phase 2 |
| Auth | `ADMIN_SECRET` + Bearer header / httpOnly cookie | Same (no user accounts) |
| Publish | Local workspace writes only; manual `git commit` | Phase 3: optional PR creation |

## Publish model (MVP)

Content lives in git — Project Publisher **writes files to the local workspace**, not to a CMS or remote store.

| Step | What happens |
|------|----------------|
| 1. Generate | `POST /generate` returns draft JSON only — **no files written** |
| 2. Preview | Owner reviews markdown + Project object in admin UI |
| 3. Publish | `POST /publish` writes `knowledge/projects/{id}.md` and updates `data/projects.ts` **on disk** |
| 4. Verify | Owner runs `pnpm dev`, checks project in chat + artifact |
| 5. Commit | Owner runs `git add`, `git commit`, `git push` manually |

### Write guards

| Condition | Publish behavior |
|-----------|------------------|
| `PROJECT_PUBLISHER_ENABLE_WRITES=true` in `.env.local` | Writes allowed (local dev) |
| `VERCEL=1` or unset enable flag | **403** — "Publish only available in local dev" |
| Write failure mid-flight | Roll back both files; no partial publish |

Generate may still run on preview deploys (OpenAI cost only); **publish is local-only**.

See [architecture.md](./architecture.md#publish-model).

## Auth (MVP)

| Piece | Rule |
|-------|------|
| Env | `ADMIN_SECRET` in `.env.local` only — never commit |
| Disabled | If unset, `/admin/*` and `/api/admin/*` return **404** (feature hidden) |
| API routes | Require `Authorization: Bearer <ADMIN_SECRET>` → **401** if missing or wrong |
| Admin UI | Middleware on `/admin/*`; unlock via `POST /api/admin/unlock` sets httpOnly cookie |
| Client fetches | Admin hooks send Bearer header on generate/publish calls |

See [architecture.md](./architecture.md#authentication).

## GitHub README fetch (MVP)

| Piece | Rule |
|-------|------|
| Mechanism | Server-side `fetch` to GitHub REST API — **not** Cursor MCP |
| Module | `features/project-publisher/lib/read-github-readme.ts` |
| URL parse | `utils/parse-github-repo-url.ts` — supports `github.com/owner/repo` URLs |
| Env | `GITHUB_TOKEN` optional for public repos; **required** for private repos |
| Success | Returns README markdown string → pipeline state |
| No README | Stop pipeline; error: `README.md not found.` |
| Repo 404 / auth | Stop pipeline; error: `Unable to access repository.` |

See [architecture.md](./architecture.md#github-readme-fetch).

## Planned surfaces

| Surface | Path |
|---------|------|
| Admin unlock route | `app/admin/unlock/page.tsx` → imports `components/admin-unlock-page.tsx` |
| Admin UI route | `app/admin/projects/new/page.tsx` → imports `components/project-publisher-page.tsx` |
| Generate API | `POST /api/admin/projects/generate` |
| Publish API | `POST /api/admin/projects/publish` |
| Feature code | `features/project-publisher/` |
