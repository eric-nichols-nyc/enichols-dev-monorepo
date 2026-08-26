# Memory — Portfolio Chat / Project Publisher

Location: `apps/portfolio-chat/memory.md` (app-scoped — not repo root)

Last updated: 2026-07-06

## What was built

**Stages 5–9 complete this session. Generate draft works end-to-end. Publish not implemented.**

### Stage 5 — Generate endpoint

- `app/api/admin/projects/generate/route.ts` — POST; validates body, `verifyAdminSecret`, calls `runGeneratePipeline()`
- `hooks/use-generate-draft.ts` — POSTs to generate API with error handling

### Stage 6 — README retrieval

- `utils/parse-github-repo-url.ts` — owner/repo from GitHub URLs (tree paths ignored)
- `lib/read-github-readme.ts` — GitHub REST `/repos/{owner}/{repo}/readme`; error mapping; optional `GITHUB_TOKEN`
- Unit tests: `parse-github-repo-url.test.ts`, `read-github-readme.test.ts`

### Stage 7 — Generate pipeline skeleton

- `lib/run-generate-pipeline.ts` — orchestrates README → markdown → project → Zod validation; early exit on errors
- Placeholder generators replaced in Stages 8–9

### Stage 8 — Markdown generation

- `lib/prompts.ts` — `getKnowledgeMarkdownSystemPrompt()`, `buildKnowledgeMarkdownUserPrompt()`, `stripMarkdownCodeFence()`
- `lib/generate-knowledge-markdown.ts` — OpenAI via `generateText` + `models.chat` from `@repo/ai`
- Requires `OPENAI_API_KEY`

### Stage 9 — Project object generation

- `lib/schema.ts` — `projectGenerationSchema` (LLM fields only)
- `lib/prompts.ts` — `getProjectObjectSystemPrompt()`, `buildProjectObjectUserPrompt()`
- `lib/generate-project-object.ts` — `generateObject` + `mergeAdminProjectFields()` for admin overrides
- `utils/repo-name-to-project-id.ts` — shared slug helper
- Unit tests: `generate-knowledge-markdown.test.ts`, `generate-project-object.test.ts`, `run-generate-pipeline.test.ts` (37 project-publisher tests passing)

### Prior sessions (still in place)

- Stages 1–4, 4b: feature foundation, admin auth, schema, admin page + sidebar nav
- `app/admin/projects/new/page.tsx`, form with gallery, draft preview, approve button (publish stub)

## Decisions made

| Decision | Choice |
|----------|--------|
| GitHub README | Root default-branch README only via `/readme` API — **no subfolder README paths** (user deferred; e.g. monorepo `apps/app/README.md` not supported) |
| Markdown generation | `generateText` — OpenAI only |
| Project object | `generateObject` + `projectGenerationSchema`; admin fields merged after LLM (never LLM-overwritten) |
| Admin overrides | `image`, `gallery`, `liveUrl` → `url`, `position`, `published` applied in `mergeAdminProjectFields()` |
| Publish | Still local-only model; **not built yet** — `use-publish-project` throws "Not implemented" |
| memory.md | `apps/portfolio-chat/memory.md` |

## Problems solved

- GitHub 404 on readme: secondary repo-exists check distinguishes "README not found" vs "unable to access repository"
- Pipeline test isolation: mock `generate-knowledge-markdown` and `generate-project-object` in `run-generate-pipeline.test.ts`
- URL parser ignores `/blob/main/apps/app/README.md` path segments — only `owner/repo` used

## Current state

- **Generate draft:** Works — unlock admin → `/admin/projects/new` → GitHub repo URL + image path → preview shows LLM markdown + structured Project JSON
- **Publish:** Not implemented (Stages 12–13)
- **Validation:** Basic Zod in pipeline; Stage 10 polish not done
- **Tests:** 37 project-publisher unit tests pass; `pnpm typecheck` passes
- **Env (names only):** `OPENAI_API_KEY`, `ADMIN_SECRET`, `PROJECT_PUBLISHER_ENABLE_WRITES`, `GITHUB_TOKEN`, `AI_PROVIDER=openai`

## Next session starts with

1. `/remember restore` — read `apps/portfolio-chat/memory.md`
2. Read `docs/context/progress-tracker.md` (goal: Stage 10)
3. Either **Stage 10** (validation polish) or skip to **Stage 12** (`POST /api/admin/projects/publish`) if publish path is priority
4. Stage 12 needs: `ensureLocalPublish()`, `write-knowledge-file.ts`, `update-projects-file.ts`, wire `use-publish-project`
5. `pnpm typecheck` + project-publisher tests after changes; `/remember save`

## Open questions

- Stage 10 vs jump to publish — user preference
- Optional README subfolder path field — explicitly **not now** (monorepo apps)
- Hosting URL and analytics (portfolio-wide TBD)
