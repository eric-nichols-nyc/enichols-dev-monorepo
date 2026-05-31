# Knowledge Assistant — Intent Router

**Status:** Not started  
**Depends on:** [Overview](./08-knowledge-assistant) · [01 — Current State](./current-state.md) · [02 — Knowledge Sources](./02-knowledge-sources.md)  
**Feeds:** Context loader, response handler, and dynamic suggestions specs (future docs in this series)

---

## Goal

Define how the Dynamic Portfolio Assistant **determines user intent**, **selects portfolio knowledge**, **chooses a response type**, and **passes structured context to the chat API**—using **rule-based detection only** in Stage 1.

The intent router is the first decision step after a user message (or clicked suggestion) arrives. It replaces prompt-only tool routing with explicit, testable rules.

---

## 1. Purpose

### Why intent routing is needed

Today, the chat handler sends every message to the model with a short system prompt. The model decides whether to call a display tool or answer conversationally. That approach causes predictable failures documented in [01 — Current State](./current-state.md):

| Problem | Without intent routing |
|---------|------------------------|
| Wrong response shape | “Show me your projects” may produce prose instead of the project grid |
| Missing context | “Tell me about AudioGraph” gets no project markdown before generation |
| Over-loaded prompts | No way to load only the files relevant to the question |
| Static follow-ups | Downstream suggestion logic has no stable `intent` + `entities` to read |
| Ungrounded answers | The model improvises architecture, metrics, or APIs not in portfolio materials |

Intent routing solves this by making the **first** server-side decision deterministic:

1. **What the user wants** (intent label)
2. **Which entities are involved** (e.g. project slug `audiograph`)
3. **Which knowledge files to load** (explicit paths from [02 — Knowledge Sources](./02-knowledge-sources.md))
4. **How the response should be produced** (static UI, grounded AI, or both)

Stage 1 does **not** use embeddings, vector search, semantic search, AI classification, or multi-agent workflows. Every route must be explainable from keyword/phrase rules and lookup tables.

---

## 2. Responsibilities

The intent router is a **pure function** over the user message (and optional metadata). It does not call the LLM.

| Responsibility | Description |
|----------------|-------------|
| **Detect user intent** | Map normalized user text → one primary intent (and optional secondary hints for suggestions). |
| **Select knowledge source** | Produce an ordered list of markdown paths under `knowledge/` (or `none` for display-only intents). |
| **Determine response type** | Label the turn as Static Display, Context-Aware AI, or Hybrid. |
| **Resolve entities** | Extract project slug, category filter, or section focus when the intent requires it. |
| **Pass context to the chat API** | Emit a **routing result** object consumed by the context loader and response handler (see §7). |

### Non-responsibilities (Stage 1)

| Out of scope for the router | Handled elsewhere |
|-----------------------------|-------------------|
| Reading files from disk | Context loader spec |
| Streaming text or invoking tools | Response handler / existing `post-chat.ts` pipeline |
| Generating follow-up suggestions | Dynamic suggestions spec |
| Validating portfolio facts | Knowledge authoring + grounding constraints in [02](./02-knowledge-sources.md) |

---

## 3. Intent Types

Each intent has a stable string id used across logging, context loading, and suggestion generation.

### 3.1 Display intents

Trigger structured UI via existing portfolio tools. Knowledge files are **optional** (for brief narration or follow-up Q&A).

| Intent | Meaning | Typical tool |
|--------|---------|--------------|
| `show_projects` | User wants the project list/grid | `show_projects` |
| `show_tech_stack` | User wants the tech stack visualization | `show_tech_stack` |
| `show_experience` | User wants the experience timeline/cards | `show_experience` |

> `show_experience` is included because it is a shipped display tool and appears in initial suggestion pills. It follows the same routing pattern as `show_projects` and `show_tech_stack`.

### 3.2 Candidate intents

Ground answers in `knowledge/candidate/*`.

| Intent | Meaning |
|--------|---------|
| `candidate_overview` | Who Eric is — summary, strengths, working style |
| `ai_experience` | AI-related work across projects and roles |
| `design_system_experience` | Design-system work (IBM, agency roles, component libraries) |

