# Knowledge Assistant — Current State

Baseline audit before implementing [08-knowledge-assistant](./08-knowledge-assistant). Answers the questions needed to start Stage 1.

---

## What works today?

The portfolio chat is **fully functional** as a streaming tool-calling assistant. Shipped behavior includes:

| Area | Status |
|------|--------|
| Chat UI | Streaming messages via `useChat` + `DefaultChatTransport` (`contexts/chat-context.tsx`) |
| API | `POST /api/chat` streams model + tool output (`features/ai-chat/api/post-chat.ts`) |
| Tools | Four portfolio tools: `show_about`, `show_projects`, `show_experience`, `show_tech_stack` |
| Structured UI | Tool outputs render as React components — `Projects`, `Experience`, `About`, `TechStack` (`features/chat-ui/components/message.tsx`) |
| About mode | Word-streamed about copy; About card suppressed; `data-related` suggestions injected (`lib/ai/about-stream-mode.ts`) |
| Follow-up narration | Server injects hard-coded follow-up text after projects and tech-stack tool output |
| Artifacts | Clicking a project card opens the artifact panel with `FeaturedProject` |
| Off-topic guard | System prompt declines unrelated questions |
| Dev/e2e | `CHAT_MOCK_STREAM=true` bypasses LLM for about streaming tests |

**What does not work yet (relative to the Knowledge Assistant spec):**

- No intent router — the model picks tools from prompt instructions only
- No markdown knowledge files — all context lives in TypeScript/JSON under `data/`
- No project-specific Q&A — "Tell me about AudioGraph" is a generic conversational reply, not grounded project context
- Follow-up suggestions are static strings, not generated from the conversation

---

## Where are the static suggestions?

### 1. Initial empty-state pills (before first message)

**File:** `features/chat-ui/components/suggestions.tsx`

```ts
const SUGGESTIONS = [
  "Show me some projects",
  "Tell me about yourself",
  "What's your tech stack?",
  "What's your experience",
];
```

Shown when `messages.length === 0` in `features/chat-ui/components/chat.tsx`. Clicking sends the string as the user message (with a special case mapping `"Experience"` → `"Show my work experience"`).

### 2. Per-tool `related` arrays (post-response follow-ups)

Hard-coded in each tool's `execute` return value:

| Tool | File | Suggestions |
|------|------|-------------|
| `show_about` | `lib/ai/tools/about.ts` → `aboutRelated` | "Show me your projects", "What's your experience?", "What's your tech stack?" |
| `show_projects` | `lib/ai/tools/show-projects.ts` | "Tell me about a specific project", "What technologies do you use?", "Show me your experience" |
| `show_experience` | `lib/ai/tools/show-experience.ts` | "Show me some projects", "Tell me about yourself", "What's your tech stack?" |
| `show_tech_stack` | `lib/ai/tools/show-tech-stack.ts` | "Show me some projects", "What's your experience?", "Tell me about yourself" |

About suggestions are also injected server-side as a `data-related` stream part in `post-chat.ts` when about text mode runs.

### 3. Server-injected follow-up copy (not clickable suggestions, but static text)

**File:** `features/ai-chat/api/post-chat.ts`

- `projectsFollowUp` — built from first 3 project titles in `data/projects.ts`
- `techStackFollowUp` — fixed string: *"Here's the tech stack. Want to hear about a specific technology?..."*

### 4. UI rendering of suggestions

**File:** `features/chat-ui/components/message.tsx`

- `data-related` parts → `Related` component
- Tool `output.related` → `Related` below tool UI (projects, experience, about)
- `getRelatedForMessage()` also surfaces projects/tech-stack `related` when a text part exists

---

## Where does the project list come from?

**Single source:** `data/projects.ts`

- Typed `Project[]` array (`projectsUnsorted`), sorted by `position`, default-exported
- Rich fields: `id`, `title`, `description`, `shortDescription`, `tech`, `features`, `metrics`, `problem`, `solution`, etc.
- Consumed by:
  - `lib/ai/tools/show-projects.ts` — returns full array to the model stream and client
  - `features/ai-chat/api/post-chat.ts` — reads first 3 titles for follow-up copy
  - Artifact / featured project UI via client selection

There are **no** separate markdown knowledge files for projects today.

---

## What API route handles chat?

```
POST /api/chat
```

| Layer | Path |
|-------|------|
| Route (thin) | `app/api/chat/route.ts` — re-exports `POST` |
| Handler | `features/ai-chat/api/post-chat.ts` |

**Request:** `{ messages: UIMessage[] }` — 400 if missing/empty.

**Response:** `createUIMessageStreamResponse` (AI SDK UI message stream, SSE-compatible with `useChat`).

**Pipeline:**

1. `toSimpleModelMessages(messages)` — text parts only sent to model
2. `streamText` with `models.chat`, `portfolioChatTools`, system prompt, `stopWhen: stepCountIs(1)`
3. Stream chunks forwarded to client with special handling for about mode and post-tool follow-up text

