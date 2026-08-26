# Architecture

**Feature:** Project Publisher MVP
**Status:** Draft

---

# Overview

Project Publisher is an internal AI-powered administration feature that automates adding portfolio projects.

The administrator supplies a GitHub repository URL and a small amount of metadata. The system retrieves the project's README via a server-side GitHub API call, generates the required portfolio artifacts using **OpenAI** (Vercel AI SDK), validates the output, presents a preview for approval, and publishes the approved content.

The MVP produces two outputs:

1. `knowledge/projects/{id}.md`
2. A new `Project` object added to `data/projects.ts`

---

# High-Level Architecture

```text
┌────────────────────┐
│     Admin UI       │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Generate Endpoint │
└─────────┬──────────┘
          │
          ▼
┌────────────────────────────┐
│  Generate pipeline (lib/)  │  ← MVP: typed sequential steps
│  read → generate → validate│     Phase 2: LangGraph nodes
└─────────┬──────────────────┘
          │
          ├──────────────┐
          ▼              ▼
   GitHub REST API   OpenAI (AI SDK)
          │              │
          └──────┬───────┘
                 ▼
        Generated Draft
                 │
                 ▼
           Admin Review
                 │
                 ▼
┌────────────────────┐
│  Publish Endpoint  │
└─────────┬──────────┘
          │
          ▼
 File Writing (lib/publisher.ts)
```

---

# Folder Structure

Specs live in `docs/feature-specs/project-publisher/`. Code follows [01-design-system](../01-design-system.md):

```text
features/project-publisher/
  components/
    admin-secret-gate.tsx
    admin-unlock-page.tsx
    project-publisher-page.tsx
    project-publish-form.tsx
    draft-preview.tsx
    publish-success.tsx
  hooks/
    use-admin-auth.ts
    use-generate-draft.ts
    use-publish-project.ts
  utils/
    parse-github-repo-url.ts
  lib/
    schema.ts                   # Zod Project + API body schemas
    prompts.ts
    verify-admin-secret.ts
    ensure-local-publish.ts
    read-github-readme.ts
    generate-knowledge-markdown.ts
    generate-project-object.ts
    run-generate-pipeline.ts
    write-knowledge-file.ts
    update-projects-file.ts
```

**Conventions**

- **All UI in `features/project-publisher/components/`** — never root `components/` or inline JSX in `app/admin/`
- No `src/` subdirectory — matches `features/ai-chat/` and `features/chat-ui/` patterns
- No spec copies inside the feature folder
- No barrel `index.ts` — direct imports only
- `app/admin/**/page.tsx` are one-line shells that render a feature component
- `app/api/admin/**` routes stay thin; business logic lives in `lib/`
- `middleware.ts` at app root (not inside feature folder)

Application routes (thin — UI lives in `features/project-publisher/components/`):

```text
app/
  admin/
    unlock/
      page.tsx            # import AdminUnlockPage from features/project-publisher/components
    projects/
      new/
        page.tsx            # import ProjectPublisherPage from features/project-publisher/components

  api/
    admin/
      unlock/
        route.ts          # POST { secret } → httpOnly cookie

      projects/
        generate/
          route.ts        # verifyAdminSecret() first

        publish/
          route.ts
```

Middleware (`middleware.ts` at app root):

- Matcher: `/admin/:path*`, `/api/admin/:path*`
- Skip `/api/admin/unlock` for POST with valid body
- Otherwise require cookie or Bearer matching `ADMIN_SECRET`

---

# Authentication

## Env

| Variable | Purpose |
|----------|---------|
| `ADMIN_SECRET` | Shared secret for owner-only admin access |

If `ADMIN_SECRET` is not set, admin routes behave as if the feature does not exist (**404**).

## API routes (`/api/admin/*`)

Every handler calls `verifyAdminSecret(request)` first:

```ts
// Authorization: Bearer <ADMIN_SECRET>
// Returns 401 if header missing or secret mismatch
```

Generate and publish never run without a valid secret.

## Admin UI (`/admin/*`)

