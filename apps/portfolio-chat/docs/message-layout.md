# Message Layout and Streaming UX

This document explains how the chat keeps assistant responses high on the screen during streaming and how layout changes are animated.

## Active Assistant Min-Height Pattern

### Goal

When the assistant streams a response, we want the content to appear well above the prompt input—not right at the bottom. When the user sends a new message, the previous assistant response should collapse so the new message sits directly underneath it, with no gap.

### How It Works

1. **Message A (user)** — Renders at the top of the visible chat.
2. **Message B (assistant)** — Gets `min-h-[400px]` because it is the last message. As B streams, it grows above the input.
3. **Message C (user)** — When the user sends C, B is no longer the last message. B loses `min-h-[400px]` and collapses. C renders directly under B.
4. **Message D (assistant)** — D is now the last message, so it gets `min-h-[400px]` and streams above the input.
5. The cycle repeats for subsequent messages.

### Implementation

Only the **last message** in the thread gets the min-height, and only when it is an **assistant** message:

```typescript
// In ChatMessage
const isActiveAssistant = msg.role === "assistant" && isLastMessage;

<MessageContent
  className={cn("text-base", isActiveAssistant ? "min-h-[400px]" : "")}
>
```

In `Messages`, we pass `isLastMessage` when mapping:

```typescript
messages.map((msg, i) => (
  <ChatMessage
    msg={msg}
    isLastMessage={i === messages.length - 1}
    ...
  />
))
```

## Layout Animation

When the min-height is toggled (e.g., B collapsing when C is sent), the change is animated using **Motion** (motion/react) with the `layout` prop.

### Why Motion

- **Motion `layout`** — Animates size and position changes when content changes. Handles the min-height transition smoothly.
- **CSS `transition`** — Cannot animate `min-height` to `auto` cleanly.
- **Scroll** — Can keep the view in place but does not smooth the collapse itself.

### Implementation

Each message is wrapped in a `motion.div` with `layout`:

```typescript
<motion.div
  className="min-w-0 flex-1"
  layout
  transition={{
    layout: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
  }}
>
  <Message ...>
    <MessageContent ... />
  </Message>
</motion.div>
```

When the inner content resizes (e.g., MessageContent loses min-height), Motion animates the change instead of a jarring jump.

## Component Structure

### ChatMessage (`components/message.tsx`)

- Wraps a single message (user or assistant) with `Message` and `MessageContent`.
- Uses `MessagePartRenderer` to render each part (text, tool outputs).
- Renders `Related` suggestions when available.
- Applies `min-h-[400px]` only when `isActiveAssistant` (assistant + last message).
- Wraps everything in a `motion.div` for layout animation.

### MessagePartRenderer

- Renders individual message parts: `text`, `tool-show_projects`, `tool-show_experience`, `tool-show_about`, `tool-show_tech_stack`.
- Handles loading states (skeletons, loaders) and error states for each tool type.
- Defined in `message.tsx` and used internally by `ChatMessage`.

### getRelatedForMessage

- Extracts related suggestion strings from projects or tech-stack tool output.
- Used to show clickable follow-up suggestions below the message content.
- Returns `null` when there is no text in the message or no related suggestions.
