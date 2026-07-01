# Project Publisher MVP

**Status:** Draft
**Version:** 0.1.0
**Owner:** Eric Nichols
**Priority:** High
**Feature:** AI-Powered Portfolio Project Publisher

---

# Overview

Project Publisher is an AI-powered administration feature that automates the process of publishing projects to Eric Nichols' portfolio website.

Instead of manually writing project metadata, chatbot knowledge files, and updating the portfolio data source, the administrator provides a GitHub repository URL and a few supplemental fields. The system retrieves the project README, generates the required content, presents a preview for approval, and publishes the project.

The MVP is intentionally small to demonstrate a real AI agent workflow using LangGraph, GitHub MCP, and the AI SDK without introducing unnecessary complexity.

---

# Problem Statement

Publishing a new portfolio project currently requires several manual tasks:

- Reading project documentation
- Writing chatbot knowledge files
- Writing a Project object
- Updating `data/projects.ts`
- Ensuring consistency across all portfolio projects

This process is repetitive, slow, and difficult to maintain as the portfolio grows.

---

# Goals

The MVP should:

- Read a project's README from GitHub
- Generate chatbot knowledge documentation
- Generate a new Project object
- Allow review before publishing
- Publish the generated files

---

# Non Goals

The MVP will **not**:

- Crawl the entire repository
- Analyze source code
- Read multiple documentation files
- Generate screenshots
- Update existing projects
- Automatically commit to GitHub
- Automatically deploy the site
- Generate blog posts
- Generate LinkedIn posts
- Create embeddings or vector stores

---

# User Story

**As the portfolio owner**

I want to provide a GitHub repository and a few project details,

so the AI can generate everything required to publish a new project,

allowing me to review and publish it with a single approval.

---

# Inputs

Administrator provides:

| Field | Required |
|---------|----------|
| GitHub Repository URL | ✅ |
| Image Path | ✅ |
| Live URL | Optional |
| Position | Optional |
| Published | Optional |

---

# Outputs

## Output 1

Create

```text
knowledge/projects/{project-id}.md
```

Example:

```text
knowledge/projects/ai-taskwizard.md
```

---

## Output 2

Append a new Project object to

```text
data/projects.ts
```

matching the existing `Project` interface.

---

# High-Level Workflow

```text
Admin Page

↓

Enter Repository URL

↓

Read README using GitHub MCP

↓

Generate Knowledge Markdown

↓

Generate Project Object

↓

Validate

↓

Preview

↓

Approve

↓

Publish
```

---

# Functional Requirements

## FR-1 Repository Input

The administrator can enter a GitHub repository URL.

---

## FR-2 README Retrieval

The system retrieves the repository README using GitHub MCP.

---

## FR-3 Missing README

If a README cannot be found:

- Stop the workflow
- Display an error
- Do not generate content

Example

```
README.md not found.
Unable to generate project.
```

---

## FR-4 Markdown Generation

Generate a markdown document containing:

- Frontmatter
- Overview
- Problem
- Solution
- Tech Stack
- Architecture
- Features
- Challenges
- Lessons Learned
- Links
- Metrics

---

## FR-5 Project Generation

Generate a Project object compatible with:

```ts
type Project
```

---

## FR-6 Validation

The generated Project object must validate against the application schema before publishing.

---

## FR-7 Preview

Administrator reviews generated content before publishing.

No files are written until approval.

---

## FR-8 Publish

Publishing writes:

```text
knowledge/projects/{id}.md
```

and updates

```text
data/projects.ts
```

---

# User Flow

```text
Open Admin

↓

Paste Repository URL

↓

Click Generate

↓

AI reads README

↓

Draft generated

↓

Preview Markdown

↓

Preview Project Object

↓

Approve

↓

Publish
```

---

# LangGraph Responsibilities

LangGraph is responsible for orchestrating the workflow.

Responsibilities include:

- Managing workflow state
- Calling tools
- Handling failures
- Coordinating generation
- Returning the draft

LangGraph **does not** write files directly.

---

# Tools

## Read GitHub README

Input

```text
Repository URL
```

Output

```text
README contents
```

---

## Generate Knowledge Markdown

Input

```text
README
```

Output

```text
Markdown document
```

---

## Generate Project Object

Input

```text
README
```

Output

```ts
Project
```

---

## Write Knowledge File

Creates

```text
knowledge/projects/{id}.md
```

---

## Update Projects File

Adds a new Project object into

```text
data/projects.ts
```

---

# LangGraph Workflow

```text
START

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

Human Approval

↓

Write Markdown

↓

Update projects.ts

↓

END
```

---

# State

The graph state contains:

```ts
{
  repoUrl,
  readme,

  markdown,

  project,

  imagePaths,

  liveUrl,

  validationErrors,

  approved
}
```

---

# Error Handling

## README Missing

Stop workflow.

Return

```
README.md not found.
```

---

## GitHub Failure

Return

```
Unable to access repository.
```

---

## Validation Failure

Return validation errors.

Do not publish.

---

## File Write Failure

Return write error.

Do not partially publish.

---

# Acceptance Criteria

The feature is complete when:

- Administrator enters a GitHub repository URL
- README is successfully retrieved
- Knowledge markdown is generated
- Project object is generated
- Project validates successfully
- Administrator previews both outputs
- Clicking Publish writes:
  - `knowledge/projects/{id}.md`
  - `data/projects.ts`

---

# Future Enhancements

## Phase 2

- Scan `/docs`
- Read `package.json`
- Read architecture documents
- Generate screenshots automatically
- Generate gallery images
- Support updating existing projects
- Generate project summaries for resume
- Generate LinkedIn announcements

---

## Phase 3

- Crawl repository source code
- Analyze architecture automatically
- Create GitHub Pull Requests
- Automatic deployment
- Batch publish multiple repositories
- Portfolio synchronization
- Documentation regeneration

---

# Success Criteria

The administrator can publish a new portfolio project by supplying only:

- Repository URL
- Image path

The system generates all required content, validates it, presents a review screen, and publishes the project with a single approval.