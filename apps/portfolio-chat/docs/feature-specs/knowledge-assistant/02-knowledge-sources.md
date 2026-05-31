# Knowledge Assistant — Knowledge Sources

**Status:** Not started  
**Depends on:** [Overview](./08-knowledge-assistant) · [01 — Current State](./current-state.md)  
**Feeds:** Intent router, context loader, and dynamic response specs (future docs in this series)

---

## Goal

Define a **markdown-first knowledge layer** that powers the Dynamic Portfolio Assistant. Chat answers and follow-up suggestions must be grounded in editable portfolio content—not scattered TypeScript strings, hard-coded tool `related` arrays, or unconstrained model improvisation.

Stage 1 treats local Markdown files as the **source of truth for assistant context**. Structured UI data in `data/*` may remain for cards, artifacts, and tool payloads until a later migration; knowledge files govern what the model is allowed to say.

---

## 1. Purpose

### Why a knowledge layer is needed

Today, portfolio context lives in multiple places with different roles:

| Source today | Role | Limitation for the assistant |
|--------------|------|------------------------------|
| `data/projects.ts` | Project cards, artifact content, tool output | Rich for UI; not loaded selectively per question |
| `data/about.ts` | About narrative (derived from resume) | No separation of “profile” vs “experience” vs “stack” for routing |
| `data/experience.ts` | Experience tool output | Same content not scoped for Q&A vs display |
| `data/tech.json` | Tech stack grid UI | Structured for rendering, not prose for explanation |
| `lib/ai/prompts/portfolio-assistant.ts` | Tool-routing instructions | Too short to carry full portfolio facts |

This fragmentation causes the problems documented in [01 — Current State](./current-state.md):

- Project-specific questions receive **generic** model replies.
- The assistant **cannot reliably cite** architecture, challenges, or lessons for a named project.
- There is **no single place** to update narrative content when portfolio facts change.
- Follow-up suggestions are **static** because nothing records “what context was just used.”

A dedicated knowledge layer solves this by:

1. **Centralizing narrative content** in human-editable Markdown.
2. **Enabling intent-based loading** — only the files relevant to the user’s question enter the model context.
3. **Constraining hallucination** — the system prompt can require answers to use loaded knowledge only.
4. **Supporting dynamic suggestions** — downstream specs can read section headings and facts from the same files used in the answer.

### Design principles (Stage 1)

| Principle | Meaning |
|-----------|---------|
| Markdown as source of truth | Authors edit `.md` files; runtime reads file contents at request time (or build-time cache). No generated JSON knowledge store. |
| Load only what you need | Each intent maps to an explicit file list—never dump the entire corpus into one prompt. |
| Display vs explain | List/overview intents may still use existing tools + `data/*` for UI; Q&A intents load markdown for the model. |
| Slugs match `data/projects` ids | Project filenames use the same `id` field as `data/projects.ts` (e.g. `audiograph.md`). |
| Facts over fluff | Sections should contain verifiable portfolio facts suitable for citation, not marketing copy. |

---

## 2. Folder Structure

Proposed root: **`apps/portfolio-chat/knowledge/`**

Parallel to `data/` (structured UI) and `docs/` (agent/human specs). The knowledge folder is **product content for the assistant**, not internal documentation.

```
apps/portfolio-chat/knowledge/
├── README.md                 # Authoring guide, section conventions, slug rules
├── manifest.yaml             # Optional: project list, tags, intent hints (human-maintained)
│
├── candidate/
│   ├── candidate-profile.md  # Who Eric is: summary, strengths, working style
│   ├── tech-stack.md         # Technologies, proficiency, how they are used
│   └── experience.md         # Career narrative and role highlights
│
└── projects/
    ├── audiograph.md
    ├── ai-taskwizard.md
    ├── trellnode.md          # slug = data/projects id ("Trellix" display title)
    └── github-codebase-copilot.md
```

### File naming rules

