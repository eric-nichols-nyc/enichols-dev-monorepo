# Knowledge Assistant — Concise About Intro

**Status:** Shipped  
**Depends on:** [05 — Response Handler](./05-response-handler.md) · [03 — Intent Router](./03-intent-router.md) · [02 — Knowledge Sources](./02-knowledge-sources.md) · [07-portfolio-data.md](../07-portfolio-data.md)  
**Related:** [06 — Dynamic Suggestions](./06-dynamic-suggestions.md) · [06-ai-chat.md](../06-ai-chat.md)

**Human explainer (how to describe this in conversation):** [how-about-intro-works-dynamically.md](../../reference/how-about-intro-works-dynamically.md)

---

## Goal

Replace the **verbose, résumé-style** about experience with a **short, first-person introduction**—as if Eric is meeting the visitor in chat—and make that intro **feel dynamic** based on how they asked, while keeping career depth available through follow-ups (experience tool, grounded Q&A, suggestions).

---

## User story

As a visitor, when I ask “Tell me about yourself” or “Introduce yourself,” I want a brief, warm intro (who Eric is, what he does now, where to go next)—not a multi-paragraph career history. I want follow-up pills that invite me to explore projects, stack, or experience if I want more.

---

## Current behavior (how it works today)

### 1. Content sources (two parallel narratives)

| Source | Path | What it contains |
|--------|------|------------------|
| **About paragraphs (UI + stream)** | `data/about.ts` | Built from `data/resume.ts`: greeting + full `resume.summary`, then a **long VoteMate paragraph**, then a **single concatenated paragraph** for Imagination + IBM + Havas, then a closing CTA with emojis. Typically **3–4 dense paragraphs**. |
| **Knowledge profile (grounded AI)** | `knowledge/candidate/candidate-profile.md` | Third-person-ish sections: Summary, Core Strengths, Working Style, Current Focus, Contact. Used when `candidate_overview` runs **`context_aware_ai`** (not the legacy stream). Also verbose (~30 lines). |

`data/about.ts` is the **authoritative copy** for the `show_about` tool and word-stream path. `candidate-profile.md` is loaded by the intent router for the same intent family but can produce **different tone and length** when the model answers freely.

### 2. Intent routing (`candidate_overview`)

**File:** `features/ai-chat/utils/intent-router.ts`

Phrases such as `tell me about yourself`, `introduce yourself`, `who is eric`, `about you`, `your background` map to intent **`candidate_overview`**.

- **Knowledge path:** `candidate/candidate-profile.md`
- **Response type:** `context_aware_ai` (default branch in `getResponseType`)
- **Tool:** none forced (`getToolForIntent` returns `undefined` for this intent)

### 3. Two delivery paths for the same intent

| User phrasing | Path | What the visitor sees |
|---------------|------|------------------------|
| Exact **`tell me about yourself`** (normalized) | **Legacy about stream** | Model uses **legacy** system prompt → calls `show_about` → server **suppresses** About card → word-streams **`aboutCopy`** = `about.paragraphs.join("\n\n")` (full verbose text). **No** “About” heading (e2e asserts this). |
| Other `candidate_overview` phrases (e.g. `introduce yourself`, `who is eric`) | **Grounded AI** | `buildGroundedSystemPrompt(knowledgeContext)` + model prose; **no** `show_about` tool; length/structure **model-dependent** (often still long). |

**Legacy gate:** `features/ai-chat/utils/should-use-about-stream-legacy.ts` — only `tell me about yourself` triggers legacy mode when `KNOWLEDGE_ASSISTANT_ENABLED` is on.

**Stream wiring:** `features/ai-chat/api/run-chat-stream.ts`

- `getAboutStreamModeDecision({ aboutRenderMode: "text", ... })` on `show_about` chunks
- Injects `aboutCopy` via `streamCopy`; optional `data-related` with static `aboutRelated` when dynamic suggestions are off
- With dynamic suggestions on: static `aboutRelated` skipped; end-of-turn `generateSuggestions()` for `candidate_overview`

### 4. Tool + UI (when card is not suppressed)

**Tool:** `lib/ai/tools/about.ts`

- `execute()` returns `{ title, paragraphs, socialLinks, related }`
- `aboutCopy` = joined paragraphs (stream body)
- `aboutRelated` = static follow-ups: projects, experience, tech stack

**UI:** `components/about.tsx` — renders `title` + **all** `paragraphs` + social icon links.

**Message renderer:** `features/chat-ui/components/message.tsx` — `tool-show_about` → `<About />` + optional `Related` from tool output.

### 5. Entry points that hit this content

