# Memory — AI Chatbots / Basic Chat + LangChain Chat

Location: `apps/ai-chatbots/memory.md` (app-scoped — not repo root)

Last updated: 2026-08-24

## What was built

### Basic chat (prior session, still in place)

- `components/basic-chat.tsx` — reusable streaming chat with design-system ai-elements + `useChat`
- `app/basic-chat/page.tsx` — basic chat page
- `app/api/chat/basic/route.ts` — AI SDK `streamText` + `weather` tool
- `lib/ai/tools/weather-tool.ts` — async generator weather tool
- `lib/ai/agents/weather-agent.ts` — `ToolLoopAgent` (defined, not wired to route)

### LangChain chat (this session)

- **Packages:** `langchain`, `@langchain/openai`, `@langchain/core`
- `lib/ai/tools/langchain-weather-tools.ts` — `lookupTemperature` (inner) + `getCityWeather` (outer, calls inner via `.invoke()`)
- `lib/ai/agents/langchain-agent.ts` — `createAgent` with explicit `ChatOpenAI` instance
- `app/api/chat/langchain/route.ts` — LangChain agent stream bridged to AI SDK `createUIMessageStream` with proper `tool-input-*` / `tool-output-*` chunks
- `components/langchain-chat.tsx` — renders `tool-get_city_weather` with `ToolInput` / `ToolOutput`
- `app/langchain-chat/page.tsx` — LangChain chat page
- `app/page.tsx` — home links to `/basic-chat` and `/langchain-chat`
- `next.config.ts` — `serverExternalPackages: ["langchain", "@langchain/core", "@langchain/openai"]`

## Decisions made

- **AI SDK basic chat:** agent file optional — route can use `streamText({ tools })` directly
- **LangChain chat:** agent file required — `createAgent` is the model↔tools loop; keep in `lib/ai/agents/`
- **Next.js + LangChain model:** use explicit `new ChatOpenAI({...})`, not `"openai:gpt-4o-mini"` strings (dynamic imports fail in Turbopack)
- **LangChain → UI bridge:** manual mapping in route (LangChain `tool_call_chunks` / `ToolMessage` → AI SDK tool UI chunks); do not reuse `BasicChat` — tool part type is `tool-get_city_weather`, not `tool-weather`
- **Nested tool demo:** only outer tool registered on agent; inner tool called programmatically inside outer tool's execute

## Problems solved

- **`Cannot find module as expression is too dynamic`** — LangChain model string `"openai:..."` uses runtime dynamic imports; fixed with explicit `ChatOpenAI` + `serverExternalPackages`
- **LangChain tool input UI missing** — route was writing tool results as markdown `_Tool ..._` text deltas; fixed by emitting `tool-input-start`, `tool-input-delta`, `tool-input-available`, `tool-output-available` chunks and adding `LangChainChat` component

## Current state

**Working:**
- Dev server: `pnpm dev` on port **3013**
- `/basic-chat` — AI SDK streaming + `tool-weather` UI
- `/langchain-chat` — LangChain agent + nested tool call + tool input/output cards + streamed reply

**Partial / not wired:**
- `weather-agent.ts` (`ToolLoopAgent`) still not connected to a route or page

**Env (names only):**
- `OPENAI_API_KEY` required in `.env.local`
- Optional: `OPENAI_CHAT_MODEL` (defaults to `gpt-4o-mini`)

**Known friction:**
- `weather-tool.ts` / `weather-agent.ts` may show TS2742 portable-type errors under strict declaration emit
- `@repo/design-system` still on `ai@5` — minor type friction with ai-elements, runtime OK

## Next session starts with

1. `/remember restore` — read `apps/ai-chatbots/memory.md`
2. To add another LangChain tool: define in `lib/ai/tools/`, register on agent, map chunks in route, add renderer in `langchain-chat.tsx`
3. Optional: wire `weather-agent.ts` to `/api/chat/agent` as AI SDK `ToolLoopAgent` demo alongside LangChain route

## Open questions

- Wire `ToolLoopAgent` to dedicated route vs keep as reference only?
- Upgrade `@repo/design-system` to `ai@7` monorepo-wide?
- Use LangChain's native streaming/UI helpers instead of manual chunk bridge?
