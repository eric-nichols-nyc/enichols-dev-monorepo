# Project Publisher MVP

**Status:** Draft
**Owner:** Eric Nichols
**Priority:** High
**Target:** Portfolio Admin

---

# Overview

Project Publisher is an AI-powered admin tool that automates the process of adding portfolio projects.

Instead of manually writing project metadata, knowledge documents, and updating the portfolio data source, an administrator provides a GitHub repository and a small amount of supplemental information. The system analyzes the repository and generates the required artifacts for review before publishing.

The MVP focuses on reducing manual work using a **typed AI SDK pipeline** (same patterns as `features/ai-chat/`). **LangGraph is deferred to Phase 2** when branching workflows (fallback doc sources, retries, multi-step agents) are needed.

---

# Problem Statement

Adding a new project to the portfolio currently requires multiple manual steps:

- Reading project documentation
- Writing a chatbot knowledge document
- Creating a Project object
- Updating the portfolio data
- Ensuring consistent formatting

This process is repetitive, error-prone, and time consuming.

---

# Goals

The system should:

- Read a GitHub repository README
- Generate a knowledge document for the chatbot
- Generate a strongly typed Project object
- Allow the administrator to review the generated content
- Publish both outputs

---

# Non Goals

The MVP will NOT:

- Crawl the full repository
- Analyze source code
- Generate screenshots
- Search multiple documentation files
- Automatically commit changes to GitHub
- Automatically deploy the portfolio
- Support updating existing projects

---

# User Story

As the portfolio owner,

I want to provide a GitHub repository and a few project details,

so the AI can generate the portfolio content required by my website,

allowing me to review and publish it with minimal manual work.

---

# Inputs

Administrator provides:

- GitHub Repository URL
- Project Image Path
- Optional Live URL
- Optional Position
- Optional Published flag

---

# Outputs

## Output 1

```
knowledge/projects/{project-id}.md
```

Contains:

- Frontmatter
- Overview
- Problem
- Solution
- Architecture
- Tech Stack
- Features
- Challenges
- Lessons Learned
- Links
- Metrics

---

## Output 2

Append a new Project object into:

```
data/projects.ts
```

matching the existing Project interface.

---

# Workflow

```
Admin Page

↓

Submit Repository URL

↓

Read README from GitHub

↓

Generate Markdown

↓

Generate Project Object

↓

Validate Output

↓

Preview

↓

Approve

↓

Publish
```

---

# Functional Requirements

## FR-1

The administrator can enter a GitHub repository URL.

---

## FR-2

The system retrieves the repository README via the **GitHub REST API** from the generate route handler.

- Module: `readGithubReadme()` in `features/project-publisher/lib/read-github-readme.ts`
- Optional `GITHUB_TOKEN` for rate limits; required for private repositories
- **Not** Cursor MCP or any IDE-only integration

---

## FR-3

If no README exists the workflow stops with a clear error.

Example:

```
README.md not found.
Unable to generate project.
```

---

## FR-4

The LLM generates a structured knowledge document.

---

## FR-5

The LLM generates a Project object.

---

## FR-6

The generated Project object validates against the Project TypeScript schema.

---

## FR-7

Administrator reviews generated content before publishing.

---

## FR-8

Publishing writes:

```
knowledge/projects/{id}.md
```

and updates

```
data/projects.ts
```

---

## FR-9

All `/admin` pages and `/api/admin/*` routes require a valid `ADMIN_SECRET`.

- Missing or wrong secret on API → **401 Unauthorized**
- `ADMIN_SECRET` unset in environment → admin routes return **404** (feature disabled)
- Secret is never exposed in client bundle or public UI

---

## FR-10

Publishing to disk is allowed **only in local development** when explicitly enabled.

- Require `PROJECT_PUBLISHER_ENABLE_WRITES=true` in environment
- Block publish when `VERCEL=1` (or equivalent serverless host)
- No automatic `git commit`, `git push`, or deploy after publish

---

# Technical Requirements

## Publish model

- **Source of truth:** git-tracked files under `apps/portfolio-chat/`
- **Write targets:** `knowledge/projects/{id}.md`, `data/projects.ts`
- **Local only:** `lib/ensure-local-publish.ts` gates `/publish` (see architecture)
- **Post-publish:** owner commits manually; CI/deploy picks up changes on push

---

## Authentication

- Env: `ADMIN_SECRET` (server-only, `.env.local`)
- API: `Authorization: Bearer <ADMIN_SECRET>` on every `/api/admin/*` request
- Admin UI: owner unlocks via secret entry → `POST /api/admin/unlock` sets httpOnly cookie; Next.js middleware guards `/admin/*`
- Shared helper: `features/project-publisher/lib/verify-admin-secret.ts`

---

## AI

- Model: **OpenAI only** via Vercel AI SDK (`generateObject` for structured `Project` output)
- Env: `OPENAI_API_KEY`, `AI_PROVIDER=openai` (shared with `/api/chat` via `@repo/ai/lib/models`)
- Zod schema for `Project` validation

---

## Orchestration (MVP)

**Typed pipeline** in `features/project-publisher/lib/run-generate-pipeline.ts` — sequential steps, no LangGraph dependency.

Responsibilities:

- Pass state between steps (`GeneratePipelineInput` → `GeneratePipelineResult`)
- Early exit on README / GitHub errors
- Call LLM for markdown + Project object
- Zod validation before returning draft

Human approval happens **between** API calls (`/generate` returns draft; `/publish` writes files). No graph checkpointing required for MVP.

---

## Orchestration (Phase 2 — deferred)

**LangGraph** when adding:

- Fallback sources if README is missing (`/docs`, `package.json`)
- Retry/regenerate loops on validation failure
- Resumable multi-step runs
- Additional agent nodes without rewriting the linear pipeline

MVP pipeline functions should be written as discrete steps so they can become graph nodes later.

---

## Tools / modules

### `readGithubReadme` (GitHub REST)

Input: repository URL string  
Output: README markdown string  

Calls `GET /repos/{owner}/{repo}/readme` with `Accept: application/vnd.github.raw+json`. See [architecture.md](./architecture.md#github-readme-fetch).

---

### Markdown Writer

Creates

```
knowledge/projects/{id}.md
```

---

### Project Writer

Updates

```
data/projects.ts
```

---

# Generate Pipeline (MVP)

```text
START (POST /generate)

↓

readGithubReadme(repoUrl)

↓

generateKnowledgeMarkdown(readme, metadata)

↓

generateProjectObject(readme, metadata)

↓

validateProject(project)  // Zod

↓

RETURN draft { markdown, project, errors? }

--- human approval in Admin UI ---

POST /publish → writeKnowledgeFile + updateProjectsFile

END
```

---

# Error Handling

## README Missing

Stop workflow.

Return message.

---

## Invalid Project Schema

Stop workflow.

Display validation errors.

---

## GitHub Error

Display repository access failure.

---

# Success Criteria

A successful run results in:

✅ Markdown file created

✅ Project object generated

✅ Validation passes

✅ Administrator approves

✅ Project added to portfolio

---

# Future Enhancements

## Phase 2 (LangGraph orchestration)

- Introduce LangGraph; migrate pipeline steps to graph nodes
- Scan `docs/`
- Analyze `package.json`
- Fallback README sources
- Retry generation on validation failure

## Phase 3

- Generate screenshots automatically
- Crawl source code
- Create project gallery
- Generate LinkedIn announcement
- Generate resume bullet points
- Update existing projects
- Open GitHub Pull Request
- Deploy automatically