### 3.3 Project intents

Require a **resolved project slug** (`audiograph`, `ai-taskwizard`, `trellnode`, `github-codebase-copilot`). If slug resolution fails, router returns `general_question` with `clarificationNeeded: true` (see §5.4).

| Intent | Meaning |
|--------|---------|
| `project_overview` | What the project is, problem, solution, links |
| `project_architecture` | System design, data flow, integrations, stack |
| `project_challenges` | Hard problems, lessons learned |

### 3.4 Fallback intent

| Intent | Meaning |
|--------|---------|
| `general_question` | Portfolio-related question that does not match a narrower rule; may load partial candidate or project context based on keywords |

---

## 4. Example User Messages

Examples below are **illustrative**, not an exhaustive rule list. Implementation uses ordered keyword/phrase rules (§5).

### `show_projects`

- Show me your projects
- Show me some projects
- What projects have you built?
- List your work

### `show_tech_stack`

- What's your tech stack?
- Show me your tech stack
- What technologies do you use?

### `show_experience`

- Show my work experience
- What's your experience?
- Show me your experience
- Tell me about your career timeline

### `candidate_overview`

- Tell me about yourself
- Who is Eric?
- Give me an overview of your experience
- What's your background?

### `project_overview`

- Tell me about AudioGraph
- What is AI-TaskWizard?
- Give me an overview of Trellix
- Describe the GitHub Codebase Copilot project

### `project_architecture`

- How does AudioGraph collect data?
- What's the architecture of AI-TaskWizard?
- How is Trellix deployed?
- What APIs does AudioGraph use?
- Explain the data flow for GitHub Codebase Copilot

### `project_challenges`

- What was the hardest part of AudioGraph?
- What challenges did you face on Trellix?
- What did you learn building AI-TaskWizard?
- What went wrong on GitHub Codebase Copilot?

### `ai_experience`

- What AI projects have you built?
- Tell me about your AI work
- Have you integrated LLMs in production?
- What experience do you have with the Vercel AI SDK?

### `design_system_experience`

- Tell me about your design system work
- Have you built component libraries?
- What's your Storybook experience?
- Did you work on design systems at IBM?

### `general_question`

- How do you approach testing?
- Are you open to remote work?
- What's your favorite part of full-stack development?
- Tell me more (after a prior answer, when no rule matches)

---

## 5. Rule-Based Detection (Stage 1)

Detection runs **before** any LLM call. Rules are evaluated in **priority order**; the first match wins unless a higher-priority entity rule applies.

### 5.1 Normalization

Apply to every user message before matching:

1. Trim whitespace; collapse repeated spaces
2. Lowercase for matching (preserve original for display/logging)
3. Strip trailing `?`, `.`, `!`
4. Map known suggestion aliases (e.g. `"Experience"` pill → `"Show my work experience"` per [01 — Current State](./current-state.md))

### 5.2 Priority tiers

| Tier | Rule family | Beats |
|------|-------------|-------|
| 1 | Exact / near-exact display phrases | Everything below |
| 2 | Project name + architecture/challenge keywords | Generic project overview |
| 3 | Project name alone (or “tell me about {title}”) | Candidate / general |
| 4 | Category intents (`ai_experience`, `design_system_experience`) | `general_question` |
| 5 | Candidate overview phrases | `general_question` |
| 6 | Default | `general_question` |

### 5.3 Keyword rule tables

#### Display intents (Tier 1)

| Intent | Match when message contains (any) |
|--------|-----------------------------------|
| `show_projects` | `show me your projects`, `show me some projects`, `show your projects`, `list your projects`, `what projects` |
| `show_tech_stack` | `tech stack`, `show me your tech stack`, `what's your tech stack`, `what technologies do you use` |
| `show_experience` | `show my work experience`, `show me your experience`, `work experience`, `career timeline` |

**Note:** “What's your experience?” without “show” may match `candidate_overview` (Tier 5) or `show_experience` depending on exact phrase list—**prefer `show_experience`** when the message includes `show` or `timeline`; prefer **`candidate_overview`** for “tell me about yourself” / “who is eric” style phrasing.

