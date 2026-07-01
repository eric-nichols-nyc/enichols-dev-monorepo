# Memory — Portfolio Chat / Project Publisher

Location: `apps/portfolio-chat/memory.md` (app-scoped — not repo root)

Last updated: 2026-07-01

## What was built

**Stages 1–3 complete. Stage 4 next. All changes uncommitted.**

### Stage 1 — Feature foundation (complete)

- `features/project-publisher/{components,hooks,utils,lib}` — 20 files with typed stubs
- `utils/parse-github-repo-url.ts` — working GitHub URL parser
- `lib/verify-admin-secret.ts`, `lib/ensure-local-publish.ts`, pipeline stubs
- UI skeletons: `project-publisher-page.tsx`, `project-publish-form.tsx`, `draft-preview.tsx`, `publish-success.tsx`, `admin-unlock-page.tsx`, `admin-secret-gate.tsx`
- Hook stubs: `use-generate-draft.ts`, `use-publish-project.ts`

### Stage 2 — Admin auth (complete)

- `middleware.ts` — guards `/admin/*` and `/api/admin/*`; 404 when `ADMIN_SECRET` unset; 401 on bad token for APIs; redirects to `/admin/unlock?next=…`
- `app/api/admin/unlock/route.ts` — POST unlock; sets httpOnly cookie via `buildAdminAuthCookieHeader`
- `app/admin/unlock/page.tsx` — thin shell → `AdminUnlockPage`
- `hooks/use-admin-auth.ts` — real unlock flow: POST to unlock API, stores secret in ref, `getAuthHeaders()` for Bearer

### Stage 3 — Project schema (complete)

- `lib/schema.ts` — `projectSchema` + `projectMetricSchema` mirroring `Project` / `ProjectMetric` from `data/projects`
- `ValidatedProject` / `ValidatedProjectMetric` types
- `publishRequestBodySchema` uses `projectSchema`
- Request schemas: `generateRequestBodySchema`, `unlockRequestBodySchema`

### Stage 4 — partial (not started on route)

Components exist from Stage 1 but Stage 4 deliverable incomplete:

- **Missing:** `app/admin/projects/new/page.tsx` (thin shell → `ProjectPublisherPage`)
- **Partial:** `project-publish-form.tsx` has repo URL, image, live URL, position, published — **gallery field not yet in form**
- **Stub:** `use-generate-draft.ts` returns `{ errors: ["Not implemented"] }` — wired in page but no API call yet (Stage 5)

### Docs updated

- `docs/context/progress-tracker.md` — Stage 3 → Completed; Stage 4 current goal
- `docs/feature-specs/project-publisher/implementation.md` — Stages 1–3 checkboxes marked done

## Decisions made

| Decision | Choice |
|----------|--------|
| Feature name | **Project Publisher** (was `project-agent`) |
| Scope | `apps/portfolio-chat/` only |
| MVP orchestration | AI SDK typed pipeline — **not LangGraph** (Phase 2) |
| Model | **OpenAI only** (`AI_PROVIDER=openai`) — no Google/Gemini |
| Admin auth | `ADMIN_SECRET` — Bearer + httpOnly unlock cookie; 404 if unset |
| Publish | Local only (`PROJECT_PUBLISHER_ENABLE_WRITES=true`); block `VERCEL=1`; manual git commit |
| GitHub README | REST API — not Cursor MCP; optional `GITHUB_TOKEN` |
| Admin UI location | `features/project-publisher/components/` only |
| Admin routes | `app/admin/**/page.tsx` are **thin shells** |
| Code layout | `features/project-publisher/{components,hooks,utils,lib}` — no `src/`, no barrel indexes |
| memory.md | **`apps/portfolio-chat/memory.md`** |
| Agent workflow | One implementation **stage** per session + `/remember restore/save` |

## Problems solved

- Stage 2 middleware allows POST to `/api/admin/unlock` without prior auth; all other admin paths require cookie or Bearer
- Stage 3 schema uses `.strict()` and `satisfies z.ZodType<Project>` to stay aligned with `data/projects` types

## Current state

- **Project Publisher:** Stages 1–3 **shipped**; Stage 4 **next**
- **Tracker goal:** Stage 4 — admin page skeleton at `/admin/projects/new`
- **Visitor-facing app:** Unchanged; admin unlock works when `ADMIN_SECRET` is set in `.env.local`
- **Env (names only):** `OPENAI_API_KEY`, `ADMIN_SECRET`, `PROJECT_PUBLISHER_ENABLE_WRITES`, `GITHUB_TOKEN`, `AI_PROVIDER=openai`
- **`pnpm typecheck`:** passes (last verified after Stage 3)

## Next session starts with

1. `/remember restore` — read `apps/portfolio-chat/memory.md`
2. Read `docs/context/progress-tracker.md`
3. Implement **Stage 4:** `docs/feature-specs/project-publisher/implementation.md#stage-4--admin-page-skeleton`
   - Create thin route `app/admin/projects/new/page.tsx` → `ProjectPublisherPage`
   - Finish `project-publish-form.tsx` — add gallery field per spec
   - Ensure `project-publisher-page.tsx` composes form + preview + actions
   - Wire `use-generate-draft` for Generate button (stub OK until Stage 5 — shows loading/error states)
   - Verify page reachable only after unlock (`/admin/unlock` → redirect back)
4. `pnpm typecheck`; update tracker + implementation checkboxes; `/remember save`

## Open questions

- Hosting URL and analytics (portfolio-wide TBD)
- Legacy → `features/` migration priority
- Optional per-stage `session-log.md` (not created)
