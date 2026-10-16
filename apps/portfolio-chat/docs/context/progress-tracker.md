# Progress tracker — Portfolio Chat

**Live session state.** Update after every meaningful change. The feature index (`docs/feature-specs/00-index.md`) is the permanent map.

## Current Phase

**Original app restructuring — focused details and project Q&A implemented**

## Current Goal

Idle. The original app refresh, focused overlay, independent project Q&A, and expand affordance are implemented and code-verified for integration with `main`. Browser acceptance remains deferred ([spec](../feature-specs/13-project-detail-overlay.md)).

## Completed

- project-expand-affordance — Added a persistent top-right expand icon with a dark background over selectable project previews. Reuses the existing card click/keyboard action without an extra focus stop. Diff checks pass; typecheck retains the shared `radix-ui` blocker. Browser verification remains deferred.

- project-detail-overlay — Replaced the split/animated/loading overlay with a stable fullscreen shared Dialog and immediate details. Added collapsed, independently streamed project Q&A with server-resolved grounding/follow-ups, stop/clear/error handling, and close cancellation. All 193 unit tests pass (32 new); CSS checks pass. Typecheck/build retain the shared `radix-ui` blocker; four new browser cases remain unrun ([spec](../feature-specs/13-project-detail-overlay.md)).

- project-card-stack — Stacked previews, details, and link footers vertically at all viewport widths, including embedded chat; matched skeletons and updated responsive image sizes. CSS checks pass; typecheck/build retain the existing shared `radix-ui` blocker. Browser review remains deferred ([spec](../feature-specs/05-artifacts.md#project-card-layout-refinement--2026-10-16)).

- welcome-intro-static — Removed the entrance animation entirely at the user's request, including welcome animation classes and global tokens/keyframes. Greeting and cards display immediately ([spec](../feature-specs/12-chat-welcome-transition.md)).

- chat-welcome-transition — Kept the welcome above real turns; added interruptible pointer motion, immediate keyboard/reduced-motion placement, reusable cards, composer focus, content-growth detection, and reset-to-top. All 161 unit tests pass; browser cases are added but unrun per user request. Typecheck/build retain the existing shared `radix-ui` blocker ([spec](../feature-specs/12-chat-welcome-transition.md)).

- welcome-personality — Rewrote the rotating intros with warmer copy and a blue second headline line; removed the reset row surface/divider and changed the button to dark with a white icon. Desktop/390px visuals and keyboard draft reset verified; typecheck retains the shared `radix-ui` blocker.

- chat-reset-control — Added a dark top-right icon-only reset button with a white icon and accessible “Reset chat” label, clearing the shared session/active request and local draft/artifact state. Desktop keyboard and 390px active-request reset verified; existing shared `radix-ui` still blocks typecheck/build.

- suggestion-prompt-cards — Replaced welcome pills with the approved Paper prompt cards beneath the greeting; preserved preset messages and follow-ups, added keyboard/focus/phone behavior, and recorded visual patterns. Six existing browser checks pass; typecheck/build retain the existing shared `radix-ui` blocker ([spec](../feature-specs/11-suggestion-prompt-cards.md)).

- original-v2-theme-brand — Applied V2's navy/blue tokens, system fonts, `en.` wordmark and favicons; removed greeting/logo shine and reformatted the greeting. Four project-navigation checks and desktop/mobile review pass. Typecheck/build retain the existing shared `radix-ui` blocker ([spec](../feature-specs/10-v2-theme-brand.md)).

- portfolio-chat-v2 — Renamed the sibling app, refined the chosen Chat studio layout, and integrated real grounded AI, portfolio tools, and contextual follow-ups under feature-owned modules. Typecheck, 111 unit tests, eight browser checks, and production build pass; see [V2 README](../../../portfolio-chat-v2/README.md) and [specification](../../../portfolio-chat-v2/docs/feature-specs/01-portfolio-chat-v2.md).

- portfolio-studio-prototype — Created the initial three-layout design experiment. The selected app is now `portfolio-chat-v2`; original variants remain recoverable on `codex/portfolio-studio-prototype` at `0ecd7f5`. Explicit sibling-app scope expansion authorized on 2026-10-16.

- ai-follow-up-v1 — One structured OpenAI call, deadline/abort handling, partial-candidate validation, safe fallback, held stream finish, real tool context, feature flag, and reset/new-turn cancellation; verified with unit/browser checks and live samples ([spec](../feature-specs/knowledge-assistant/09-ai-follow-up-questions.md#implementation)).

- ai-follow-up-foundation — Added bounded public-evidence context, card fact summaries, candidate schemas, routing/evidence checks, repeat filtering, and safe fallback selection; tested pure helpers ([spec](../feature-specs/knowledge-assistant/09-ai-follow-up-questions.md#implementation)).

- ai-follow-up-spec — Drafted V1 requirements, flow diagram, acceptance criteria, and advanced roadmap; registered as Not started ([spec](../feature-specs/knowledge-assistant/09-ai-follow-up-questions.md)).

- portfolio-projects — Only Trellix and CodeDrill are published; cards, chat routing, and suggestions use the filtered project list. Other project content remains archived.

- projects-navigation — Sidebar and chat project-list requests share local tool output, preserving card expansion, links, and suggestions without OpenAI credits.

- chat-error-alert — Visible accessible failure message above the input; sanitized stream errors, no suggestions after failures, clear error when resetting chat.

- sidebar-icon-rail — Desktop sidebar is a fixed icon rail: expand toggle removed; nav labels sit under icons (`AppSidebarShell`)
- theme-geist-oklch — Geist + Geist Mono via `next/font/google`; always-dark oklch tokens + `--signal` in `app/styles.css` (v0 theme overlay on design-system globals)
- project-publisher-stage13 — File writers: `writeKnowledgeFile`, `updateProjectsFile`, duplicate ID guard, rollback on partial failure ([implementation](../feature-specs/project-publisher/implementation.md#stage-13--file-writers))
- project-publisher-stage12 — Publish endpoint: `POST /api/admin/projects/publish`, local write guard, server-side re-validation, wired `use-publish-project` ([implementation](../feature-specs/project-publisher/implementation.md#stage-12--publish-endpoint))

- project-publisher-stage11 — Admin preview: structured markdown + project summary, Approve & publish + Cancel/reset actions, publish disabled when draft invalid ([implementation](../feature-specs/project-publisher/implementation.md#stage-11--admin-preview))

- project-publisher-stage10 — Validation polish: `validate-project.ts` with readable Zod errors, pipeline blocks invalid drafts, preview/publish gated via `isValidDraft()` ([implementation](../feature-specs/project-publisher/implementation.md#stage-10--validation))

- project-publisher-stage9 — Project object generation: `generateObject` + `projectGenerationSchema`, prompts, admin field merge (`image`, `gallery`, `liveUrl`, `position`, `published`) ([implementation](../feature-specs/project-publisher/implementation.md#stage-9--project-object-generation))
- project-publisher-stage8 — Markdown generation: OpenAI via `generateText`, portfolio-aligned prompt in `prompts.ts`, frontmatter + required sections, code-fence stripping ([implementation](../feature-specs/project-publisher/implementation.md#stage-8--markdown-generation))
- project-publisher-stage7 — Generate pipeline skeleton: `runGeneratePipeline()` orchestrates README fetch, placeholder markdown/project generation, Zod validation, early exit on errors ([implementation](../feature-specs/project-publisher/implementation.md#stage-7--generate-pipeline-skeleton))
- project-publisher-stage6 — README retrieval: `parse-github-repo-url.ts`, `read-github-readme.ts` with GitHub API headers + error mapping; unit tests for parser and mocked fetch ([implementation](../feature-specs/project-publisher/implementation.md#stage-6--readme-retrieval))
- project-publisher-stage5 — Generate endpoint: `POST /api/admin/projects/generate`; validates body, verifies admin secret, calls `runGeneratePipeline()`; `use-generate-draft` wired to API ([implementation](../feature-specs/project-publisher/implementation.md#stage-5--generate-endpoint))
- project-publisher-admin-layout — Shared `AppSidebarShell` on all `/admin/*` routes via `app/admin/layout.tsx` ([architecture](../feature-specs/project-publisher/architecture.md#authentication))
- project-publisher-stage4b — Admin sidebar nav: `isAdminSessionActive()`, pinned Admin / New project link when unlocked ([implementation](../feature-specs/project-publisher/implementation.md#stage-4b--admin-sidebar-nav))
- project-publisher-stage4 — Admin page skeleton: thin `app/admin/projects/new/page.tsx`, form with gallery field, preview UI, `use-generate-draft` wired with loading/error states ([implementation](../feature-specs/project-publisher/implementation.md#stage-4--admin-page-skeleton))

- project-publisher-stage3 — Zod `projectSchema` + `projectMetricSchema` mirroring `Project` / `ProjectMetric`; `ValidatedProject` types; `publishRequestBodySchema` uses `projectSchema` ([implementation](../feature-specs/project-publisher/implementation.md#stage-3--project-schema))
- project-publisher-stage2 — Admin auth: `POST /api/admin/unlock`, `middleware.ts`, thin `app/admin/unlock/page.tsx`, real `use-admin-auth` ([implementation](../feature-specs/project-publisher/implementation.md#stage-2--admin-auth))
- project-publisher-stage1 — Feature foundation: `features/project-publisher/{components,hooks,utils,lib}` with typed stubs; `pnpm typecheck` passes ([implementation](../feature-specs/project-publisher/implementation.md#stage-1--feature-foundation))
- project-publisher-alignment — All 8 pre-implementation steps complete ([00-index](../feature-specs/project-publisher/00-index.md#pre-implementation-alignment-checklist))
- project-publisher-github — README via GitHub REST API (`read-github-readme.ts`); optional `GITHUB_TOKEN`; not Cursor MCP ([architecture](../feature-specs/project-publisher/architecture.md#github-readme-fetch))
- project-publisher-publish-model — Local writes only (`PROJECT_PUBLISHER_ENABLE_WRITES`); blocked on Vercel; manual git commit ([architecture](../feature-specs/project-publisher/architecture.md#publish-model))
- project-publisher-auth — `ADMIN_SECRET` + Bearer header; unlock cookie; middleware on `/admin/*` ([architecture](../feature-specs/project-publisher/architecture.md#authentication))
- project-publisher-model — OpenAI only (`OPENAI_API_KEY`, `AI_PROVIDER=openai`); no Google/Gemini in app docs
- project-publisher-orchestration — MVP uses AI SDK typed pipeline; LangGraph deferred to Phase 2 ([architecture](../feature-specs/project-publisher/architecture.md))
- project-publisher-prd — Updated [docs/prd.md](../prd.md): P9 Project Publisher in scope; internal admin constraints; knowledge layer in content model
- project-publisher-registry — Registered in [00-index](../feature-specs/00-index.md); specs under [project-publisher/](../feature-specs/project-publisher/00-index.md) (canonical name; was `project-agent/`)
- sidebar-nav-p3 — Active section highlight via `useActiveNavSection` + optimistic nav clicks ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P3)
- sidebar-nav-shell — Matched header heights (`h-[4.5rem]`), social icons right + 10% smaller
- sidebar-nav-p8 — Brand subtitle “Ask about my work” under name (expanded + mobile) ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P8)
- sidebar-nav-p5-p7 — Muted inactive nav text + hover pop; `--sidebar-border` + `border-sidebar-r` edge ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P5, P7)
- sidebar-nav-p4 — “Explore” section label above nav (expanded + mobile; hidden collapsed) ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P4)
- sidebar-nav-p2 — Nav pill affordance at rest: `bg-muted/30` + `hover:bg-muted` on desktop + mobile ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P2)
- sidebar-nav-p1 — Distinct sidebar surface: `--sidebar-background` + `bg-sidebar` on desktop + mobile drawer ([09-sidebar-nav-visibility](../feature-specs/09-sidebar-nav-visibility.md) P1)
- tech-stack-table — `TechStack` renders per-category tables (Technology, Proficiency, Experience) from `data/tech.json` ([08-tech-stack-table](../feature-specs/08-tech-stack-table.md))
- concise-about-intro — Short rule-based intro variants (`data/about.ts`, `select-about-intro.ts`); all `candidate_overview` use about-stream; trimmed `candidate-profile.md`
- knowledge-assistant-stage5 — Dynamic suggestions (`generate-suggestions.ts`, `suggestion-templates.ts`, wired in `run-chat-stream.ts`)
- knowledge-assistant-stage2-3 — Context loader + intent router with unit tests
- knowledge-assistant-stage1 — `knowledge/` markdown corpus (candidate + projects)
- p7-project-artifact — Click project card in chat opens artifact with `FeaturedProject` + bounding-box animation
- ai-chat-migration — `features/ai-chat/` + thin route + `@/lib/ai/*` shims
- chat-ui-migration — `features/chat-ui/` + legacy shims at `components/chat`, `messages`, etc.
- specs-all — Full specs for 02–07 feature registry (all shipped areas documented)
- specs-core — Full specs for [02-chat-ui](../feature-specs/02-chat-ui.md) and [06-ai-chat](../feature-specs/06-ai-chat.md) from codebase
- ai-prompt — System prompt extracted to `lib/ai/prompts/portfolio-assistant.ts`
- agent-docs — Spec-driven doc system (AGENTS chain, context/, feature-specs/, reference/, Cursor rules, .cursorignore)
- chat-core — Streaming chat UI with `useChat`, message parts, suggestions (`components/chat.tsx`, `messages/`, `message.tsx`)
- chat-api — POST `/api/chat` with tools: about, projects, experience, tech stack
- about-stream — Word-by-word about stream mode (`lib/ai/about-stream-mode.ts`, e2e spec)
- layout — Collapsible sidebar + artifact panel for featured project/experience
- data-layer — Typed portfolio content in `data/*`

## In Progress

- AI follow-up release checks — Implementation verified locally; production checks are blocked by the existing shared dependency/font-fetch issues. Default flag remains off ([spec](../feature-specs/knowledge-assistant/09-ai-follow-up-questions.md#verification-and-release)).

## Next Up

- Focused project overlay — When browser review is requested, run the new project-overlay cases and inspect desktop/mobile focus, main-scroll/draft restoration, streamed answers, and close cancellation. Code verification is complete; no live model or visual verification is claimed.
- Welcome-message transition — Review the implemented motion in the browser when the user chooses. Check welcome reuse, later/instant turns, streaming/manual interruption, keyboard/reduced motion, phone layout, and reset. Browser access was denied and the user explicitly selected code checks only for this implementation.
- Portfolio Chat V2 — Review the working Chat studio app on 3019; hosting/deployment can follow when requested. This original app retains its existing UI and default follow-up flag.
- AI follow-up questions — Resolve production-check blockers with separately authorized shared-package work before broad rollout; evaluate latency and question quality during rollout.
- Project Publisher Stages 3–16 — schema → admin UI → pipeline → publish ([implementation](../feature-specs/project-publisher/implementation.md))
- knowledge-assistant Stage 7 — integration cleanup (remove static tool `related`, guardrails)
- PRD P7b — per-project routes / deep links
- PRD P8 — rate limiting on `/api/chat` (not in app today)
- Migrate sidebar, context, or artifacts into `features/`
- Data quality: R8 schema tests, R9 link checker (07-portfolio-data)

## Open Questions

- [TBD] Target hosting URL and analytics requirements
- [TBD] Priority order for legacy → `features/` migration (chat-ui vs ai-chat first)

## Architecture Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-30 | Agent scope = `apps/portfolio-chat/` only | User choice; packages require explicit approval |
| 2026-05-30 | New code under `features/<name>/` | User choice; gradual migration from flat `components/` |
| 2026-05-30 | Specs live in `docs/feature-specs/` | User choice (not under `context/`) |
| 2026-07-01 | Admin UI in `features/project-publisher/components/` | `app/admin/**/page.tsx` thin shells only — no root `components/` |
| 2026-07-01 | Code layout: `features/project-publisher/{components,hooks,utils,lib}` | No `src/`; specs in docs only; no barrel indexes |
| 2026-07-01 | GitHub README: REST API, not MCP | `GET /repos/{owner}/{repo}/readme`; optional `GITHUB_TOKEN` |
| 2026-07-01 | Publish: local FS writes + manual git | `PROJECT_PUBLISHER_ENABLE_WRITES=true`; block on `VERCEL=1`; no auto-commit |
| 2026-07-01 | Admin auth via `ADMIN_SECRET` | Bearer on APIs; httpOnly cookie + unlock page; 404 if unset |
| 2026-07-01 | OpenAI only — no Google/Gemini | Owner preference; `AI_PROVIDER=openai`, `OPENAI_API_KEY` |
| 2026-07-01 | Project Publisher MVP: AI SDK pipeline, not LangGraph | Linear workflow; matches `features/ai-chat/`; LangGraph in Phase 2 for branching/retries |
| 2026-05-30 | Repo root `AGENTS.md` points here | Portfolio Chat primary entry for this repo |

## Session Notes

- **2026-10-16 (merge verification):** Re-ran all 28 unit files/193 tests successfully for the final app state, including the expand affordance. Diff checks pass. Typecheck and production build still fail on the previously documented shared Label import of missing `radix-ui`; shared source/configuration remains outside scope. Browser checks remain unrun under the standing code-only preference. Prepared an app-only integration branch from current `origin/main` using the exact verified `portfolio-chat` tree, excluding the older prototype ancestor and preserving unrelated V2/workspace edits. The focused-overlay source is checkpointed on its feature branch before integration.

- **2026-10-16 (focused overlay):** Committed the original app checkpoint as `45b8c46` on `codex/chat-welcome-transition` (20 app-only files, excluding generated test results), then created `codex/project-detail-overlay` at the user's request. Implemented `features/project-details/` with a stable shared Dialog, immediate existing project/experience details, and a collapsed project Q&A slot below the overview. Removed the duplicated main-chat column, bounds-driven size animation, and artificial one-second loading state; retained a legacy artifact export shim. Q&A has its own useChat/transport and draft, retains on collapse, and aborts/discards on close. Optional `projectId` on the existing API resolves published server data, validates text history, loads full selected-project knowledge plus facts, and keeps answers/follow-ups scoped without global tools. Existing model and follow-up flags remain in place, with no new dependencies or shared source changes. All 28 unit files/193 tests pass, including 32 new cases; typecheck/build fail only on the existing shared `radix-ui` import. Fullscreen CSS checks pass. Added four browser cases but left them unrun per the user's code-only preference. Specs, PRD, architecture/UI notes, tracker, and Imprint registry are synchronized. New implementation remains uncommitted on the new branch.

- **2026-10-16 (project card stack):** User's screenshot showed project cards squeezed into image/copy/link columns in the embedded chat. Removed desktop row/thumbnail/vertical-action overrides so each card uses a full-width preview above its details and link footer on desktop and mobile. Matched loading skeletons and increased the image `sizes` hint. Kept selection, bounding-box callbacks, and external-link handlers. Updated the artifacts spec and UI registry; verification remains code-only.

- **2026-10-16 (entrance removed):** User reported that the entrance still did not animate and explicitly requested immediate removal. Removed the welcome's animation classes and both global animation tokens/keyframes. The full welcome displays immediately with no fade or starting transform. Synced the active spec, UI context, README, and registry. Earlier code checks did not establish visual correctness; no browser verification is claimed.

- **2026-10-16 (entrance snapping report):** User reported movement starting then snapping into place. Code-only timing analysis confirms the former strong ease-out completed 96.6% by the half-second mark. Replaced starting-style transitions with explicit CSS keyframes and a gradual easeInOutSine curve, retaining the requested 500px/1000ms values, one wrapper, and reduced-motion fade. The new curve reaches 50% at halfway and retains its exact final frame. This verifies a timing/configuration correction; the visual snap has not been reproduced in a browser because verification remains deferred. No shared source or API changes.

- **2026-10-16 (explicit entrance values):** Set the whole welcome's entrance to the user's requested 500px upward travel over one second. Kept the shared wrapper, ease-out curve, reduced-motion fade, and persistent mounting. Verification remains code-only.

- **2026-10-16 (gentler welcome entrance):** User found the grouped entrance too quick and the lift too large. Increased its duration from 280ms to 650ms and reduced travel from 16px to 8px, retaining the existing ease-out curve and reduced-motion fade. This is a deliberate slower first appearance; recurring turn placement keeps its existing timing. Verification remains code-only.

- **2026-10-16 (grouped welcome entrance):** User requested that all welcome items animate together. Moved the existing entrance classes from `Greeting` to the parent `WelcomeMessage`, so the intro, section label, and four cards share one fade-and-rise with no stagger or nested motion. Reduced-motion fade, persistent mounting, and interactive buttons are preserved. Synced the spec and registered pattern. Verification stays code-only.

- **2026-10-16 (intro entrance):** User requested intro motion like the live site. Browser security denied the live URL, so used the app-scoped greeting source from `51c9055^` as a safer local reference; no alternate browsing or remote-fetch workaround was attempted. Added one CSS starting-style opacity/transform entrance using Tailwind utilities: 16px rise, 280ms strong ease-out, or 200ms opacity only for reduced motion. Existing persistent mounting prevents replay during conversation/reset, and cards remain immediately available. Standalone Tailwind compilation confirms all entrance/reduced-motion rules. Typecheck still reports only the existing shared Label `radix-ui` dependency. Visual feel and exact current-live comparison remain unverified. No shared package source, global styles, dependencies, or API behavior changed.

- **2026-10-16 (welcome transition):** Implemented on `codex/chat-welcome-transition` after visual checkpoint `51c9055`. `WelcomeMessage` remains a stable visual item above real turns and stays outside model history. The scroll hook reacts once per new turn key and uses a tested controller to bridge pointer-driven placement with a 240ms transform; keyboard/reduced motion place immediately. Manual input preserves the current visible position when cancelling, reset returns to zero, and content growth updates the jump control without auto-scrolling. Reused existing cards and API/session paths, focused the composer after suggestion sends, and omitted the welcome in embedded chat. All 24 unit files/161 tests pass, including seven new motion-controller cases. Typecheck/build fail only on the existing shared `radix-ui` dependency; shared source is unchanged. Added browser regression cases but did not run them after browser access was denied and the user requested code checks only. Browser feel and full interaction acceptance remain deferred. Specs, architecture/UI notes, scrolling README, and UI registry are synchronized.

- **2026-10-16 (visual checkpoint):** User requested saving the current redesign before exploring animated welcome-to-chat behavior on a new branch. Checkpoint scope is only this original app: navy theme/brand, prompt cards, refreshed greeting, reset control, and their docs. Six navigation/error browser checks pass on the final UI; typecheck/build retain the documented shared `radix-ui` blocker. The proposed welcome-as-first-message transition has not been implemented. Generated test results and sibling-app/workspace changes remain outside this checkpoint.

- **2026-10-16 (welcome personality):** Used the user's side-by-side screenshot to refresh the original app's welcome copy, pairing four friendly intros with a pale-blue accent line. Removed the reset toolbar's separate background and bottom divider; switched the button to the dark secondary variant with a white foreground icon. Desktop and 390px layout/keyboard-reset checks pass, with no horizontal overflow. Typecheck reports only the existing shared `radix-ui` dependency failure. No sibling app or shared source changed.

- **2026-10-16 (reset control):** Added the requested prominent reset action in the main chat's top-right toolbar using the shared default Button and existing `clearMessages()`. Verified keyboard reset of a populated thread and draft, mobile reset during an active request, restored welcome cards, 44px touch target, and no mobile overflow. Embedded chat does not duplicate the action. Recorded the pattern in `ui-registry.md`. Typecheck/build show the same pre-existing shared Label `radix-ui` failure; shared source remains untouched.

- **2026-10-16 (suggestion cards):** Created three editable alternatives in Paper's desktop app; user approved the recommended prompt-card direction. Exported JSX/styles and implemented it in `features/chat-ui`, moving welcome suggestions into the scrollable empty state and aligning the greeting. Preserved all four preset messages, local project navigation, and contextual follow-ups. Verified all four keyboard sends/reset, focus, 390px/320px scrolling with no horizontal overflow, and six existing navigation/error browser checks. `pnpm typecheck` and `pnpm build` still fail only on the known shared Label `radix-ui` dependency. No shared source or V2 changes. Imprinted the card patterns into `ui-registry.md`.

- **2026-10-16 (original restructuring):** Applied V2's navy/pale-blue visual identity and static `en.` wordmark to the original app only. Added a reusable feature-owned mark, updated both existing favicon assets, removed the greeting/brand glow, and replaced Google font imports with V2's system stacks. Four existing project-navigation browser checks pass; keyboard reset and 390px welcome/drawer layout verified manually. Typecheck/build fail only on the existing missing shared `radix-ui` dependency from the admin form's Label import. V2 was read as the authorized reference; its source and shared packages were not modified. Patterns captured in `ui-registry.md`.

- **2026-10-16 (V2):** Implemented `apps/portfolio-chat-v2` on `codex/portfolio-chat-v2`. Feature-first Next.js app with its own chat endpoint, published content snapshot, real streaming model/tools, and contextual follow-ups enabled by default. Verified a live IBM/React answer and generated follow-up continuation. Strict typecheck, 111 unit tests, eight browser checks, and production build pass. Owner approved V2's root lockfile importer; a frozen offline workspace install succeeds. Shared package source and original app behavior are unchanged. Build has six nonfatal transitive externalization warnings. No deployment performed.

- **2026-10-16:** Built `apps/portfolio-studio-prototype` on `codex/portfolio-studio-prototype`, starting from the selected Chat studio concept. Local server on port 3019; three shareable variants, public content snapshots, working project/résumé dialogs, and rule-based sample chat. Syntax and browser checks passed, including narrow-phone overflow checks and reset behavior. Captured visual patterns in the prototype's `ui-registry.md`. No production chat integration, shared-package edits, workspace config changes, or deployment.

- **2026-10-14:** Completed V1 on `codex/ai-follow-up-foundation`. All 154 unit tests and 11 targeted browser checks pass. Live Tech questions were generated by AI and clicking a TypeScript question returned a relevant answer; About/Experience review informed excerpt-formatting and unsupported-assumption guards. Typecheck remains blocked only by missing shared `radix-ui`; build also hits blocked Google Fonts fetches. Local dev server runs with the follow-up flag enabled; no secret/env file or shared package was edited.

- **2026-10-14:** Created `codex/ai-follow-up-foundation` and completed the first implementation unit. All 136 unit tests pass, including 30 new context/validation cases. Typecheck reports only the existing missing `radix-ui` dependency in the shared design system. No routes, UI, environment, or shared packages changed; live AI follow-ups remain pending generation and integration.

- **2026-10-14:** Documentation only: created the AI follow-up questions draft, linked DS9, and updated the registry and PRD. V1 is a draft assumption; no release scope was selected and no application behavior changed. Project-list browsing remains a zero-model-call requirement. Current Goal remains idle.

- **2026-10-07:** Portfolio limited to Trellix and CodeDrill; unpublished projects preserved. Updated publisher footer handling for the filtered export and chat tests for current projects. All 106 unit tests passed; typecheck remains blocked by the shared design system’s missing `radix-ui` dependency.

- **2026-10-07:** `codex/projects-navigation`: fixed missing “Show projects” intent; direct project display uses a shared payload with the model tool (response-handler option B for project lists). 106 unit tests and 6 browser checks passed (4 navigation/card/detail/mobile cases + 2 error-alert regression cases). Typecheck remains blocked only by missing `radix-ui` in the shared design system.

- **2026-10-07:** Chat failure alert verified with 2 browser tests (HTTP and streamed failure, visibility, safe copy, recovery); all 99 unit tests passed. Typecheck blocked by missing `radix-ui` in the shared design system (out of scope). Production build failed on the same missing dependency and blocked Google Fonts fetches.

- **2026-08-26:** Desktop sidebar is a fixed 5.5rem icon rail (no expand). Labels stack under icons; name/subtitle stay in the mobile drawer.
- **2026-08-26:** Theme refresh — replaced Inter with Geist/Geist Mono; app-level always-dark oklch palette (gold `--primary` / `--signal`) overlays `@repo/design-system` globals. Sidebar utilities now use `--sidebar` / `--background`.
- **2026-05-31:** Concise about intro — `selectAboutIntro()` variants by phrase cluster; sidebar “About” sends “Tell me about yourself”; stream path for all `candidate_overview`.
- **2026-05-31:** Stage 5 dynamic suggestions — rule-based `generateSuggestions()` per intent; emits `data-related` at end of turn; strips static tool `related` when KA enabled.
- **2026-05-31:** Knowledge Assistant Stage 0 specs: `00-implementation-stages` through `07-integration-cleanup`; merged `feature/ai-chat` into main; branch `feature/knowledge-assistant-phase0`.
- **2026-05-30:** Completed feature specs 03, 04, 05, 07 — entire registry now Shipped-level documentation.
- **2026-05-30 (later):** Completed 02 + 06 feature specs; extracted system prompt to `lib/ai/prompts/portfolio-assistant.ts`.
- **2026-05-30:** Bootstrapped agent doc system from `AGENT-DOC-BOOTSTRAP-PROMPT.md`. Existing narrative docs (`chat-rendering.md`, etc.) linked from `reference/00-index.md` — not requirements.
