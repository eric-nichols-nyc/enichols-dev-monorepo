# Knowledge Assistant — Dynamic Suggestions

**Status:** Shipped  
**Stage:** 5  
**Depends on:** [05 — Response Handler](./05-response-handler.md) · [04 — Context Loader](./04-context-loader.md) · [02-chat-ui.md](../02-chat-ui.md)  
**Feeds:** [07 — Integration & Cleanup](./07-integration-cleanup.md)

---

## Goal

Replace **static** follow-up suggestions with suggestions derived from **intent**, **entities**, **loaded knowledge sections**, and the **assistant's latest response**—using existing UI channels (`data-related` parts and tool `output.related`).

No chat UI rebuild. No new pill component.

**Human explainer (how to describe this in conversation):** [how-dynamic-suggestions-work.md](../../reference/how-dynamic-suggestions-work.md)

---

## User story

As a visitor, after asking about AudioGraph, I want follow-up pills like “How does AudioGraph collect data?” and “What was the hardest technical challenge?” so I can explore Eric's work naturally.

---

## Current behavior (to replace)

Documented in [current-state.md](./current-state.md):

| Source | Location |
|--------|----------|
| Initial empty-state pills | `features/chat-ui/components/suggestions.tsx` — **keep for Stage 1** |
| Tool `related` arrays | `lib/ai/tools/about.ts`, `show-*.ts` |
| Server follow-up copy | `post-chat.ts` `projectsFollowUp`, `techStackFollowUp` |
| About suggestions | `data-related` in about-stream path |

---

## Requirements

### Output contract (unchanged client shape)

- [ ] **DS1** — Emit suggestions via existing mechanisms:
  - `data-related` stream part: `{ data: { suggestions: string[] } }`
  - Tool output field: `related: string[]` (max **3** suggestions per turn)
- [ ] **DS2** — Suggestions are **clickable strings** sent as the next user message (existing `Related` component behavior)
- [ ] **DS3** — Generate **after** main response content for the turn (text complete or tool output available)

### Stage 1 algorithm (rule-based first)

- [ ] **DS4** — Primary implementation: **template + intent map** — no second LLM call required for Stage 1
- [ ] **DS5** — Input to `generateSuggestions()`:

```ts
type SuggestionInput = {
  routingResult: RoutingResult;
  loadedContext: LoadedKnowledgeContext;
  assistantText?: string;      // streamed text if any
  toolName?: string;           // if display/hybrid tool ran
};
```

- [ ] **DS6** — Output: `string[]` length 2–3, unique, each ≤ 80 chars, phrased as natural questions

### Intent-based templates

| Intent | Suggestion strategy |
|--------|---------------------|
| `project_overview` | From project title + section headings: architecture question, challenges question, “Show me your other projects” |
| `project_architecture` | Challenges question, overview question, related tech from Tech Stack section |
| `project_challenges` | Architecture question, “What is {title}?”, show projects |
| `show_projects` | Name 2–3 project titles from `data/projects.ts`: “Tell me about {title}” |
| `show_tech_stack` | Pick technologies from loaded `tech-stack.md` or `data/tech.json`: “How have you used {tech}?” |
| `show_experience` | “Tell me about yourself”, “Show me your projects”, design-system or AI question if roles mention it |
| `candidate_overview` | show projects, show tech stack, show experience |
| `ai_experience` | Name AI project titles; “How does {title} use AI?” |
| `design_system_experience` | Storybook/component library questions from experience sections |
| `general_question` | Derive from loaded section headings; fallback to display intents |
| `clarificationNeeded` | “Show me your projects”, “Tell me about yourself”, “What's your tech stack?” |

- [ ] **DS7** — Project suggestions must use **resolved slug → display title** from `data/projects.ts`
- [ ] **DS8** — Do not suggest questions whose answers are absent from loaded knowledge (e.g. don't suggest “Metrics for X” if no Metrics section)

### Optional enhancement (Stage 1.5 — not required for ship)

- [ ] **DS9** — Optional LLM call with strict prompt: “Generate 3 follow-up questions answerable from this context only” — only if rule-based quality is insufficient; feature-flagged

### Integration points

- [ ] **DS10** — Response handler calls `generateSuggestions()` at end of turn; writes `data-related` or merges into tool output `related`
- [ ] **DS11** — Remove static `related` exports from tools when dynamic path is active ([07](./07-integration-cleanup.md))
- [ ] **DS12** — Remove `projectsFollowUp` / `techStackFollowUp` hard-coded strings from `post-chat.ts`; optional one-line intro may remain if not a “suggestion”

### Initial empty-state pills

- [ ] **DS13** — **Keep** `SUGGESTIONS` in `suggestions.tsx` for `messages.length === 0` in Stage 1
- [ ] **DS14** — Future: intent-aware empty state is out of scope Stage 1

---

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `features/ai-chat/utils/generate-suggestions.ts` | New UI components |
| Wiring in `post-chat.ts` | Client-side suggestion generation |
| Removing static `related` (with 07) | LLM-based suggestions (optional DS9) |

---

## Proposed file structure

```
features/ai-chat/
  utils/
    generate-suggestions.ts
    suggestion-templates.ts      # intent → template fns
  __tests__/
    generate-suggestions.test.ts
```

---

## Examples

**After `project_overview` for AudioGraph:**

```txt
How does AudioGraph collect data?
What was the hardest part of AudioGraph?
Show me your other projects
```

**After `show_projects`:**

```txt
Tell me about AudioGraph
Tell me about AI-TaskWizard
What's your tech stack?
```

---

## Acceptance criteria

- [ ] Post-AudioGraph overview, suggestions differ from generic tool `related` strings today
- [ ] After show projects, at least one suggestion names a real project title
- [ ] `Related` component renders suggestions without UI changes
- [ ] Unit tests per intent row in template table
- [ ] No static `aboutRelated`-style arrays left in shipped tool paths after Stage 6 cleanup

---

## Out of scope

- Personalized suggestions from full chat history analytics
- Suggestion ranking ML
- Changing initial empty-state pills (DS13)

---

## Implementation prompt (for agents)

1. Implement after [05 — Response Handler](./05-response-handler.md) M1 works.
2. Prefer rule-based templates; avoid extra LLM latency/cost in Stage 1.
3. Test that clicking a generated suggestion produces a sensible routed intent on the next turn.
