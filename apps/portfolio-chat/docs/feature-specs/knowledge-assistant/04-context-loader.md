# Knowledge Assistant — Context Loader

**Status:** Not started  
**Stage:** 3  
**Depends on:** [00 — Implementation Stages](./00-implementation-stages.md) · [02 — Knowledge Sources](./02-knowledge-sources.md) · [03 — Intent Router](./03-intent-router.md)  
**Feeds:** [05 — Response Handler](./05-response-handler.md) · [06 — Dynamic Suggestions](./06-dynamic-suggestions.md)

---

## Goal

Read markdown knowledge files from disk **server-only**, apply **section slices** per intent, enforce the **3-file cap**, and return structured context for the response handler and suggestion generator.

The loader is a **pure I/O + parsing** module. It does not call the LLM or choose intents.

---

## User story

As the chat API, when I receive a routing result with knowledge paths, I want deterministic file content loaded and sliced so the model only sees relevant portfolio facts for this turn.

---

## Requirements

### Input / output

- [ ] **CL1** — Accept `RoutingResult` from intent router ([03 §8.1](./03-intent-router.md#81-routing-result-contract-passed-to-chat-api)): `knowledgePaths`, `sectionSlices`, `intent`, `entities`
- [ ] **CL2** — Return `LoadedKnowledgeContext`:

```ts
type LoadedKnowledgeFile = {
  path: string;           // relative to knowledge/ e.g. "projects/audiograph.md"
  title: string;          // from frontmatter or first H1
  sections: { name: string; content: string }[];
  rawContent: string;     // full file after frontmatter strip (for suggestions)
};

type LoadedKnowledgeContext = {
  files: LoadedKnowledgeFile[];
  truncated: boolean;     // true if files/sections were trimmed for budget
  missingPaths: string[]; // paths that failed to read
};
```

- [ ] **CL3** — Root path: `apps/portfolio-chat/knowledge/` (resolve via `path.join(process.cwd(), 'knowledge', ...)` or equivalent server-safe path)

### File reading

- [ ] **CL4** — Read `.md` files with Node `fs/promises` — **never** import markdown as static assets to the client bundle
- [ ] **CL5** — Parse optional YAML frontmatter (`---` delimited); body is markdown for model context
- [ ] **CL6** — Split body into sections by `## ` headings (H2). Include H1 as document title only, not a slice target
- [ ] **CL7** — When `sectionSlices[path]` is provided, return **only** matching H2 sections (case-insensitive match on heading text after `## `)
- [ ] **CL8** — When no slices specified, return all H2 sections (or full body if no H2s found)

### Budget & errors

- [ ] **CL9** — Hard cap: **max 3 files** per request ([02 §5.3](./02-knowledge-sources.md#53-token-budget-rules)); if router exceeds, loader takes first 3 and sets `truncated: true`
- [ ] **CL10** — For multi-project intents (`ai_experience`): if >3 project files, load Overview sections only from each until cap met
- [ ] **CL11** — Missing file: add to `missingPaths`, continue loading others; do not throw (response handler decides fallback copy)
- [ ] **CL12** — Empty `knowledgePaths` → return `{ files: [], truncated: false, missingPaths: [] }`

### Special cases

- [ ] **CL13** — `design_system_experience`: when slices name employer sections (IBM, Havas, Imagination), extract those H2 blocks from `candidate/experience.md`
- [ ] **CL14** — `show_projects` with empty paths: no-op (display intent uses `data/*` only)
- [ ] **CL15** — Optional `manifest.yaml` read is **out of scope** until deferred decision in [00 § Phase 0](./00-implementation-stages.md#resolved-decisions) is reversed

---

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `features/ai-chat/utils/load-knowledge-context.ts` | Intent detection |
| Section parsing, frontmatter strip | LLM calls |
| Unit tests with fixture markdown | Client-side fetch of knowledge |
| Shared types in `features/ai-chat/types/` | `@repo/ai` changes |

---

## API

No new HTTP endpoint. Called from `post-chat.ts` after `routeIntent()`.

```ts
loadKnowledgeContext(routingResult: RoutingResult): Promise<LoadedKnowledgeContext>
```

Helper for response handler:

```ts
formatKnowledgeForPrompt(context: LoadedKnowledgeContext): string
// Concatenates sections with clear file/section headers for system prompt injection
```

---

## Proposed file structure

```
features/ai-chat/
  utils/
    load-knowledge-context.ts
    parse-markdown-sections.ts    # optional extract if file grows
  types/
    routing-result.ts             # shared with router
    loaded-knowledge-context.ts
  __tests__/
    load-knowledge-context.test.ts
    fixtures/knowledge/           # minimal md samples for tests
```

---

## Section slice reference

From [02 §4](./02-knowledge-sources.md#section-depth-by-intent-loading-subsets) — loader implements these when router provides slices:

| Intent | Typical sections |
|--------|------------------|
| `project_overview` | Overview, Problem, Solution, Links |
| `project_architecture` | Overview, Architecture, Tech Stack |
| `project_challenges` | Overview, Challenges, Lessons Learned |
| `ai_experience` | Overview (per project file) |
| `design_system_experience` | IBM, Havas, Imagination (from experience.md) |

---

## Acceptance criteria

- [ ] Unit tests: single file full load, section slice, missing file, 3-file cap, frontmatter parse
- [ ] Fixture test: `projects/audiograph.md` with Architecture slice returns only Architecture (+ Overview if router includes it)
- [ ] No knowledge files bundled to client (verify no `import` of `knowledge/**` from client components)
- [ ] `pnpm typecheck` passes
- [ ] Downstream [05 — Response Handler](./05-response-handler.md) can call loader without redefining types

---

## Out of scope

- Caching layer (future)
- Markdown AST libraries unless parsing bugs require one — prefer simple `## ` split for Stage 1
- Reading `docs/` or `data/` as knowledge sources

---

## Implementation prompt (for agents)

1. Read [02 — Knowledge Sources](./02-knowledge-sources.md) loading rules and [03 §6](./03-intent-router.md#6-context-mapping) path tables.
2. Implement loader + tests **before** wiring [05 — Response Handler](./05-response-handler.md).
3. Use real files under `knowledge/` once Stage 1 content exists; use fixtures until then.
4. Do not add embeddings, chunking, or vector search.