#### Project sub-intents (Tier 2 — requires resolved slug)

| Intent | Match when message contains (any) + project entity resolved |
|--------|-------------------------------------------------------------|
| `project_architecture` | `architecture`, `how does`, `how do`, `data flow`, `deploy`, `api`, `apis`, `integrat`, `collect data`, `system design`, `stack` (when asking how, not listing) |
| `project_challenges` | `hardest`, `challenge`, `difficult`, `lesson`, `learned`, `went wrong`, `obstacle`, `problem you faced` |
| `project_overview` | `tell me about`, `what is`, `describe`, `overview of`, `about` + project name/title |

Tier 2 evaluation order: **`project_challenges`** before **`project_architecture`** before **`project_overview`** when multiple keyword groups match.

#### Category intents (Tier 4)

| Intent | Match when message contains (any) |
|--------|-----------------------------------|
| `ai_experience` | `ai project`, `ai work`, `llm`, `large language`, `vercel ai`, `gemini`, `openai`, `machine learning`, `ai experience`, `ai integration` |
| `design_system_experience` | `design system`, `component library`, `storybook`, `design token`, `figma component` |

#### Candidate overview (Tier 5)

| Intent | Match when message contains (any) |
|--------|-----------------------------------|
| `candidate_overview` | `tell me about yourself`, `who is eric`, `about you`, `your background`, `overview of your experience`, `introduce yourself` |

#### Default (Tier 6)

| Intent | Match |
|--------|-------|
| `general_question` | No higher-tier rule matched; message is still portfolio/on-topic per existing off-topic guard |

### 5.4 Entity resolution (projects)

Resolve slug **before** project intents bind:

| Step | Action |
|------|--------|
| 1 | Exact match on `data/projects[].id` in message (e.g. `audiograph`, `ai-taskwizard`) |
| 2 | Case-insensitive match on `data/projects[].title` (e.g. `AudioGraph` → `audiograph`) |
| 3 | Alias lookup in `knowledge/manifest.yaml` if present (e.g. `Trellix` → `trellnode`) |

**Failure:** If user message matches project-shaped phrasing (“tell me about X”) but slug is unknown → intent `general_question`, flag `clarificationNeeded: true`, suggest `show_projects` in downstream handler.

### 5.5 Conflicts and tie-breakers

| Conflict | Resolution |
|----------|------------|
| Display vs overview (“show projects” vs “what projects have you built”) | Phrases with **show** / **list** → display intent; **what projects have you built** → `show_projects` (still display) |
| `show_tech_stack` vs explanatory tech question | “What technologies do you use?” → **`show_tech_stack`** (Hybrid per §6); “How have you used Next.js in production?” → **`general_question`** + load `tech-stack.md` |
| Project overview vs `ai_experience` | Named project in message → project intent; no project + AI keywords → `ai_experience` |
| `candidate_overview` vs `show_experience` | “Overview of **your** experience” → candidate; “Show **my** work experience” → display |

---

## 6. Context Mapping

