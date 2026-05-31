# Knowledge Assistant — Integration & Cleanup

**Status:** Not started  
**Stage:** 6 (final)  
**Depends on:** [05 — Response Handler](./05-response-handler.md) · [06 — Dynamic Suggestions](./06-dynamic-suggestions.md)  
**Overview:** [01 — Knowledge Assistant](./01-knowledge-assistant.md)

---

## Goal

Remove legacy prompt-only routing and static suggestion paths, add **tests and guardrails**, and mark Stage 1 **complete** per success criteria in [01](./01-knowledge-assistant.md) and [00 — Implementation Stages](./00-implementation-stages.md).

---

## User story

As a maintainer, I want one clear pipeline (route → load → respond → suggest) with no duplicate static strings so future portfolio updates only touch `knowledge/` and `data/*`.

---

## Requirements

### Remove dead code

- [ ] **IC1** — Remove tool-routing instructions from `lib/ai/prompts/portfolio-assistant.ts`; keep role + off-topic guard + pointer that server supplies knowledge context
- [ ] **IC2** — Remove static `related` arrays from `lib/ai/tools/about.ts`, `show-projects.ts`, `show-experience.ts`, `show-tech-stack.ts` (or re-export from generator for typing only)
- [ ] **IC3** — Remove `projectsFollowUp`, `techStackFollowUp` constants from `post-chat.ts`
- [ ] **IC4** — Remove any feature flag used for M1–M4 rollout once all milestones ship
- [ ] **IC5** — Audit `features/ai-chat/tools/` vs `lib/ai/tools/` shims — single source, no duplicate static strings

### Tests

- [ ] **IC6** — Unit tests: intent router ([03 §4 examples](./03-intent-router.md#4-example-user-messages)), context loader, suggestion generator
- [ ] **IC7** — Integration test or manual script: full pipeline for “Tell me about AudioGraph” → grounded text + dynamic suggestions
- [ ] **IC8** — Existing e2e must pass: `e2e/about-streaming.spec.ts` (about pill → streamed copy)
- [ ] **IC9** — Add e2e or integration case: “Show me your projects” → project grid visible
- [ ] **IC10** — Optional e2e: project-specific question returns text mentioning project name (not generic fluff)

### Guardrails

- [ ] **IC11** — CI or test script: every published project in `data/projects.ts` has `knowledge/projects/{id}.md` ([02 acceptance](./02-knowledge-sources.md#acceptance-criteria))
- [ ] **IC12** — Document in `knowledge/README.md`: when adding a project, update `data/projects.ts` + knowledge file + router title lookup (automatic via data)
- [ ] **IC13** — Server log line per request retained: `{ intent, projectSlug, responseType }`

### Documentation

- [ ] **IC14** — Update [06-ai-chat.md](../06-ai-chat.md): document knowledge pipeline, mark R10–R11 follow-up injection as superseded
- [ ] **IC15** — Update [feature-specs/00-index.md](../00-index.md): Knowledge Assistant → **Shipped** (or In progress → Shipped per stage)
- [ ] **IC16** — Update [progress-tracker.md](../../context/progress-tracker.md): Completed lines for each shipped stage

---

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| Cleanup in `features/ai-chat/`, `lib/ai/` | Chat UI refactor |
| Tests under `apps/portfolio-chat` | Vector DB / RAG |
| Docs sync | `packages/*` changes |

---

## Acceptance criteria (Stage 1 complete)

All items from [01 — Knowledge Assistant](./01-knowledge-assistant.md#success-criteria):

- [ ] Static follow-up questions replaced with dynamic suggestions
- [ ] Project questions use project-specific context
- [ ] Candidate questions use candidate profile context
- [ ] Display questions return structured UI without unnecessary AI generation
- [ ] Assistant does not invent details outside portfolio knowledge
- [ ] Existing chat UI continues to work

Plus:

- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:run` passes (new + existing unit tests)
- [ ] `pnpm build` passes from `apps/portfolio-chat`

---

## Out of scope

- Stage 2 features: GitHub scanner, embeddings, manifest.yaml, about-stream migration to markdown
- Rate limiting (P8)
- Deep links (P7b)

---

## Implementation prompt (for agents)

1. Only start Stage 6 after M1–M5 behave correctly in manual QA.
2. Delete static strings only when dynamic path is verified — avoid regression window.
3. Run full test suite before marking Shipped in index + tracker.
