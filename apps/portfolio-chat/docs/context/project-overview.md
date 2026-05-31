# Project overview — Portfolio Chat

## What it is

**Portfolio Chat** is Eric Nichols' interactive portfolio: a Next.js app where visitors chat with an AI assistant that surfaces projects, experience, tech stack, and about content via streaming text and generative UI (tool results).

## Goals

- Showcase work and background through conversation, not only static sections
- Demonstrate modern React, Next.js App Router, and Vercel AI SDK patterns
- Keep content maintainable in TypeScript (`data/`) without a CMS

## Primary users

See [prd.md](../prd.md).

## Core user journeys

1. Open site → see greeting and sidebar navigation
2. Ask or click suggestion → streamed reply
3. Request "show projects" (or similar) → tool renders `<Projects />` (etc.) in the thread
4. Open artifact for a featured card → expanded detail in side panel
5. Clear chat from sidebar logo → fresh session

## Success criteria

- Chat feels responsive (streaming text + tool UI without full page reload)
- Tool output matches `data/*` content
- Mobile layout usable (collapsible sidebar, artifact panel)

## Out of scope (for agents unless spec says otherwise)

- Editing `packages/design-system` or `packages/ai`
- Other monorepo apps