| Rule | Example |
|------|---------|
| Candidate files | Fixed names under `candidate/` — do not rename without updating the context loader spec. |
| Project files | `{project.id}.md` from `data/projects.ts` |
| Case | Lowercase kebab-case slugs only |
| One project per file | No combined multi-project markdown in Stage 1 |

### Optional frontmatter (recommended)

Each knowledge file may begin with YAML frontmatter for routing metadata. Body content remains the source of truth for the model.

```yaml
---
id: audiograph
title: AudioGraph
tags: [analytics, full-stack, api-integration]
categories: [health]
related_projects: [ai-taskwizard]
---
```

Frontmatter is **optional in Stage 1** but recommended for projects to support intent matching (e.g. `categories: [ai]`) without parsing the full body.

### `manifest.yaml` (optional, Stage 1)

Lightweight index for the context loader—**not** a generated artifact:

```yaml
projects:
  - id: audiograph
    title: AudioGraph
    categories: [health]
  - id: ai-taskwizard
    title: AI-TaskWizard
    categories: [ai]
  # ...
```

Use when listing or filtering projects for intents like `ai_experience` without reading every project file. Maintained by hand alongside `data/projects.ts`.

### Relationship to `data/*`

| Concern | Stage 1 owner |
|---------|----------------|
| Card grid, images, URLs, metrics, artifact layout | `data/projects.ts`, `data/tech.json`, `data/experience.ts` |
| Assistant narrative, architecture, challenges, lessons | `knowledge/**` |
| Drift prevention | When facts change, update **both** until a later spec consolidates UI data from knowledge |

Do **not** auto-generate markdown from TypeScript or JSON in Stage 1. Initial migration is a **one-time authoring** pass copying facts from existing data into markdown templates.

---

## 3. Candidate Knowledge

Three files under `knowledge/candidate/`. Together they replace the monolithic about narrative for **Q&A and context loading**. The existing `show_about` / about-stream UX may continue to read `data/about.ts` until a follow-up spec aligns display with knowledge files.

### 3.1 `candidate-profile.md`

**Purpose:** Answer “who is Eric?” — background, summary, strengths, communication style, what he is looking for in roles.

**Recommended sections:**

| Section | Content |
|---------|---------|
| `# Candidate Profile` | Document title (H1) |
| `## Summary` | 2–4 sentences: role, location, specialty |
| `## Core Strengths` | Bullet list: React/Next, AI integration, design systems, etc. |
| `## Working Style` | How he collaborates, mentors, ships |
| `## Current Focus` | What he is building or exploring now (e.g. AI-first products) |
| `## Contact & Links` | GitHub, LinkedIn, site — mirror public links only |

**Loaded for intents:** `candidate_overview`, `general_question` (when about Eric), partial load for `show_about` text generation (future).

**Must not include:** Full job-by-job history (→ `experience.md`), technology proficiency tables (→ `tech-stack.md`).

---

### 3.2 `tech-stack.md`

**Purpose:** Explain technologies Eric uses, at what level, and in what kinds of projects—not the visual grid alone.

**Recommended sections:**

| Section | Content |
|---------|---------|
| `# Tech Stack` | Document title |
| `## Overview` | How stack choices are made ( pragmatism, team fit, AI-first ) |
| `## Frontend` | React, Next.js, TypeScript, Tailwind, etc. |
| `## Backend & APIs` | Node, REST, serverless patterns |
| `## Data & Storage` | PostgreSQL, MongoDB, Supabase, Prisma |
| `## Cloud & DevOps` | AWS, Vercel, CI/CD, testing |
| `## AI & Integration` | LLM APIs, Vercel AI SDK, prompt/tool patterns |
| `## Design & DX` | Storybook, Figma, monorepos |

Each technology subsection: **name**, **proficiency (plain language)**, **example usage** referencing real projects where possible.

**Loaded for intents:** `show_tech_stack` (Q&A follow-ups), `general_question` about skills, partial load for `ai_experience`.

**Display note:** `show_tech_stack` tool may still render `data/tech.json` for the UI grid. This file powers **explanatory** answers (“How have you used Next.js in production?”).