| Entry | File | Behavior |
|-------|------|----------|
| Empty-state pill | `features/chat-ui/components/suggestions.tsx` | `"Tell me about yourself"` → legacy stream path |
| Sidebar preset | `components/constants.ts` | `{ message: "About Me" }` — routing depends on normalization (may **not** match legacy phrase exactly) |
| Mock dev stream | `features/ai-chat/api/post-chat.ts` | `CHAT_MOCK_STREAM=true` streams full `about.paragraphs` after 3s |
| E2E | `e2e/about-streaming.spec.ts` | Asserts streamed text matches `/I'm Eric Nichols/i` and **zero** `"About"` headings |

### 6. Dynamic suggestions (post-intro)

**File:** `features/ai-chat/utils/suggestion-templates.ts` — `candidateOverviewSuggestions`:

- “Show me your projects”
- “What's your tech stack?”
- “Show my work experience”

These already point visitors toward depth **after** the intro; the problem is the **intro body** is too long before pills appear.

### 7. Why it feels verbose today

- `data/about.ts` **inlines a career timeline** (current role + three prior employers) in the first reply.
- Legacy stream always dumps **entire** `about.paragraphs`, not a short variant.
- Grounded path uses a **long** `candidate-profile.md`, so the model often mirrors résumé density.
- Two paths + two sources → inconsistent length and voice between “Tell me about yourself” vs “Introduce yourself.”

---

## Desired behavior

### Voice & length

- **First-person**, conversational, **one beat**—introducing yourself to someone who just landed on your portfolio chat.
- **Target:** ~80–150 words for the primary intro (roughly **2–4 short sentences**, optionally one bullet-free line break—not 3–4 résumé paragraphs).
- **Include:** name, role, location (optional), **current focus** (VoteMate / AI civic product), **1–2 signature strengths** (e.g. React, AI UX, design systems)—not every past employer.
- **Exclude from intro:** IBM/Havas/Imagination paragraph chains, metric-heavy bullets, full skills lists, repeated summary from `resume.summary` verbatim.
- **End with an invitation:** e.g. ask about projects, stack, experience, or a specific project—aligned with dynamic suggestions.

### Dynamic (within Stage 1 — rule-based, no extra LLM)

“Dynamic” means the intro **varies by detected sub-intent** or phrase cluster, not a second model call:

| Visitor signal (examples) | Intro emphasis |
|---------------------------|----------------|
| `tell me about yourself` / `about me` | Default short intro + explore CTA |
| `introduce yourself` | Slightly more “hello” tone; same facts, shorter hook |
| `who is eric` / `about you` | Third-person question → still answer as Eric in first person; 1-line identity + what you build now |
| `your background` / `overview of your experience` | Slightly wider lens (years + domains) but **still** cap length; defer timeline to “Show my work experience” |

Implementation should use **templates** (or sliced knowledge sections), not free-form model dumps, for the **`tell me about yourself`** stream path so e2e stays stable.

### Single coherent pipeline (target)

- **Unify** `candidate_overview` so every phrase cluster gets a **predictable, concise** intro—not only the legacy phrase.
- Prefer **one content source** for intro facts: either slim `data/about.ts` **or** trimmed `candidate-profile.md` sections—document which is canonical in [07-portfolio-data.md](../07-portfolio-data.md) after ship.
- **Career depth** remains on `show_experience`, project markdown, and grounded follow-up turns—not in the first screen of text.

---

## Requirements

### Content

- [ ] **AB1** — Replace `data/about.ts` `paragraphs` with a **short intro** (see Desired behavior). Keep `title` and derivation from `resume` for facts (name, title, location, current company)—no duplicate employers in intro.
- [ ] **AB2** — Trim `knowledge/candidate/candidate-profile.md` so **Summary** + **Current Focus** support grounded answers without encouraging résumé-length replies; move timeline detail to `knowledge/candidate/experience.md` consumption only.
- [ ] **AB3** — Add `data/about.ts` (or colocated util) **intro variants** keyed by sub-intent / phrase cluster (see table above)—max 3 variants, shared facts, different opener/closer.
- [ ] **AB4** — `lib/ai/tools/about.ts`: tool returns **concise** `paragraphs` (and `aboutCopy` reflects chosen variant when stream runs).

### Routing & response handler