Legacy shims at `@/lib/ai/*` re-export from `features/ai-chat/` and `lib/ai/tools/`.

---

## What shape does the chat response currently have?

Responses are a **UI message stream**, not a single JSON object. Each assistant turn becomes a `UIMessage` with a `parts` array.

### Part types the client understands

| Part type | When | Payload / behavior |
|-----------|------|-------------------|
| `text` | Model or server `streamCopy` | `{ text: string }` — rendered as `MessageResponse` |
| `tool-show_about` | About tool (often suppressed in text mode) | `state`, `output: { title, paragraphs, socialLinks, related? }` |
| `tool-show_projects` | Projects tool | `output: { projectCount, projects: Project[], related? }` |
| `tool-show_experience` | Experience tool | `output: { experience, copy, related? }` |
| `tool-show_tech_stack` | Tech stack tool | `output: { technologies, tech, related? }` |
| `data-related` | About text mode (server-injected) | `data: { suggestions: string[] }` |

Tool parts progress through states: `input-streaming` → `input-available` → `output-available` (or `output-error`).

### Tool output shapes (summary)

```ts
// show_projects
{ projectCount: number; projects: Project[]; related: string[] }

// show_experience
{ copy: string; experience: ExperienceEntry[]; related: string[] }

// show_about (tool — often replaced by text mode)
{ title: string; paragraphs: string[]; socialLinks: [...]; related: string[] }

// show_tech_stack
{ technologies: string[]; tech: Record<string, TechItem[]>; related: string[] }
```

There is **no** top-level response field for `intent`, `contextUsed`, or dynamically generated `suggestions` outside the part types above.

---

## What should stay the same?

Per the Knowledge Assistant spec, Stage 1 should **integrate with** — not replace — the existing stack:

| Keep | Why |
|------|-----|
| Chat UI (`features/chat-ui/`) | Spec: "existing chat UI continues to work" |
| `POST /api/chat` + `useChat` transport | Spec: "integration with the existing chat API and UI" |
| Tool-based display for list/overview intents | `show_projects`, `show_tech_stack`, etc. should still return structured UI where appropriate |
| `MessagePartRenderer` part-type routing | Extend with new part types if needed; don't rebuild message rendering |
| `data/*` as source of truth for structured portfolio content | Stage 1 adds markdown knowledge **alongside**, not a full DB migration |
| Thin route → `features/ai-chat/` pattern | Established architecture |
| About text stream mode | Working UX; may coexist with new context loading |
| Artifact panel for project deep-dive UI | Out of scope to rebuild |

**Explicitly out of scope for Stage 1 (stay unchanged / not built):**

- GitHub repo scanning, vector search, embeddings, full agent workflow
- Database-backed knowledge storage
- Resume PDF parsing
- Rebuilding the entire chat UI

---

## What is the exact problem?

The chat **works**, but key parts of the experience are **static and context-blind**:

1. **Static follow-up suggestions** — Every tool returns the same 3 hard-coded `related` strings regardless of what the user asked or what the assistant just said. Initial pills never change. The spec wants suggestions derived from user message + assistant response + intent + context used.

2. **No intent router** — Tool selection relies on a short system prompt (`lib/ai/prompts/portfolio-assistant.ts`). There is no explicit intent classification (`show_projects`, `project_overview`, `project_architecture`, etc.). The assistant does not reliably know which portfolio context to load.

3. **No portfolio knowledge layer** — Context is embedded in TypeScript (`data/projects.ts`, `data/about.ts`, `data/experience.ts`, `data/tech.json`) and a minimal system prompt. There are no markdown knowledge files. Project-specific questions do not load AudioGraph (or any project) context before answering.

4. **Generic answers for specific questions** — "Tell me about AudioGraph" goes to the model with no project-scoped context. The model may invent or generalize instead of citing known portfolio facts.

5. **No dynamic content path** — The spec describes: user message → intent router → load context → generate/render response → generate suggestions. Today the path is: user message → model (prompt-only routing) → optional single tool call → static related strings.

**Success criteria from the spec that are not met:**

- Static follow-up questions replaced with dynamic suggestions
- Project questions use project-specific context
- Candidate questions use candidate profile context
- Assistant does not invent details outside portfolio knowledge

---

## Quick file map

```
app/api/chat/route.ts              → thin POST export
features/ai-chat/api/post-chat.ts  → stream handler, follow-up injection
features/ai-chat/lib/              → about-stream-mode, stream-copy, message conversion
lib/ai/prompts/portfolio-assistant.ts → system prompt (tool routing rules)
lib/ai/tools/                      → show_about, show_projects, show_experience, show_tech_stack
features/chat-ui/components/       → chat, message, suggestions, messages
contexts/chat-context.tsx          → useChat → /api/chat
data/projects.ts                   → project list source
data/about.ts, experience.ts, tech.json → other portfolio data
```

**Not started:** markdown knowledge files, intent router, context loader, dynamic suggestion generator.
