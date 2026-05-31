# How the About intro works dynamically

**Audience:** You explaining the portfolio chat to a visitor, interviewer, or future you.  
**Not a spec** — requirements live in [08-concise-about-intro.md](../feature-specs/knowledge-assistant/08-concise-about-intro.md).

---

## If someone asks: “Hey Eric, how does the About section work dynamically?”

> When you ask about me — “Tell me about yourself,” “Introduce yourself,” “Who is Eric?” — the chat doesn’t dump my whole résumé. It picks a **short intro** based on **how you phrased the question**, streams it word-by-word like a normal reply, and then offers follow-up pills for projects, stack, or experience if you want to go deeper.
>
> The intro copy itself is **written in code**, not improvised by the model each time. That keeps it concise and consistent. The model’s job on that path is basically to say something brief like “Sure, here’s a bit about me” and trigger the about tool — then the server swaps in the right pre-authored paragraph and streams it. Same clickable UI you already had; we didn’t rebuild the About card layout.

---

## The one-liner

About is **rule-selected intro copy** (phrase → variant) **streamed as text**, with career detail deferred to experience, projects, and dynamic follow-up pills — not a four-paragraph résumé on first ask.

---

## What triggers “About”

| How the visitor asks | Routed intent | Intro variant |
|----------------------|---------------|---------------|
| “Tell me about yourself”, “About me” (sidebar) | `candidate_overview` | **default** — 👋 + who I am now + invite to explore |
| “Introduce yourself” | `candidate_overview` | **hello** — slightly more casual opener |
| “Who is Eric?”, “About you” | `candidate_overview` | **identity** — quick identity + what I build now |
| “Your background”, “Overview of your experience” | `candidate_overview` | **background** — wider lens, still short; timeline via experience tool |

Phrase matching lives in `features/ai-chat/utils/select-about-intro.ts`. Sidebar **About** sends “Tell me about yourself” so it hits the same path as the empty-state pill.

---

## What happens on each About-style message

```txt
User: “Tell me about yourself” (or similar)
        ↓
Intent router → candidate_overview
        ↓
shouldUseAboutStream → true (all candidate_overview phrases)
        ↓
Legacy system prompt → model writes 1–2 sentences, calls show_about
        ↓
About stream mode → suppress About card UI; don’t show duplicate tool output
        ↓
selectAboutIntro(user message) → pick variant from data/about.ts
        ↓
streamCopy(intro text) → visitor sees word-by-word intro
        ↓
generateSuggestions() → pills like “Show me your projects”, etc.
```

The visitor sees **one streamed message** (plus pills). They do **not** see an “About” heading card for this path — that’s intentional and covered by e2e.

---

## Where the words live (not a long prompt)

| What | Where |
|------|--------|
| Intro paragraphs (4 variants) | `data/about.ts` — `aboutIntroVariants` |
| Facts (name, title, company) | `data/resume.ts` — about copy pulls from there |
| Which variant | `select-about-intro.ts` |
| Stream injection | `run-chat-stream.ts` when `show_about` fires |
| “Call show_about” behavior | `lib/ai/prompts/portfolio-assistant.ts` — `getLegacyPortfolioAssistantSystemPrompt()` |
| Grounded Q&A backup | `knowledge/candidate/candidate-profile.md` + brevity rules in `build-grounded-prompt.ts` |

If you want to change **what I say**, edit `data/about.ts`. If you want to change **when the model calls the tool**, edit the legacy prompt in `portfolio-assistant.ts`.

---

## What “dynamic” means here

We’re **not** asking the LLM to rewrite my bio every turn. Dynamic means:

1. **Variant by phrasing** — “introduce yourself” sounds a bit different from “who is eric,” same facts, different opener.
2. **Streaming UX** — Feels like I’m typing the intro, not popping a static card.
3. **Depth on demand** — Short intro first; experience timeline and project stories come from other tools and knowledge files when you click pills or ask follow-ups.

That’s Stage 1: predictable, testable, no extra latency. LLM-generated intros could come later if we want more variety.

---

## What we moved away from

Previously `data/about.ts` stitched together my summary plus VoteMate, Imagination, IBM, and Havas in one reply — fine for a PDF, heavy for chat. Now the first reply is ~80–120 words. The old career wall lives in **experience** (`show_experience`, `knowledge/candidate/experience.md`) when you ask for it.

---

## What to say in an interview

> “When someone asks about me, we route to a candidate-overview intent, select one of a few short intro templates based on their exact wording, and stream that copy server-side after a minimal model step. The model doesn’t narrate my whole career on the first message — we push depth to structured follow-ups and other tools. Copy is in TypeScript tied to resume facts; markdown profile is trimmed for grounded answers if we ever skip the stream path. Same chat UI, same suggestion pills after the turn.”

---

## Code map

| Piece | Location |
|-------|----------|
| Intro copy + variants | `data/about.ts` |
| Variant selection | `features/ai-chat/utils/select-about-intro.ts` |
| Enable stream for overview | `features/ai-chat/utils/should-use-about-stream-legacy.ts` |
| Stream + suppress card | `features/ai-chat/lib/about-stream-mode.ts`, `run-chat-stream.ts` |
| Intent phrases | `features/ai-chat/utils/intent-router.ts` (`CANDIDATE_OVERVIEW_PHRASES`, `about me` alias) |
| Legacy prompt | `lib/ai/prompts/portfolio-assistant.ts` |
| Tool shape / social links | `lib/ai/tools/about.ts` |
| About card UI (other paths) | `components/about.tsx` |
| Follow-up pills | `generate-suggestions.ts` + `suggestion-templates.ts` |
| Tests | `__tests__/features/ai-chat/select-about-intro.test.ts`, `e2e/about-streaming.spec.ts` |

---

## Related reading

- [how-dynamic-suggestions-work.md](./how-dynamic-suggestions-work.md) — what happens **after** the intro (follow-up pills).
- [07-portfolio-data.md](../feature-specs/07-portfolio-data.md) — editing resume vs intro vs knowledge files.