- [ ] **AB5** — Extend `should-use-about-stream-legacy.ts` (rename optional) to cover **all** `candidate_overview` phrase clusters that should use **deterministic streamed intro**, not only `tell me about yourself`—OR replace legacy gate with `responseType: static_display` + forced short intro stream (document choice in tracker).
- [ ] **AB6** — `run-chat-stream.ts`: stream **selected variant** via `streamCopy`, not always full joined résumé paragraphs; keep About card suppressed for stream path if UX unchanged.
- [ ] **AB7** — For `candidate_overview` turns that remain `context_aware_ai`: add system-prompt instruction: **“Reply in ≤4 sentences for overview intents; offer to go deeper via projects/experience.”**
- [ ] **AB8** — Align sidebar `"About Me"` preset with a phrase that hits the **concise stream** path (update `components/constants.ts` or alias map in intent router).

### UI

- [ ] **AB9** — `components/about.tsx`: no layout change required; verify readable spacing for **1–2** short paragraphs + social links.
- [ ] **AB10** — If tool card is shown (non-suppressed path), card content matches streamed variant (same `paragraphs` array).

### Suggestions & tests

- [ ] **AB11** — Keep `candidateOverviewSuggestions` strategy; optionally add one intro-specific pill (e.g. “What are you working on now?”) if grounded in knowledge—max 3 pills total.
- [ ] **AB12** — Update `e2e/about-streaming.spec.ts` regex/assertions for new opener copy (still first-person, still no duplicate “About” card).
- [ ] **AB13** — Unit tests: intro variant selection from normalized message; max length guard (word count or char count) on each variant.
- [ ] **AB14** — `CHAT_MOCK_STREAM` path streams concise copy, not full legacy paragraphs.

### Docs

- [ ] **AB15** — Update [07-portfolio-data.md](../07-portfolio-data.md) editorial workflow: intro vs deep narrative vs `knowledge/candidate/*`.
- [ ] **AB16** — Note in [current-state.md](./current-state.md) § about when shipped.

---

## System boundaries

| In scope | Out of scope |
|----------|----------------|
| `data/about.ts`, `knowledge/candidate/candidate-profile.md` | Rebuilding About UI component |
| `lib/ai/tools/about.ts`, `run-chat-stream.ts`, `should-use-about-stream-legacy.ts` | LLM-generated intro per turn (optional later) |
| `intent-router.ts` phrase → variant mapping | Rewriting full `experience.md` or project corpus |
| `portfolio-assistant.ts` grounded brevity line | Removing `show_about` tool entirely |
| E2E + unit tests listed above | Changing dynamic suggestion algorithm beyond AB11 |

---

## Proposed file structure

```
data/
  about.ts                    # short intro + variant helpers (or about-intro.ts)
knowledge/candidate/
  candidate-profile.md        # trimmed for overview grounding
features/ai-chat/
  utils/
    select-about-intro.ts     # phrase cluster → variant id + paragraphs
  api/
    run-chat-stream.ts        # use selected copy for streamCopy
lib/ai/tools/
  about.ts                    # execute uses selected variant when routing provided
__tests__/
  features/ai-chat/select-about-intro.test.ts
e2e/
  about-streaming.spec.ts     # updated copy assertions
```

Optional: pass `routing.originalMessage` or `routing.intent` + normalized text into `selectAboutIntro()` from `post-chat` / `run-chat-stream` so the tool and stream share one selector.

---

## Acceptance criteria

- [ ] “Tell me about yourself” streams ≤~150 words, first-person, no per-employer history paragraphs.
- [ ] “Introduce yourself” and “Who is Eric?” receive **concise** responses (stream or grounded) without duplicating the old 4-paragraph `about.ts` wall of text.
- [ ] No duplicate About card + streamed wall (existing e2e behavior preserved).
- [ ] `show_about` tool `paragraphs` length matches streamed intro when tool path runs.
- [ ] Dynamic suggestions still show after intro (projects / stack / experience).
- [ ] `pnpm test:run` and `e2e/about-streaming.spec.ts` pass.
- [ ] [00-index.md](../00-index.md) Status → **Shipped**; progress tracker updated.

---

## Out of scope

- Personalized intro from full chat history
- Replacing `show_experience` or project tools
- New About UI layout (cards, video, avatar hero)
- Removing legacy about-stream mechanism without a tested replacement
- Editing `packages/*` or `@repo/ai`

---

## Implementation prompt (for agents)

1. Read this spec + [current-state.md](./current-state.md) + [05-response-handler.md](./05-response-handler.md) § `candidate_overview`.
2. Shorten content first (`data/about.ts` + `candidate-profile.md`), then wire `selectAboutIntro()` into stream + tool.
3. Expand legacy phrase gate (AB5) or document why only one phrase keeps deterministic stream.
4. Run e2e about streaming before marking shipped.
5. Do not grow intro to include full résumé—push depth to experience tool and suggestions.