---

### 3.3 `experience.md`

**Purpose:** Career timeline narrative—companies, roles, impact, technologies per role.

**Recommended sections:**

| Section | Content |
|---------|---------|
| `# Experience` | Document title |
| `## Overview` | Career arc in 2–3 sentences |
| `## {Company Name}` | One H2 per employer (most recent first) |
| `### Role & Dates` | Title, location, dates |
| `### Highlights` | Bullets: shipped work, metrics, leadership |
| `### Technologies` | Stack used in that role |
| `### Relevant Projects` | Optional links to `knowledge/projects/*.md` slugs |

**Loaded for intents:** `show_experience` (Q&A), `design_system_experience`, `ai_experience` (when question is role-based), `general_question` about jobs/career.

**Display note:** Experience cards may still use `data/experience.ts` for structured UI until aligned in a later spec.

---

## 4. Project Knowledge

One markdown file per published project under `knowledge/projects/`. Initial set matches **`data/projects.ts`** published entries:

| File | Display title | Notes |
|------|---------------|-------|
| `audiograph.md` | AudioGraph | Analytics / API-heavy |
| `ai-taskwizard.md` | AI-TaskWizard | Microfrontend / enterprise |
| `trellnode.md` | Trellix | Kanban / full-stack |
| `github-codebase-copilot.md` | GitHub Codebase Copilot | AI / portfolio tooling |

### Recommended sections (every project file)

Use this template. Omit a section only if genuinely not applicable; do not leave placeholder lorem ipsum.

| Section | Purpose |
|---------|---------|
| `# {Project Title}` | H1 — matches public project name |
| `## Overview` | What the product is, who it is for, 1–2 paragraphs |
| `## Problem` | User or business problem addressed |
| `## Solution` | What was built and how it solves the problem |
| `## Tech Stack` | Languages, frameworks, services, APIs (bullets or table) |
| `## Architecture` | System shape: apps, data flow, key integrations, deployment |
| `## Key Features` | Shipped capabilities (optional but useful for suggestions) |
| `## Challenges` | Hard technical or product problems encountered |
| `## Lessons Learned` | What would be done differently; takeaways |
| `## Links` | Live demo, GitHub, docs (public URLs only) |
| `## Metrics` | Optional quantified outcomes if available |

### Section depth by intent (loading subsets)

Future context loader may pass **section slices** instead of the full file:

| Intent | Typical sections loaded |
|--------|-------------------------|
| `project_overview` | Overview, Problem, Solution, Links |
| `project_architecture` | Overview, Architecture, Tech Stack |
| `project_challenges` | Overview, Challenges, Lessons Learned |
| `general_question` (project-scoped) | Full file or Overview + relevant section |

### Cross-linking

- Reference other project slugs in prose when relevant (`See also: ai-taskwizard`).
- Do not duplicate full architecture from another project file—link instead.

---

## 5. Knowledge Loading Rules

Loading is **deterministic** in Stage 1: intent (+ optional entity slug) → explicit file list. No embedding search, no “find similar chunks.”

### 5.1 Example query mapping

