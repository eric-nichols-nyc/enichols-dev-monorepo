# Feature spec — V2 theme and brand alignment

**Status:** Implemented; verified locally (shared dependency blocks typecheck/build)

## Goal

Apply Portfolio Chat V2's navy surfaces, pale-blue accent, system typography, and `en.` wordmark to the original app on port 3018. Remove the selected greeting's animated glow and reformat its text for easier reading.

## Requirements

- Use V2's existing semantic color values and system font stack. Map the original app's sidebar and signal tokens to the same palette.
- Replace the lightning mark in the desktop sidebar, mobile drawer, and favicons with V2's `en.` brand.
- Retain the desktop brand's clear-chat action and accessible name.
- Remove animated shine/glow from the greeting and brand; use an open, left-aligned greeting with a clear heading and readable body.
- Keep the original chat, sidebar navigation, input, artifacts, and greeting variants functional.
- Welcome copy is warm and conversational, with a two-part heading and a pale-blue second line inspired by the supplied V2 reference. Remove résumé shorthand and outdated references to suggestion pills.
- Consume shared UI packages without editing their source. Read the sibling app as the authorized visual reference only.

## Ownership and scope

`features/branding/components/portfolio-mark.tsx` owns the reusable mark. Existing brand wrappers remain at their legacy paths. Greeting presentation remains in `features/chat-ui`; global tokens and typography remain in `app/styles.css`. Favicons keep their existing public URLs. No API, content grounding, workspace config, or V2 source changes.

## Acceptance and verification

- [x] Original app displays V2's palette, typography, and wordmark.
- [x] Greeting has no glow or animated border and reads clearly on desktop/mobile.
- [x] Brand reset, local project browsing, and mobile navigation still work.
- [x] Typecheck/build results and visual checks are recorded; existing external blockers are identified without expanding scope.
- [x] Feature registry, context, progress, and UI patterns reflect the result.

## Verification — 2026-10-16

- Four existing browser checks pass: sidebar, suggestion, and typed project browsing with detail actions, plus mobile drawer navigation.
- Manual desktop/mobile checks confirm the new wordmark, readable unboxed greeting, and no horizontal overflow at 390px. Enter on the desktop brand resets chat to the greeting.
- Browser-computed values confirm page `#10151d`, primary `#b1caff`, and the system sans font stack after the dev-server stylesheet refresh.
- Typecheck and production build are blocked by the existing unresolved `radix-ui` import in the shared design system's `label.tsx`, consumed by the admin project form. No shared package source was edited.
- The old Google font fetch dependency is removed from the app layout. No API, model, or content grounding changes were needed.

## Design review

| Before | After | Why |
| --- | --- | --- |
| Gold accent and Geist font imports | V2 navy/pale-blue tokens and system font stack | Consistent visual identity across both versions |
| Lightning inside animated circular shine | Static `en.` wordmark with blue dot | Match V2 branding and remove decorative glow |
| Centered greeting in an animated card | Open left-aligned heading and body | Clearer hierarchy and easier reading |
| Résumé shorthand and outdated suggestion-pill references | Four welcoming intros with a bold heading and blue second line | Match the more personal tone of the user's V2 reference |

### Greeting and reset refinement — 2026-10-16

Refreshed all greeting copy while preserving random selection; added the pale-blue accent line. The reset row has no separate background or lower divider, and its icon uses the white foreground on a dark secondary button. Desktop and 390px browser review passes, including heading wrapping, no horizontal overflow, and keyboard reset clearing the draft. Typecheck retains only the existing shared `radix-ui` dependency error.
