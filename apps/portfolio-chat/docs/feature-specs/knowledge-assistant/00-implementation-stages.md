# Knowledge Assistant — Implementation Stages

**Status:** Complete (Phase 0 docs) — Stage 1 next  
**Overview:** [01 — Knowledge Assistant](./01-knowledge-assistant.md) · **Baseline:** [current-state.md](./current-state.md)

---

## Goal

Define the **order, dependencies, milestones, and resolved decisions** for Stage 1 of the Dynamic Portfolio Assistant. Each stage has its own spec; this document is the master plan agents and humans follow when implementing.

---

## Pipeline (target architecture)

```txt
User message or clicked suggestion
        ↓
Intent router          → 03-intent-router.md
        ↓
Context loader         → 04-context-loader.md
        ↓
Response handler       → 05-response-handler.md
        ↓
Dynamic suggestions    → 06-dynamic-suggestions.md
        ↓
Return UIMessage stream (existing chat UI — no rebuild)
```

**Knowledge content** ([02 — Knowledge Sources](./02-knowledge-sources.md)) is authored first and consumed by the loader. **Cleanup** ([07 — Integration & Cleanup](./07-integration-cleanup.md)) runs last.

---

## Stage map

| Stage | Spec | Delivers | Depends on | Est. effort |
|-------|------|----------|------------|-------------|
| **0** | This doc (§ Phase 0) | Resolved decisions, spec registry, tracker setup | — | 0.5 day |
| **1** | [02 — Knowledge Sources](./02-knowledge-sources.md) | `knowledge/` markdown corpus | Stage 0 | 1–2 days |
| **2** | [04 — Context Loader](./04-context-loader.md) | Server-side file read + section slices | Stage 1 | 1 day |
| **3** | [03 — Intent Router](./03-intent-router.md) | Pure `routeIntent()` + unit tests | Stages 1–2 | 1–2 days |
| **4** | [05 — Response Handler](./05-response-handler.md) | `post-chat.ts` integration | Stages 2–3 | 2–3 days |
| **5** | [06 — Dynamic Suggestions](./06-dynamic-suggestions.md) | Replace static `related` arrays | Stage 4 | 1–2 days |
| **6** | [07 — Integration & Cleanup](./07-integration-cleanup.md) | Remove dead paths, e2e, CI guard | Stages 4–5 | 1 day |

**Build order rationale:** Content first (Stage 1). Loader next (Stage 2)—testable with fixture paths and mock routing inputs. Router (Stage 3)—outputs paths the loader consumes. API wiring (Stage 4+) is highest risk and comes last.

**Runtime order** (each request): router → loader → response handler → suggestions. Stage numbers are *build* order, not request order.

**Note:** Spec *filenames* (`03-intent-router`, `04-context-loader`) are doc IDs, not stage numbers.

---

## Phase 0 — Decisions & setup

**Status:** Active on `feature/knowledge-assistant-phase0`

### Resolved decisions