1. Owner visits `/admin/unlock`, enters secret.
2. Client POSTs to `/api/admin/unlock`; server sets httpOnly cookie (e.g. `portfolio-admin-auth`).
3. Middleware allows `/admin/projects/new` when cookie matches.
4. Client hooks also send `Authorization: Bearer` on fetch to generate/publish (defense in depth).
5. Main chat page (`app/page.tsx`) calls `isAdminSessionActive()` server-side; when true, sidebar shows a pinned **Admin → New project** link (Stage 4b). Hidden for all other visitors.
6. All `/admin/*` pages use `app/admin/layout.tsx` — same `AppSidebarShell` as the chat home page, with explore items linking back to `/`.

## Security rules

- Do not link `/admin` from public portfolio UI for unauthenticated visitors.
- Sidebar admin nav appears only when the httpOnly unlock cookie is valid on the server render.
- Do not log or return the secret in error messages.
- Do not embed `ADMIN_SECRET` in client-side env (`NEXT_PUBLIC_*`).
- Rotate secret if leaked; update `.env.local` and Vercel env separately.

---

# System Responsibilities

## Admin UI

Responsible for:

- Collecting administrator input
- Displaying generated drafts
- Allowing approval before publishing

**All UI components live in `features/project-publisher/components/`.**  
`app/admin/**/page.tsx` files only import and render those components — no forms, previews, or client logic in `app/`.

---

## Generate Endpoint

Responsible for:

- Receiving the request
- Calling `runGeneratePipeline()` (MVP)
- Returning the generated draft

It never writes files.

---

## Generate pipeline (MVP)

Responsible for orchestrating the linear workflow in TypeScript.

Responsibilities include:

- Sequential step execution
- Early return on failures (README missing, GitHub error)
- Coordinating LLM generation via OpenAI (`@ai-sdk/openai` or `models` from `@repo/ai/lib/models`)
- Zod validation before response

**Phase 2:** Replace or wrap this pipeline with LangGraph when branching/retry nodes are added. Write MVP steps as discrete functions so they map cleanly to graph nodes.

---

## GitHub README fetch

Responsible for retrieving the repository README **inside the Next.js server** (generate pipeline step 1).

**Not Cursor MCP** — MCP tools run in the IDE agent context, not in `app/api/admin/*` route handlers.

### Modules

| File | Role |
|------|------|
| `utils/parse-github-repo-url.ts` | Parse user input → `{ owner, repo }` |
| `lib/read-github-readme.ts` | Call GitHub API, return README body |

### API request

```http
GET https://api.github.com/repos/{owner}/{repo}/readme
Accept: application/vnd.github.raw+json
Authorization: Bearer {GITHUB_TOKEN}   # optional public; required private
User-Agent: portfolio-chat-project-publisher
```

GitHub returns the default branch README (any casing: `README.md`, `Readme.md`, etc.).

### Env

| Variable | Required | Purpose |
|----------|----------|---------|
| `GITHUB_TOKEN` | Optional for **public** repos | Avoids low unauthenticated rate limits; required for **private** repos |

Use a fine-grained or classic PAT with `contents: read` (public repos) or `repo` (private).

### Accepted URL shapes

- `https://github.com/owner/repo`
- `https://github.com/owner/repo/`
- `https://github.com/owner/repo/tree/main` → still resolves `owner/repo`

Reject invalid URLs before calling GitHub (400 to client).

### Error mapping

| GitHub response | Pipeline behavior | User message |
|-----------------|-------------------|--------------|
| 200 | Continue | — |
| 404 (no readme) | Stop | `README.md not found.` |
| 404 (repo) | Stop | `Unable to access repository.` |
| 401 / 403 | Stop | `Unable to access repository.` |
| 429 | Stop | `GitHub rate limit exceeded. Try again or set GITHUB_TOKEN.` |
| Network error | Stop | `Unable to access repository.` |

### Rate limits

Unauthenticated: ~60 requests/hour per IP. With `GITHUB_TOKEN`: ~5,000/hour. Recommend token in `.env.local` for dev.

### Phase 2 (deferred)

If README missing, graph/pipeline may try `/docs`, `package.json` — not in MVP.

---

## LLM (OpenAI)

Responsible for generating:

- Knowledge markdown
- Project metadata (structured output + Zod)

Uses `OPENAI_API_KEY` and `AI_PROVIDER=openai`. **No Google/Gemini.**

The model never writes files directly.

---

## Validation

Generated data must validate before publishing.

Validation ensures the generated object matches the application's Project schema.

---

## Publish Endpoint