Paths are relative to `apps/portfolio-chat/knowledge/`. Section slices follow [02 — Knowledge Sources §4](./02-knowledge-sources.md#section-depth-by-intent-loading-subsets).

### 6.1 By intent

| Intent | Knowledge files | Section slices (when applicable) |
|--------|-----------------|----------------------------------|
| `show_projects` | **None** for model context | UI from `data/projects.ts`; optional `manifest.yaml` only for suggestions |
| `show_tech_stack` | `candidate/tech-stack.md` | Full file optional; UI from `data/tech.json` |
| `show_experience` | `candidate/experience.md` | Full file optional; UI from `data/experience.ts` |
| `candidate_overview` | `candidate/candidate-profile.md` | Full file |
| `ai_experience` | `candidate/experience.md`, `candidate/tech-stack.md` (AI subsection), matching `projects/*.md` | Project files: **Overview** only; filter via `manifest.yaml` tags/categories (`ai`) |
| `design_system_experience` | `candidate/experience.md` | IBM, Havas, Imagination sections; optional `projects/ai-taskwizard.md` Overview if cited in experience |
| `project_overview` | `projects/{slug}.md` | Overview, Problem, Solution, Links |
| `project_architecture` | `projects/{slug}.md` | Overview, Architecture, Tech Stack |
| `project_challenges` | `projects/{slug}.md` | Overview, Challenges, Lessons Learned |
| `general_question` | **0–2 files** based on keyword hints | See §6.2 |

**Hard cap:** Max **3 files** per request ([02 §5.3](./02-knowledge-sources.md#53-token-budget-rules)).

### 6.2 `general_question` context hints

| Keywords in message | Additional files |
|---------------------|------------------|
| `react`, `next`, `typescript`, `tailwind`, stack terms | `candidate/tech-stack.md` |
| `job`, `role`, `company`, `career`, employer names | `candidate/experience.md` |
| `you`, `your`, `eric`, `background` | `candidate/candidate-profile.md` |
| Resolved project slug | `projects/{slug}.md` (Overview + best-effort section) |

If no hint matches, load **`candidate/candidate-profile.md`** only as a safe default for on-topic portfolio questions.

### 6.3 Example mappings (named projects)

| User message | Intent | Files |
|--------------|--------|-------|
| Tell me about yourself | `candidate_overview` | `candidate/candidate-profile.md` |
| Show me your tech stack | `show_tech_stack` | `candidate/tech-stack.md` (optional) |
| Show me your projects | `show_projects` | *(none)* |
| Tell me about AudioGraph | `project_overview` | `projects/audiograph.md` |
| How does AudioGraph collect data? | `project_architecture` | `projects/audiograph.md` |
| What was the hardest part of AudioGraph? | `project_challenges` | `projects/audiograph.md` |
| What AI projects have you built? | `ai_experience` | `candidate/experience.md`, `projects/ai-taskwizard.md`, `projects/github-codebase-copilot.md`, … |
| Tell me about your design system work | `design_system_experience` | `candidate/experience.md` |

---

## 7. Response Types

Three response categories determine how the chat API assembles the assistant turn.

### 7.1 Static Display Response

**Definition:** Structured UI from existing tools + `data/*`; minimal or no LLM generation for the main content.

| Aspect | Behavior |
|--------|----------|
| Primary output | Tool part (`tool-show_projects`, `tool-show_experience`, `tool-show_tech_stack`) |
| Knowledge files | Not required for rendering; may load optionally for a one-sentence intro |
| Model call | May be skipped or limited to a short intro line (implementation choice in response handler) |

**Examples:**

| User message | Intent | Response type |
|--------------|--------|---------------|
| Show me your projects | `show_projects` | Static Display |
| Show my work experience | `show_experience` | Static Display |

### 7.2 Context-Aware AI Response

**Definition:** Load markdown knowledge → inject into system/context → model generates **grounded** prose. No primary structured UI artifact.

| Aspect | Behavior |
|--------|----------|
| Primary output | `text` part(s) |
| Knowledge files | **Required** per §6 |
| Grounding | Answer from loaded content only; defer when fact is missing ([02 §5.5](./02-knowledge-sources.md#55-grounding-constraint-for-downstream-specs)) |

**Examples:**

| User message | Intent | Response type |
|--------------|--------|---------------|
| Tell me about AudioGraph | `project_overview` | Context-Aware AI |
| Tell me about yourself | `candidate_overview` | Context-Aware AI |
| What was the hardest part of Trellix? | `project_challenges` | Context-Aware AI |

### 7.3 Hybrid Response

**Definition:** Structured UI **plus** grounded or narrative AI content (tool output and/or streamed text).

| Aspect | Behavior |
|--------|----------|
| Primary output | Tool part + optional `text` narration |
| Knowledge files | Loaded for explanation/Q&A portion |
| Typical use | Display intent where user also asked an explanatory question |

**Examples:**

| User message | Intent | Response type |
|--------------|--------|---------------|
| What technologies do you use? | `show_tech_stack` | Hybrid (grid + explanation from `tech-stack.md`) |
| Show me your tech stack and explain your AI tools | `show_tech_stack` | Hybrid |
| What AI projects have you built? | `ai_experience` | Hybrid optional (prose + may suggest `show_projects`) |

### 7.4 Response type by intent (default)

| Intent | Default response type |
|--------|------------------------|
| `show_projects` | Static Display |
| `show_tech_stack` | Hybrid |
| `show_experience` | Static Display |
| `candidate_overview` | Context-Aware AI |
| `project_overview` | Context-Aware AI |
| `project_architecture` | Context-Aware AI |
| `project_challenges` | Context-Aware AI |
| `ai_experience` | Context-Aware AI (Hybrid optional) |
| `design_system_experience` | Context-Aware AI |
| `general_question` | Context-Aware AI |

---

## 8. Routing Flow

High-level pipeline from user input to UI. The intent router occupies the first server-side decision block.

```txt
User Message (text or clicked suggestion)
        ↓
┌───────────────────┐
│   Intent Router   │  normalize → match rules → resolve entities
└─────────┬─────────┘
          ↓
   Routing Result { intent, entities, knowledgePaths, sections,
                    responseType, clarificationNeeded? }
          ↓
┌───────────────────┐
│ Load Knowledge    │  read markdown files (server-only fs)
│ Sources           │  apply section slices; enforce max 3 files
└─────────┬─────────┘
          ↓
┌───────────────────┐
│ Build Context     │  assemble system/context payload for model;
│                   │  attach tool directives for display/hybrid intents
└─────────┬─────────┘
          ↓
┌───────────────────┐
│ Generate Response │  invoke tools and/or streamText per responseType
└─────────┬─────────┘
          ↓
┌───────────────────┐
│ Generate          │  use intent + entities + loaded sections +
│ Suggestions       │  assistant text (future spec)
└─────────┬─────────┘
          ↓
Return assistant UIMessage stream to client
```

### 8.1 Routing result contract (passed to chat API)

Conceptual shape for downstream specs—**not** implementation code:

| Field | Type | Description |
|-------|------|-------------|
| `intent` | string | Primary intent id (§3) |
| `entities` | object | e.g. `{ projectSlug?: string, categories?: string[] }` |
| `knowledgePaths` | string[] | Relative paths under `knowledge/`; empty for pure display |
| `sectionSlices` | map | Optional `{ path: string[] }` section names per file |
| `responseType` | enum | `static_display` \| `context_aware_ai` \| `hybrid` |
| `tool` | string? | Tool name when display/hybrid requires it |
| `clarificationNeeded` | boolean | True when project referenced but slug unresolved |
| `originalMessage` | string | Preserved user text for logging and suggestions |

The chat API (`POST /api/chat`) receives this from the router **before** `streamText` or tool execution. Today’s handler (`features/ai-chat/api/post-chat.ts`) will be extended in a later spec to consume `routingResult` instead of relying on prompt-only tool selection.

### 8.2 Integration with existing tools

| Intent | Existing tool | Notes |
|--------|---------------|-------|
| `show_projects` | `show_projects` | Unchanged payload from `data/projects.ts` |
| `show_tech_stack` | `show_tech_stack` | Unchanged payload from `data/tech.json` |
| `show_experience` | `show_experience` | Unchanged payload from `data/experience.ts` |
| `candidate_overview` | May use about text stream **or** grounded chat | Align with open question in [02](./02-knowledge-sources.md#open-questions) |
| Project / category / general intents | No dedicated tool | Text response with loaded context |

---

## 9. Stage 1 Constraints

### 9.1 Keep it simple

| Constraint | Rationale |
|------------|-----------|
| Rule-based only | Testable, no embedding infra, matches [08 — Overview](./08-knowledge-assistant) Stage 1 |
| Ordered keyword lists | One maintainable module; no ML, no LLM classifier |
| Single primary intent | Avoid multi-intent fusion in Stage 1 |
| Hand-maintained aliases | `manifest.yaml` for Trellix → `trellnode`, AI project lists |
| No runtime learning | Rules change only via code/config deploy |

### 9.2 Explicitly forbidden (Stage 1)

- Embeddings and vector search
- Semantic / similarity search over messages or documents
- LLM-based intent classification (“ask the model what intent”)
- Agent orchestration or planner loops
- Fuzzy NLP libraries beyond string `includes` / regex lists

### 9.3 Maintainability guidelines

- Group rules by intent in one registry document or constant map—**avoid** scattered string checks across the API handler
- Every rule should have at least one **unit-test message** mirroring §4 examples
- Log `{ intent, projectSlug, responseType }` on each request for debugging
- When adding a project: update `data/projects.ts`, `knowledge/projects/{id}.md`, and optional `manifest.yaml`—router picks up new titles via data lookup

### 9.4 Out of scope for this spec

| Item | Spec |
|------|------|
| File I/O and section parsing | Context loader |
| `streamText` / tool wiring changes | Response handler |
| Suggestion algorithm | Dynamic suggestions |
| UI changes | Chat UI specs |
| Implementation code | This document is requirements only |

---

## System boundaries

| In scope | Out of scope |
|----------|--------------|
| Intent ids, rules, priorities, tie-breakers | Markdown authoring ([02](./02-knowledge-sources.md)) |
| Entity resolution contract | Reading files from disk |
| Context path mapping per intent | Grounding prompt wording |
| Response type classification | Replacing chat UI |
| Routing result contract for API | `@repo/ai` package changes |

---

## Requirements summary

| ID | Requirement |
|----|-------------|
| IR1 | Every user message maps to exactly one primary intent before LLM/tool execution |
| IR2 | Detection uses rule-based keyword/phrase matching only—no AI classification |
| IR3 | Project intents require resolved slug via `data/projects` + optional manifest aliases |
| IR4 | Each intent maps to an explicit knowledge file list (or none) per §6 |
| IR5 | Each intent maps to a default response type per §7.4 |
| IR6 | Router emits a structured routing result for the chat API per §8.1 |
| IR7 | Max 3 knowledge files enforced at context load (router must not exceed cap) |
| IR8 | Unresolved project references set `clarificationNeeded` instead of loading wrong file |

---

## Acceptance criteria

- [ ] All intents in §3 are documented with example messages (§4)
- [ ] Context mapping table (§6) is implementable without ambiguity
- [ ] Response types (§7) cover all example flows in [08 — Overview](./08-knowledge-assistant)
- [ ] Routing flow (§8) aligns with overview diagram and existing `POST /api/chat` pipeline
- [ ] No dependency on embeddings, vector DB, semantic search, or agent frameworks
- [ ] Downstream context-loader and response-handler specs can consume §8.1 without redefining intents
- [ ] Rule priority and tie-breakers (§5) resolve conflicts listed in §5.5

---

## Open questions

- [ ] Should “What's your experience?” default to `show_experience` (display) or `candidate_overview` (prose)? Current recommendation: **display** if message contains `show`/`timeline`; otherwise **candidate overview** for narrative background questions.
- [ ] For `show_tech_stack`, is Hybrid always default, or Static Display when message is an exact pill match (“What's your tech stack?”)?
- [ ] Should router run on **every** message including mid-thread follow-ups, or cache last intent for ambiguous “tell me more”?
- [ ] Export `routingResult` to client for debugging/analytics, or keep server-only in Stage 1?

---

## Reference (not requirements)

- [08 — Overview](./08-knowledge-assistant) — product goal and intent list
- [01 — Current State](./current-state.md) — today’s tools, suggestions, API shape
- [02 — Knowledge Sources](./02-knowledge-sources.md) — file layout, section slices, loading rules
- `features/ai-chat/api/post-chat.ts` — current stream handler
- `lib/ai/prompts/portfolio-assistant.ts` — prompt-only routing to replace

---

## Implementation prompt (for a later session)

1. Read this spec, [02 — Knowledge Sources](./02-knowledge-sources.md), and [01 — Current State](./current-state.md) before coding.
2. Implement the router as a pure function under `features/ai-chat/` (e.g. `utils/intent-router.ts`) with unit tests for §4 examples and §5.5 conflicts.
3. Do **not** add embeddings, vector search, or LLM classification.
4. Wire routing into `post-chat.ts` only when the response-handler spec is approved; until then, tests may run against the router in isolation.
5. Update [progress-tracker.md](../../context/progress-tracker.md) when shipped.