These close open questions in [02](./02-knowledge-sources.md#open-questions) and [03](./03-intent-router.md#open-questions):

| Question | Decision | Rationale |
|----------|----------|-----------|
| `show_about` source | **Keep `data/about.ts` + about-stream for Stage 1.** Use `candidate-profile.md` for grounded Q&A only (`candidate_overview`, `general_question`). | About-stream UX is shipped and e2e-tested; migrating copy is a separate pass. |
| `manifest.yaml` required? | **Defer.** Hardcode AI project ids from `data/projects.ts` categories in router/loader until corpus grows. | Only 4 projects today; YAML adds maintenance without clear win yet. |
| `audiograph` in `ai_experience`? | **Exclude** unless user message names AudioGraph or frontmatter tags include `ai`. | Its `categories` is `health`; don't overload AI intent. |
| “What's your experience?” | **`show_experience`** if message contains `show` or `timeline`; else **`candidate_overview`**. | Matches display vs narrative intent. |
| `show_tech_stack` Hybrid vs Static | **Static Display** for exact pill phrases; **Hybrid** when message asks how/why about technologies. | Pills should stay fast; explanatory questions get prose. |
| Router on every message? | **Yes** — route each user turn independently. | Avoid stale intent on “tell me more”; re-route with full message text. |
| Export `routingResult` to client? | **Server-only Stage 1.** Log `{ intent, projectSlug, responseType }` per request. | No UI contract change; analytics later. |

### Phase 0 deliverables

- [x] **P0-1** — This implementation-stages doc
- [x] **P0-2** — Specs [04](./04-context-loader.md), [05](./05-response-handler.md), [06](./06-dynamic-suggestions.md), [07](./07-integration-cleanup.md)
- [x] **P0-3** — Row in [feature-specs/00-index.md](../00-index.md)
- [x] **P0-4** — Update [progress-tracker.md](../../context/progress-tracker.md): Current Goal = Stage 1 (Knowledge Sources)

### Out of scope (Phase 0)

- Implementation code
- Knowledge file authoring (Stage 1)

---

## Vertical milestones (ship incrementally)

Ship thin slices through the pipeline before completing all intents:

| Milestone | Intents covered | Proves |
|-----------|-----------------|--------|
| **M1** | `project_overview`, `project_architecture`, `project_challenges` | Knowledge + router + loader + grounded text |
| **M2** | `show_projects`, `show_tech_stack`, `show_experience` | Display routing; existing tools still work |
| **M3** | `candidate_overview`, `general_question` | Candidate knowledge + default context |
| **M4** | `ai_experience`, `design_system_experience` | Multi-file load + filtering |
| **M5** | Dynamic suggestions for all above | End-to-end success criteria from [01](./01-knowledge-assistant.md) |

**Recommended first ship:** M1 (“Tell me about AudioGraph”) — biggest gap in [current-state.md](./current-state.md).

---

## Proposed code layout (all stages)

```
apps/portfolio-chat/
├── knowledge/                          # Stage 1 — content only
│   ├── README.md
│   ├── candidate/
│   └── projects/
├── features/ai-chat/
│   ├── api/post-chat.ts                # Stage 4 — orchestration
│   ├── utils/
│   │   ├── load-knowledge-context.ts   # Stage 2
│   │   ├── intent-router.ts            # Stage 3
│   │   ├── build-grounded-prompt.ts    # Stage 4
│   │   └── generate-suggestions.ts     # Stage 5
│   ├── lib/                            # existing: about-stream, stream-copy
│   └── types/
│       └── routing-result.ts           # Stage 3 — shared contract
└── lib/ai/
    ├── prompts/portfolio-assistant.ts  # Stage 6 — slim down tool routing
    └── tools/                          # Stage 5–6 — remove static related
```

No new `features/knowledge-assistant/` folder in Stage 1 — logic stays in `features/ai-chat/` per existing API ownership ([06-ai-chat.md](../06-ai-chat.md)).

---

## Success criteria (Stage 1 complete)

From [01 — Knowledge Assistant](./01-knowledge-assistant.md):

- [ ] Static follow-up questions replaced with dynamic suggestions (Stage 5)
- [ ] Project questions use project-specific context (M1)
- [ ] Candidate questions use candidate profile context (M3)
- [ ] Display questions return structured UI without unnecessary generation (M2)
- [ ] Assistant does not invent facts outside loaded knowledge (Stages 3–4)
- [ ] Existing chat UI continues to work (no part-type breaking changes)

---

## Global out of scope (all stages)

- Vector search, embeddings, RAG, GitHub scanning
- Database-backed knowledge
- Resume PDF parsing
- Rebuilding chat UI (`features/chat-ui/`)
- Editing `packages/ai` or `packages/design-system`
- Client-side exposure of full `knowledge/` corpus

---

## Spec registry (this feature)

| Doc | Stage | Status |
|-----|-------|--------|
| [current-state.md](./current-state.md) | Baseline audit | Shipped (docs) |
| [01-knowledge-assistant.md](./01-knowledge-assistant.md) | Overview | Shipped (docs) |
| [02-knowledge-sources.md](./02-knowledge-sources.md) | 1 | Shipped |
| [04-context-loader.md](./04-context-loader.md) | 2 | Shipped |
| [03-intent-router.md](./03-intent-router.md) | 3 | Shipped |
| [05-response-handler.md](./05-response-handler.md) | 4 | Shipped |
| [06-dynamic-suggestions.md](./06-dynamic-suggestions.md) | 5 | Not started |
| [07-integration-cleanup.md](./07-integration-cleanup.md) | 6 | Not started |

---

## Implementation prompt (agents)

1. Read this doc + [current-state.md](./current-state.md) + the spec for the active stage only.
2. Do not skip stages (e.g. do not wire `post-chat.ts` before router + loader tests pass).
3. Ship one milestone (M1–M5) before expanding intent coverage.
4. Update [progress-tracker.md](../../context/progress-tracker.md) and spec **Status** when a stage ships.
5. Run `pnpm typecheck` from `apps/portfolio-chat` after type/route changes.
