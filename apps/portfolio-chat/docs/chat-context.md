# Chat Context and State Management

This document explains how chat state is shared across the portfolio chat application and how to clear the chat.

## Overview

Chat state (messages, status, errors) lives in React Context via `PortfolioChatProvider` and is consumed through the `usePortfolioChat` hook. This allows components like the sidebar and the main chat area to share the same chat session without prop drilling.

## Architecture

```
PortfolioChatProvider (context)
├── CollapsibleSidebarLayout (sidebar with GreetingButton)
├── Chat (messages + input)
└── Messages (renders message list)
```

## Chat Context API

The context exposes:

| Property        | Type                                               | Description                         |
| --------------- | -------------------------------------------------- | ----------------------------------- |
| `messages`      | `UIMessage[]`                                      | Current chat messages               |
| `sendMessage`   | `(message: { text: string; files?: unknown[] }) => void` | Send a new message to the assistant |
| `clearMessages` | `() => void`                                       | Clear all messages and reset chat   |
| `status`        | `"streaming" \| "submitted" \| "ready" \| "error"` | Current request status              |
| `error`         | `unknown`                                          | Error from the last request, if any |

## Clearing the Chat

### How It Works

The chat is cleared by calling `setMessages([])` from the AI SDK's `useChat` hook. The context wraps this in a `clearMessages` callback for convenience and stability (memoized with `useCallback`).

### Implementation

In `contexts/chat-context.tsx`:

```typescript
const { error, messages, sendMessage, setMessages, status } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat" }),
});

const clearMessages = useCallback(() => {
  setMessages([]);
}, [setMessages]);
```

### Where It's Used

The **GreetingButton** in the sidebar header clears the chat when clicked. This gives users a quick way to start a new conversation from anywhere.

In `components/collapsible-sidebar-layout.tsx`:

```typescript
const { clearMessages, sendMessage } = usePortfolioChat();

// ...

<GreetingButton
  aria-label="Clear chat and start fresh"
  className="h-8 w-8"
  onClick={clearMessages}
/>
```

### Using `clearMessages` Elsewhere

Any component under `PortfolioChatProvider` can clear the chat:

```typescript
import { usePortfolioChat } from "@/contexts/chat-context";

function MyComponent() {
  const { clearMessages } = usePortfolioChat();

  return (
    <button onClick={clearMessages} type="button">
      Start over
    </button>
  );
}
```

## GreetingButton and Props

The `GreetingButton` component forwards all standard button props (including `onClick`) to the underlying `Button`, so it can be used as a regular button with custom behavior:

```typescript
// Clear chat
<GreetingButton onClick={clearMessages} />

// Custom size
<GreetingButton className="h-8 w-8" />
```

## Related

- [Chat Rendering: Tools vs Text](./chat-rendering.md) – How message parts are rendered
- `contexts/chat-context.tsx` – Chat context implementation
