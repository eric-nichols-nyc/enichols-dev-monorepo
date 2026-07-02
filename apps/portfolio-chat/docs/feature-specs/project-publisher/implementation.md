z# Implementation Plan

**Feature:** Project Publisher MVP
**Status:** Draft

---

# Goal

Build an internal admin workflow that takes:

- GitHub repo URL
- image path
- optional live URL
- optional position
- optional published flag

and generates:

1. `knowledge/projects/{id}.md`
2. a new `Project` object for `data/projects.ts`

The admin must preview and approve before anything is written.

---

# Stage 1 — Feature Foundation

## Tasks

- [x] Create folder tree per [code layout](./00-index.md#code-layout-mvp) and [01-design-system](../../01-design-system.md)
- [x] Specs remain in `docs/feature-specs/project-publisher/` only

### `lib/` (server)

- [x] `schema.ts`
- [x] `prompts.ts`
- [x] `verify-admin-secret.ts`
- [x] `ensure-local-publish.ts`
- [x] `read-github-readme.ts`
- [x] `generate-knowledge-markdown.ts`
- [x] `generate-project-object.ts`
- [x] `run-generate-pipeline.ts`
- [x] `write-knowledge-file.ts`
- [x] `update-projects-file.ts`

### `utils/`

- [x] `parse-github-repo-url.ts`

### `components/` + `hooks/` (stubs OK in Stage 1)

All paths under `features/project-publisher/`:

- [x] `components/admin-secret-gate.tsx`
- [x] `components/admin-unlock-page.tsx`
- [x] `components/project-publisher-page.tsx`
- [x] `components/project-publish-form.tsx`
- [x] `components/draft-preview.tsx`
- [x] `components/publish-success.tsx`
- [x] `hooks/use-admin-auth.ts`
- [x] `hooks/use-generate-draft.ts`
- [x] `hooks/use-publish-project.ts`

## Deliverable

Feature folder matches agreed layout; typed stubs compile; no LangGraph; no barrel indexes.

---

# Stage 2 — Admin Auth

## Tasks

- [x] Add `ADMIN_SECRET` to `.env.local` (document in spec; never commit value)
- [x] Implement `lib/verify-admin-secret.ts`
- [x] Create `POST /api/admin/unlock` — validate secret, set httpOnly cookie
- [x] Add `middleware.ts` matcher for `/admin/*` and `/api/admin/*`
- [x] Create `app/admin/unlock/page.tsx` — thin shell importing `components/admin-unlock-page.tsx`
- [x] Return **404** when `ADMIN_SECRET` unset; **401** on bad secret

## Deliverable

Admin routes are protected before any generate/publish work begins.

---

# Stage 3 — Project Schema

## Tasks

- [x] Mirror the existing `Project` type in a Zod schema
- [x] Add `ProjectMetric` schema
- [x] Add validation for:
  - [x] `id`
  - [x] `title`
  - [x] `tags`
  - [x] `categories`
  - [x] `description`
  - [x] `shortDescription`
  - [x] `date`
  - [x] `url`
  - [x] `published`
  - [x] `image`
  - [x] `gallery`
- [x] Export inferred TypeScript types from the schema

## Deliverable

Generated project objects can be validated before publishing.

---

# Stage 4 — Admin Page Skeleton

## Tasks

- [x] Create thin route `app/admin/projects/new/page.tsx` — imports `ProjectPublisherPage` from `features/project-publisher/components/`
- [x] Build UI in feature components (not in `app/`):
  - [x] `project-publish-form.tsx` — GitHub URL, image path, gallery, live URL, position, published
  - [x] `draft-preview.tsx` — empty preview area
  - [x] `project-publisher-page.tsx` — composes form + preview + actions
- [x] Wire `use-generate-draft` hook for Generate button
- [x] Loading and error states in feature components

## Deliverable

Admin page exists and can collect input (only reachable after unlock).

---

# Stage 4b — Admin Sidebar Nav

## Tasks

- [x] Server-detect admin session via httpOnly cookie (`isAdminSessionActive()`)
- [x] Pass `showAdminNav` from `app/page.tsx` into `CollapsibleSidebarLayout`
- [x] When authenticated, show pinned **Admin** section at bottom of sidebar (desktop + mobile)
- [x] Link **New project** → `/admin/projects/new` (icon-only when sidebar collapsed)
- [x] Hidden when `ADMIN_SECRET` unset or cookie invalid
- [x] Shared sidebar shell for admin routes via `app/admin/layout.tsx` (`AppSidebarShell` + `AdminSidebarLayout`)
- [x] Explore nav links home from admin pages; **New project** highlights on `/admin/projects/new`

## Deliverable

Unlocked admins see a sidebar shortcut to the publisher from the main chat page without typing `/admin/...`.

---

# Stage 5 — Generate Endpoint

## Tasks

- [ ] Create route:
  - [ ] `app/api/admin/projects/generate/route.ts`
- [ ] Accept POST body:
  - [ ] `repoUrl`
  - [ ] `image`
  - [ ] `gallery`
  - [ ] `liveUrl`
  - [ ] `position`
  - [ ] `published`
- [ ] Validate request body
- [ ] Call `verifyAdminSecret(request)` first
- [ ] Call `runGeneratePipeline()`
- [ ] Return generated draft
- [ ] Return errors cleanly

## Deliverable

Admin page can call generate endpoint and receive a placeholder response.

---

# Stage 6 — README Retrieval

## Tasks

- [ ] Implement `utils/parse-github-repo-url.ts`
  - [ ] Accept `https://github.com/{owner}/{repo}` (+ optional trailing path)
  - [ ] Reject non-GitHub URLs with clear error
- [ ] Implement `lib/read-github-readme.ts`
  - [ ] `GET https://api.github.com/repos/{owner}/{repo}/readme`
  - [ ] Header: `Accept: application/vnd.github.raw+json`
  - [ ] Header: `Authorization: Bearer` when `GITHUB_TOKEN` set
  - [ ] Header: `User-Agent: portfolio-chat-project-publisher`
- [ ] Map GitHub status codes to user-facing errors (see architecture)
- [ ] Unit test URL parser (valid URLs, tree paths, invalid hosts)
- [ ] Unit test error mapping with mocked `fetch`

## Deliverable

Given a repo URL, the pipeline retrieves README contents via GitHub REST API (no MCP).

---

# Stage 7 — Generate Pipeline Skeleton

## Tasks

- [ ] Define `GeneratePipelineInput` / `GeneratePipelineResult` types
- [ ] Implement `runGeneratePipeline()` orchestrating:
  - [ ] `readGithubReadme`
  - [ ] `generateKnowledgeMarkdown` (placeholder)
  - [ ] `generateProjectObject` (placeholder)
  - [ ] Zod validation
- [ ] Early exit on README / GitHub errors
- [ ] Return final draft result

## Deliverable

Pipeline runs end-to-end with placeholder generation. **LangGraph deferred to Phase 2.**

---

# Stage 8 — Markdown Generation

## Tasks

- [ ] Create markdown generation prompt
- [ ] Include required markdown format
- [ ] Include frontmatter format
- [ ] Include repo URL and live URL
- [ ] Generate:
  - [ ] Overview
  - [ ] Problem
  - [ ] Solution
  - [ ] Tech Stack
  - [ ] Architecture
  - [ ] Features
  - [ ] Challenges
  - [ ] Lessons Learned
  - [ ] Links
  - [ ] Metrics
- [ ] Return markdown as a string

## Deliverable

Pipeline generates `knowledge/projects/{id}.md` content.

---

# Stage 9 — Project Object Generation

## Tasks

- [ ] Create Project object generation prompt
- [ ] Use structured output
- [ ] Include admin-provided values:
  - [ ] image
  - [ ] gallery
  - [ ] liveUrl
  - [ ] position
  - [ ] published
- [ ] Generate fields:
  - [ ] id
  - [ ] title
  - [ ] tags
  - [ ] categories
  - [ ] description
  - [ ] shortDescription
  - [ ] date
  - [ ] url
  - [ ] subtitle
  - [ ] problem
  - [ ] solution
  - [ ] tech
  - [ ] features
  - [ ] metrics
  - [ ] githubUrl
  - [ ] badges
  - [ ] highlights

## Deliverable

Pipeline generates a valid Project object.

---

# Stage 10 — Validation

## Tasks

- [ ] Validate generated Project object with Zod
- [ ] Return validation errors if invalid
- [ ] Prevent preview/publish if validation fails
- [ ] Add helpful error messages

## Deliverable

Only valid Project objects reach the preview step.

---

# Stage 11 — Admin Preview

## Tasks

- [ ] Display generated markdown preview
- [ ] Display generated Project object preview
- [ ] Add Approve & Publish button
- [ ] Add Cancel/Reset button
- [ ] Disable publish if validation failed

## Deliverable

Admin can review generated output before writing files.

---

# Stage 12 — Publish Endpoint

## Tasks

- [ ] Create route:
  - [ ] `app/api/admin/projects/publish/route.ts`
- [ ] Accept approved draft
- [ ] Call `verifyAdminSecret(request)` first
- [ ] Call `ensureLocalPublish()` — **403** if not local + enabled
- [ ] Validate draft again server-side
- [ ] Write markdown file:
  - [ ] `knowledge/projects/{id}.md`
- [ ] Update:
  - [ ] `data/projects.ts`
- [ ] Return success response
- [ ] Return write errors cleanly

## Deliverable

Approved drafts can be published.

---

# Stage 13 — File Writers

## Tasks

- [ ] Implement `writeKnowledgeFile`
- [ ] Implement `updateProjectsFile`
- [ ] Implement `ensureLocalPublish()` (block when `VERCEL=1` or enable flag unset)
- [ ] Roll back markdown if `projects.ts` update fails
- [ ] Prevent duplicate project IDs
- [ ] Preserve existing `projects.ts` exports
- [ ] Insert new object into `projectsUnsorted`
- [ ] Preserve sorting behavior
- [ ] Format updated file

## Deliverable

Publishing creates the markdown file and updates `projects.ts`.

---

# Stage 14 — Error Handling & Safety

## Tasks

- [ ] No README found error
- [ ] Invalid repo URL error
- [ ] GitHub access error
- [ ] Validation error display
- [ ] Duplicate project ID error
- [ ] File write error
- [ ] Prevent publish without approval
- [ ] Log pipeline steps for debugging

## Deliverable

Failure states are clear and safe.

---

# Stage 15 — Testing

## Tasks

- [ ] Unit test Project schema validation
- [ ] Unit test README URL parsing
- [ ] Unit test markdown file path generation
- [ ] Unit test duplicate ID detection
- [ ] Unit test projects.ts insertion logic
- [ ] Integration test generate endpoint with mocked README
- [ ] Integration test publish endpoint with mocked file system

## Deliverable

Core MVP behavior is covered by tests.

---

# Stage 16 — MVP Polish

## Tasks

- [ ] Improve loading UI
- [ ] Improve preview formatting
- [ ] Add success message after publish with **git commit** instructions
- [ ] Add copy-to-clipboard for generated markdown
- [ ] Add copy-to-clipboard for Project object
- [ ] Confirm project appears in portfolio
- [ ] Confirm chatbot can use generated knowledge file

## Deliverable

MVP is usable and demo-ready.

---

# Suggested Build Order

Build in this order:

1. Schema
2. Admin page
3. Generate endpoint
4. Mock pipeline (`runGeneratePipeline` with placeholders)
5. Real README retrieval
6. Markdown generation
7. Project object generation
8. Preview UI
9. Publish endpoint
10. File writers
11. Tests
12. Polish

---

# MVP Completion Definition

The MVP is complete when:

- Admin enters repo URL and image path
- README is retrieved
- Markdown is generated
- Project object is generated
- Output validates
- Admin previews both outputs
- Admin approves
- Markdown file is written
- `data/projects.ts` is updated
- Portfolio can display the new project
- Chat interface can answer from the generated markdown file

---

# Phase 2 — LangGraph (deferred)

When adding fallback doc sources, retries, or resumable runs:

- [ ] Add `@langchain/langgraph`
- [ ] Migrate pipeline step functions to graph nodes
- [ ] Add conditional edges (e.g. README missing → try `/docs`)