| User message (examples) | Primary intent | Files to load | Response mode |
|-------------------------|----------------|---------------|---------------|
| Tell me about yourself | `candidate_overview` | `candidate/candidate-profile.md` | AI text (grounded) or about stream |
| What's your background? | `candidate_overview` | `candidate/candidate-profile.md` | AI text (grounded) |
| Show me your tech stack | `show_tech_stack` | `candidate/tech-stack.md` (optional, for follow-up Q&A) | **Tool UI** (`show_tech_stack`) + optional brief narration |
| What technologies do you use? | `show_tech_stack` | `candidate/tech-stack.md` | AI text and/or tool UI |
| Show me your projects | `show_projects` | **None for model** (UI tool uses `data/projects.ts`); optionally `manifest.yaml` only | **Tool UI** (`show_projects`) |
| Tell me about AudioGraph | `project_overview` | `projects/audiograph.md` (Overview, Problem, Solution, Links) | AI text (grounded) |
| How does AudioGraph collect data? | `project_architecture` | `projects/audiograph.md` (Architecture, Tech Stack) | AI text (grounded) |
| What was the hardest part of AudioGraph? | `project_challenges` | `projects/audiograph.md` (Challenges, Lessons Learned) | AI text (grounded) |
| What AI projects have you built? | `ai_experience` | All `knowledge/projects/*.md` where frontmatter/tags/categories include `ai`, **or** filter via `manifest.yaml`: `ai-taskwizard`, `trellnode`, `github-codebase-copilot` (+ optionally `audiograph` if tagged) | AI text (grounded); may also suggest `show_projects` |
| Tell me about your design system work | `design_system_experience` | `candidate/experience.md` (IBM, Havas, Imagination sections) + relevant project sections | AI text (grounded) |
| Show my work experience | `show_experience` | `candidate/experience.md` (optional for narration) | **Tool UI** (`show_experience`) |

### 5.2 Entity resolution (project name → file)

Before loading, resolve the project slug:

1. Exact match on `data/projects[].id` (e.g. `audiograph`).
2. Case-insensitive match on `data/projects[].title` (e.g. “AudioGraph” → `audiograph.md`).
3. Alias table in `manifest.yaml` if needed (e.g. “Trellix” → `trellnode.md`).

If resolution fails, do **not** load a project file; respond with a clarifying question or suggest `show_projects`.

### 5.3 Token budget rules

| Rule | Guideline |
|------|-----------|
| Max files per request | 3 files (hard cap Stage 1) |
| Max project files for multi-project intents | All matching AI projects (~3–4 today) is acceptable; trim to Overview section only if over budget |
| Section slicing | Prefer named sections over full file when intent is narrow |
| List intents | Do not load all project markdown for `show_projects`—use UI tool only |

### 5.4 Display intents vs Q&A intents

| Type | Behavior |
|------|----------|
| **Display** (`show_projects`, `show_tech_stack`, `show_experience`) | Existing tools + `data/*` render structured UI. Knowledge files optional for short narration. |
| **Q&A** (`project_*`, `candidate_overview`, `ai_experience`, `general_question`) | Load markdown → inject into system/context message → model answers with **grounding constraint**. |

### 5.5 Grounding constraint (for downstream specs)

When knowledge files are loaded, the assistant must:

- Answer using loaded content only.
- Say “I don’t have that in Eric’s portfolio materials” when the answer is not present.
- Not invent metrics, APIs, or architecture not stated in loaded files.

---

## 6. Stage 1 Scope

### In scope

- [ ] **K1** — Create `knowledge/` folder structure as defined above
- [ ] **K2** — Author `candidate-profile.md`, `tech-stack.md`, `experience.md` from existing `data/*` / resume facts
- [ ] **K3** — Author one markdown file per published project (4 files)
- [ ] **K4** — Add `knowledge/README.md` with section templates and slug rules
- [ ] **K5** — Optional hand-maintained `manifest.yaml` for project tags/categories
- [ ] **K6** — Context loader (future spec) reads files from disk at runtime via Node `fs` (server-only)
- [ ] **K7** — No vector DB, embeddings, chunking pipeline, or GitHub scanner

### Out of scope (Stage 1)

| Item | Reason |
|------|--------|
| Vector databases / embeddings / RAG | Explicitly excluded; full-file or section load is sufficient at current corpus size |
| GitHub repo scanning | Future enhancement |
| Auto-generating markdown from JSON/TS | Manual authoring only; avoids drift and build complexity |
| Auto-generating JSON from markdown | UI continues using `data/*` |
| Resume PDF parsing | Future |
| Database-backed knowledge | Future |
| Client-side loading of knowledge files | Server-only; never expose full corpus to browser |
| Obsidian / docs folder as runtime source | `docs/` is for agents; `knowledge/` is for product content |

### Corpus size assumption

