# How dynamic suggestions work

**Audience:** You explaining the portfolio chat to a visitor, interviewer, or future you.  
**Not a spec** — requirements live in [06-dynamic-suggestions.md](../feature-specs/knowledge-assistant/06-dynamic-suggestions.md).

---

## The one-liner

Follow-up pills are **rule-generated from what the user asked and what knowledge was loaded** — not a second LLM call, and not the same three strings every time.

---

## Two kinds of suggestions

| When | What you see | How they're chosen |
|------|----------------|-------------------|
| **Empty chat** (no messages yet) | Four starter pills — “Show me some projects”, etc. | Static list in `features/chat-ui/components/suggestions.tsx`. Same for everyone; that's intentional for now. |
| **After each assistant turn** | “Related” pills under the reply | **Dynamic** — generated server-side at the end of the turn from intent + loaded markdown + portfolio data. |

Visitors mostly notice the second kind. That's the Knowledge Assistant suggestion pipeline.

---

## What happens on each message (runtime order)

```txt
User types or clicks a pill
        ↓
Intent router — “What did they mean?” (project overview? show projects? tech stack?)
        ↓
Context loader — Read up to 3 markdown files from knowledge/ (section slices per intent)
        ↓
Response handler — Stream grounded text and/or a display tool (projects grid, etc.)
        ↓
Dynamic suggestions — generateSuggestions() runs once the turn content is done
        ↓
Stream emits data-related { suggestions: string[] } → existing Related UI
```

The chat UI didn't change. We reuse the same `data-related` message part and the same clickable `Related` component.

---

## How suggestions are generated (Stage 5 — rule-based)

`generateSuggestions()` in `features/ai-chat/utils/generate-suggestions.ts` takes:

- **Routing result** — intent (`project_overview`, `show_projects`, …) and entities (e.g. project slug `audiograph`)
- **Loaded knowledge** — which markdown files and sections were read this turn
- **Optional context** — assistant text and which tool ran

It picks a **template by intent** (`suggestion-templates.ts`) and returns **2–3 short questions** (max 80 chars each), deduped.

Examples:

| User asked | Example follow-ups |
|------------|-------------------|
| “Tell me about AudioGraph” | “How does AudioGraph collect data?”, “What was the hardest part of AudioGraph?”, “Show me your other projects” |
| “Show me your projects” | “Tell me about Trellix”, “Tell me about GitHub Codebase Copilot”, “What's your tech stack?” |
| Unknown project name | “Show me your projects”, “Tell me about yourself”, “What's your tech stack?” |

**Project titles** always come from `data/projects.ts` (slug → display name).  
**Section-aware questions** only appear if that section exists in the project's knowledge file (e.g. no “Metrics for X” unless there's a Metrics section in markdown).

No second model call in Stage 5 — fast, predictable, testable. An optional LLM-based generator is spec'd for later if rule quality isn't enough.

---

## What we replaced

Before Knowledge Assistant Stage 5, every tool returned the same hard-coded `related: [...]` array (“Tell me about a specific project”, “What technologies do you use?”, …) regardless of the conversation. The server also injected generic follow-up prose after the projects grid.

Now, when `KNOWLEDGE_ASSISTANT_ENABLED` is on (default):

1. Static `related` on tool output is **stripped** before it reaches the client.
2. Generic follow-up prose is **not** streamed on the dynamic path.
3. **`generateSuggestions()`** runs at end of turn and writes one `data-related` part.

Legacy behavior remains if Knowledge Assistant is disabled (`KNOWLEDGE_ASSISTANT_ENABLED=false`) — useful for comparison and fallback.

---

## What to say in an interview

> “The portfolio chat routes each message through an intent router and loads relevant markdown from a knowledge folder — project write-ups, experience, tech stack. The assistant responds from that context. After the reply, a rule-based suggestion engine looks at the intent and loaded sections and proposes two or three natural follow-up questions. Same UI as before — clickable pills — but they're contextual. I kept empty-state starters static for now; follow-ups are dynamic. It's all server-side, no extra LLM round trip for suggestions.”

---

## Code map

| Piece | Location |
|-------|----------|
| Intent routing | `features/ai-chat/utils/intent-router.ts` |
| Knowledge loading | `features/ai-chat/utils/load-knowledge-context.ts` |
| Suggestion templates | `features/ai-chat/utils/suggestion-templates.ts` |
| Generator | `features/ai-chat/utils/generate-suggestions.ts` |
| Stream wiring | `features/ai-chat/api/run-chat-stream.ts` |
| Empty-state pills | `features/chat-ui/components/suggestions.tsx` |
| Pill UI | `components/related.tsx` |
| Tests | `__tests__/features/ai-chat/generate-suggestions.test.ts` |

---

## Still on the roadmap (Stage 7)

- Delete static `related` arrays from tool source files (today they're overridden at stream time).
- Full integration cleanup and e2e checks that clicking a pill routes to the expected intent on the next turn.