Responsible for writing approved content **to the local workspace** when publish is enabled.

Calls `ensureLocalPublish()` before any file I/O — returns **403** on Vercel or when `PROJECT_PUBLISHER_ENABLE_WRITES` is not `true`.

Creates:

```text
knowledge/projects/{id}.md
```

Updates:

```text
data/projects.ts
```

Uses atomic write pattern: write temp files or rollback on failure so markdown and `projects.ts` stay in sync.

---

# Publish model

Project Publisher is a **local authoring tool**. Production deploys serve read-only content from git; they do not receive filesystem writes from publish.

## Why local-only

| Environment | Filesystem | Result of publish |
|-------------|------------|-------------------|
| `pnpm dev` (local) | Persistent workspace | Files updated; git shows diff |
| Vercel preview/prod | Ephemeral / read-only app bundle | Writes lost or fail — **must block** |

## Env

| Variable | Purpose |
|----------|---------|
| `PROJECT_PUBLISHER_ENABLE_WRITES` | Set to `true` in `.env.local` to allow `/publish` file writes |

## Gate: `ensureLocalPublish()`

```ts
// features/project-publisher/lib/ensure-local-publish.ts
// Throws or returns 403 when:
// - process.env.VERCEL === '1'
// - process.env.PROJECT_PUBLISHER_ENABLE_WRITES !== 'true'
```

Generate endpoint is **not** gated by this flag (draft-only, no disk writes).

## Owner workflow after publish

```sh
# From apps/portfolio-chat (or repo root)
git status
git add knowledge/projects/<id>.md data/projects.ts
git commit -m "Add project: <title>"
git push
```

Admin UI shows post-publish instructions (copy-friendly paths). No git commands run from the app.

## Rollback

If `updateProjectsFile` fails after `writeKnowledgeFile` succeeds, delete the new markdown file and return error. Never leave partial publish.

---

# Workflow

```text
Administrator

↓

Submit Repository URL

↓

Generate Endpoint

↓

runGeneratePipeline()   // MVP — LangGraph in Phase 2

↓

Read README

↓

Generate Markdown

↓

Generate Project Object

↓

Validate

↓

Return Draft

↓

Administrator Reviews

↓

Publish Endpoint

↓

Write Markdown

↓

Update projects.ts
```

---

# Pipeline state (MVP)

```ts
type GeneratePipelineInput = {
  repoUrl: string;
  image: string;
  gallery: string[];
  liveUrl?: string;
  position?: number;
  published?: boolean;
};

type GeneratePipelineResult = {
  readme?: string;
  markdown?: string;
  project?: Project;
  errors: string[];
};
```

---

# Project Object

The generated object must conform to the existing application model.

```ts
Project
```

The AI is responsible only for producing the object.

Writing the object into `projects.ts` is handled by a tool.

---

# Knowledge Document

Each generated project creates:

```text
knowledge/projects/{id}.md
```

Expected structure:

```md
---
id:
title:
tags:
categories:
---

# Overview

## Problem

## Solution

## Tech Stack

## Architecture

## Features

## Challenges

## Lessons Learned

## Links

## Metrics
```

---

# Error Handling

## README Missing

Stop the workflow.

Return:

```text
README.md not found.
```

---

## Repository Unavailable

Stop the workflow.

Return:

```text
Unable to access repository.
```

---

## Validation Failure

Return validation errors.

Publishing is not allowed.

---

## File Write Failure

Stop publishing.

Return the write error.

---

# Design Principles

- Human approval is required before publishing.
- Admin routes require `ADMIN_SECRET`; fail closed (401/404).
- The LLM generates content but never modifies files directly.
- File writing is deterministic.
- Validation occurs before publishing.
- The workflow should remain small and extensible.
- Future capabilities should be added as **new pipeline steps** (MVP) or **new graph nodes** (Phase 2) rather than expanding existing ones ad hoc.

---

# Future Expansion

## Phase 2 — LangGraph

Introduce `@langchain/langgraph` when the workflow needs branching, retries, or resumable runs. Migrate discrete MVP functions to nodes:

- Read `/docs` (fallback if no README)
- Read `package.json`
- Retry generation on validation failure

## Phase 3

- Analyze source code
- Capture screenshots
- Generate gallery images
- Update existing projects
- Generate pull requests
- Trigger deployments