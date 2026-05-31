# Knowledge Assistant — Response Handler

**Status:** Shipped  
**Stage:** 4  
**Depends on:** [03 — Intent Router](./03-intent-router.md) · [04 — Context Loader](./04-context-loader.md) · [06-ai-chat.md](../06-ai-chat.md)  
**Feeds:** [06 — Dynamic Suggestions](./06-dynamic-suggestions.md)

---

## Goal

Extend `POST /api/chat` so each turn runs **intent routing → knowledge loading → response assembly** before streaming to the client. Replace prompt-only tool selection with deterministic behavior per [03 §7](./03-intent-router.md#7-response-types).

---

## User story

As a visitor, when I ask “Tell me about AudioGraph” or “Show me your projects,” the assistant uses the right portfolio context and response shape—grounded prose for Q&A, structured UI for list intents—without generic or hallucinated answers.

---

## Requirements

### Pipeline (every non-mock request)

- [ ] **RH1** — Extract latest **user** text from `messages` (last message with role `user`, text parts only)
- [ ] **RH2** — Call `routeIntent(userText)` → `RoutingResult`
- [ ] **RH3** — Call `loadKnowledgeContext(routingResult)` → `LoadedKnowledgeContext`
- [ ] **RH4** — Log server-side: `{ intent, projectSlug: entities.projectSlug, responseType }`
- [ ] **RH5** — Branch on `responseType` (see below)
- [ ] **RH6** — Preserve existing mock stream path (`CHAT_MOCK_STREAM=true`) unchanged

### Response type: `static_display`

- [ ] **RH7** — Force execution of mapped tool (`show_projects`, `show_experience`, `show_tech_stack`) without relying on model tool choice
- [ ] **RH8** — Implementation options (pick one, document in tracker):
  - **A:** `streamText` with `toolChoice: { type: 'tool', toolName }` if supported by `@repo/ai`
  - **B:** Direct tool `execute()` + emit tool parts via `createUIMessageStream` writer (bypass model for tool body)
- [ ] **RH9** — Do **not** inject hard-coded `projectsFollowUp` / `techStackFollowUp` strings ([06-ai-chat R10–R11](../06-ai-chat.md)) once [06 — Dynamic Suggestions](./06-dynamic-suggestions.md) ships; until then, keep as fallback behind feature flag if needed
- [ ] **RH10** — Exact pill match for `show_tech_stack` → Static Display only (no extra prose) per [00 § Phase 0](./00-implementation-stages.md#resolved-decisions)

### Response type: `context_aware_ai`

- [ ] **RH11** — Build system prompt = base portfolio prompt + **grounding block** from `formatKnowledgeForPrompt(context)`
- [ ] **RH12** — Grounding block must include [02 §5.5](./02-knowledge-sources.md#55-grounding-constraint-for-downstream-specs) constraints: answer from loaded content only; say when fact is missing
- [ ] **RH13** — `streamText` with **no tools** (or tools disabled) for pure Q&A turns — prevents spurious tool calls on “Tell me about AudioGraph”
- [ ] **RH14** — When `clarificationNeeded: true`: stream short clarifying text (“I don't see that project—here are Eric's projects”) + optionally force `show_projects` or defer to suggestions only

### Response type: `hybrid`

- [ ] **RH15** — Run display tool **and** stream brief grounded narration from loaded knowledge (e.g. tech stack grid + 1–2 sentences from `tech-stack.md`)
- [ ] **RH16** — Narration uses same grounding block as context-aware path
- [ ] **RH17** — Order: tool output first, then streamed text (match current projects/tech UX)

### `candidate_overview` + about-stream

- [ ] **RH18** — When intent is `candidate_overview` **and** message matches about pill phrases (`tell me about yourself`, etc.): **keep existing about-stream mode** ([06-ai-chat R9](../06-ai-chat.md)) using `data/about.ts` — do not break e2e
- [ ] **RH19** — Other `candidate_overview` phrasing (e.g. “Who is Eric?”) may use grounded stream from `candidate-profile.md` via context-aware path

### Model & stream

- [ ] **RH20** — Keep `stopWhen: stepCountIs(1)` unless hybrid requires tool + text in one step; document if step count increases
- [ ] **RH21** — Keep `toSimpleModelMessages` behavior for history ([06-ai-chat R8](../06-ai-chat.md))
- [ ] **RH22** — Slim `getPortfolioAssistantSystemPrompt()`: remove tool-routing instructions replaced by server-side routing; **keep off-topic decline** rule

### Milestone gating

- [ ] **RH23** — **M1 first:** wire `project_overview`, `project_architecture`, `project_challenges` only behind optional env `KNOWLEDGE_ASSISTANT_ENABLED=true` or ship incrementally per intent
- [ ] **RH24** — M2–M4 enable remaining intents per [00 — Milestones](./00-implementation-stages.md#vertical-milestones-ship-incrementally)

---

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `features/ai-chat/api/post-chat.ts` | Chat UI components |
| `features/ai-chat/utils/build-grounded-prompt.ts` | Intent rules (03) |
| `lib/ai/prompts/portfolio-assistant.ts` (slim) | Dynamic suggestions (06) |
| Tool execute paths in `lib/ai/tools/*` | `@repo/ai` package edits |

---

## API

Unchanged external contract:

```
POST /api/chat
Body: { messages: UIMessage[] }
200: UI message stream
```

Internal only: `RoutingResult`, `LoadedKnowledgeContext` — not exposed to client in Stage 1.

---

## Proposed file structure

```
features/ai-chat/
  api/post-chat.ts                 # orchestration
  utils/
    build-grounded-prompt.ts       # system + knowledge block
    execute-display-tool.ts        # optional: direct tool emit
  lib/                             # existing stream helpers
lib/ai/prompts/portfolio-assistant.ts
```

---

## Grounding prompt (minimum content)

```txt
## Portfolio knowledge (use ONLY this content to answer)

{formatted sections from LoadedKnowledgeContext}

## Rules
- Answer using the portfolio knowledge above only.
- If the answer is not in the knowledge, say: "I don't have that in Eric's portfolio materials."
- Do not invent metrics, APIs, architecture, or employers not stated above.
```

Base prompt retains Eric's assistant role and off-topic guard.

---

## Acceptance criteria

- [ ] “Tell me about AudioGraph” streams grounded answer citing Overview/Problem from `knowledge/projects/audiograph.md` (M1)
- [ ] “Show me your projects” renders project grid (tool UI), not prose-only reply (M2)
- [ ] “Tell me about yourself” still passes `e2e/about-streaming.spec.ts` (RH18)
- [ ] Unknown project name → clarifying response, no wrong project file loaded
- [ ] `pnpm typecheck` passes; manual smoke on `pnpm dev`
- [ ] [06 — Dynamic Suggestions](./06-dynamic-suggestions.md) can read `RoutingResult` + `LoadedKnowledgeContext` from same turn context

---

## Out of scope

- New stream part types (use existing `text`, `tool-*`, `data-related`)
- Zod validation of request body (existing R17 backlog)
- Rate limiting (P8)

---

## Implementation prompt (for agents)

1. Read [current-state.md](./current-state.md) and existing `post-chat.ts` before editing.
2. Router + loader must have passing unit tests before integration.
3. Ship M1 behind flag if needed; do not big-bang all intents in one PR.
4. Do not remove about-stream until RH18 behavior verified in e2e.