Stage 1 assumes **< 50 KB total** markdown—small enough to load several full files per request without chunking.

---

## 7. Future Enhancements

Documented for planning only—not Stage 1 work.

### 7.1 Docs scanner

- Watch `knowledge/` (and optionally `docs/reference/`) for changes in dev.
- Validate required sections, broken internal links, and slug ↔ `data/projects` id parity.
- CI check: fail if a published project in `data/projects.ts` lacks a matching `knowledge/projects/{id}.md`.

### 7.2 GitHub integration

- Pull README, repo topics, and release notes for projects with `githubUrl`.
- **Human-approved merge** into project markdown—not automatic overwrite of Architecture/Challenges sections.
- Still no vector store; optional appendix sections (`## Repository Notes`) appended to project files.

### 7.3 Generated summaries

- Build step produces **UI-only** short descriptions (e.g. sync `shortDescription` in `data/projects.ts`) from `## Overview` first paragraph.
- Generation is one-directional markdown → data for display fields only; markdown remains narrative source of truth.
- Distinct from Stage 1 exclusion: no standalone JSON knowledge export for the model.

### 7.4 Other later ideas

- Section-level caching in memory for hot paths
- Multilingual knowledge files
- Per-project “deep dive” chats with single-file default load
- Consolidating `data/*` UI fields from frontmatter + Overview

---

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| Folder layout, file templates, loading rules | Intent router implementation (separate spec) |
| Authoring conventions | Dynamic suggestions algorithm |
| Slug ↔ project id contract | Chat UI changes |
| Server-side read of local `.md` | `@repo/ai` / package changes |

---

## Requirements summary

| ID | Requirement |
|----|-------------|
| R1 | All assistant-grounding narrative lives under `knowledge/` as Markdown |
| R2 | Candidate knowledge split into exactly three files: profile, tech stack, experience |
| R3 | One markdown file per published project; filename = `data/projects.id` |
| R4 | Project files use the recommended section template (Overview through Lessons Learned) |
| R5 | Loading rules map example queries to explicit file paths—no semantic search |
| R6 | Display intents use existing tools; Q&A intents load markdown |
| R7 | No vector DB, embeddings, RAG, GitHub scanning, or JSON generation in Stage 1 |
| R8 | `data/*` remains UI source until a later consolidation spec |

---

## Acceptance criteria

- [ ] `knowledge/` tree exists with README and all candidate + project files populated from real portfolio content
- [ ] Every published project in `data/projects.ts` has a matching `knowledge/projects/{id}.md`
- [ ] Each project file includes at minimum: Overview, Problem, Solution, Tech Stack, Architecture, Challenges, Lessons Learned
- [ ] Loading rules table in this spec is implementable without ambiguity (intents → paths documented)
- [ ] No runtime dependency on embeddings, vector stores, or GitHub APIs
- [ ] Downstream context-loader spec can import paths from this document without redefining structure

---

## Open questions

- [ ] Should `show_about` stream text from `candidate-profile.md` instead of `data/about.ts` in the first implementation pass?
- [ ] Include `audiograph` in `ai_experience` loads even though its `categories` array is `health`, not `ai`?
- [ ] Is `manifest.yaml` required for Stage 1 or defer until `ai_experience` filtering is implemented?

---

## Reference (not requirements)

- [01 — Current State](./current-state.md) — today’s data paths and static suggestions
- [Overview](./08-knowledge-assistant) — Dynamic Portfolio Assistant goals and intents
- `data/projects.ts`, `data/about.ts`, `data/experience.ts`, `data/resume.ts`, `data/tech.json` — migration sources for initial authoring

---

## Implementation prompt (for a later session)

1. Read this spec and [01 — Current State](./current-state.md) before creating files.
2. Create `knowledge/` structure and README; author content from existing `data/*` facts—do not invent new projects or metrics.
3. Do not implement the context loader, intent router, or API changes in this step unless a separate spec says so.
4. When loader is implemented: server-only reads, enforce max 3 files, apply section slices per intent table above.
