# Chat Rendering: Tools vs Text

This document explains how the chat interface renders different types of message parts, specifically the difference between regular text messages and tool call outputs.

## Message Structure

Each message in the chat consists of an array of `parts`. Each part has a `type` that determines how it should be rendered:

- `text`: Regular text content from the AI assistant
- `tool-{toolName}`: Tool call results (e.g., `tool-show_projects`)

## Rendering Flow

The chat component (`components/chat.tsx`) iterates through each message's parts and renders them based on their type:

```typescript
{msg.parts.map((part, i) => {
  // Handle text parts
  if (part.type === "text") {
    return <MessageResponse>{part.text}</MessageResponse>;
  }

  // Handle tool parts
  if (part.type === "tool-show_projects") {
    // Render tool-specific UI
  }
})}
```

## Text Rendering

Text parts are the simplest type of message content. They represent conversational text from the AI assistant.

### Example

```typescript
if (part.type === "text") {
  return (
    <MessageResponse key={`${msg.id}-${i}`}>
      {part.text}
    </MessageResponse>
  );
}
```

### When Text is Used

- Direct responses to user questions
- Explanations and conversational content
- Follow-up messages after tool calls

## Tool Rendering

Tool parts represent the results of function calls made by the AI. They have a `state` that indicates their current status and an `output` (or `errorText`) containing the result.

### Tool States

Tools can be in different states during their lifecycle:

1. **`input-streaming`**: Tool call is being prepared (parameters streaming)
2. **`input-available`**: Tool call parameters are ready, waiting for execution
3. **`output-available`**: Tool execution completed successfully, output is available
4. **`output-error`**: Tool execution failed, error information available

### Tool Type Naming

Tool types follow the pattern: `tool-{toolName}`

- The tool name comes from the tool definition in the API route
- Example: `show_projects` tool becomes `tool-show_projects`
- Some SDKs may convert to camelCase: `tool-showProjects`

### Example: show_projects Tool

```typescript
if (
  part.type === "tool-show_projects" ||
  part.type === "tool-showProjects"
) {
  switch (part.state) {
    case "input-available":
    case "input-streaming":
      // Show loading indicator while tool executes
      return <Loader />;

    case "output-available":
      // Render the tool output with a custom component
      return (
        <Projects
          projectCount={part.output.projectCount}
          projects={part.output.projects}
        />
      );

    case "output-error":
      // Display error message
      return <div>Error: {part.errorText}</div>;

    default:
      return null;
  }
}
```

## Tool Output Structure

The tool output structure depends on what the tool returns in the API route:

```typescript
// In app/api/chat/route.ts
const tools = {
  show_projects: tool({
    execute: () => {
      return {
        projectCount: 6,
        projects: projects.slice(0, 3),
      };
    },
  }),
};
```

The returned object becomes `part.output` in the frontend component.

## Adding a New Tool

To add support for a new tool in the chat:

1. **Define the tool in the API route** (`app/api/chat/route.ts`):
   ```typescript
   const tools = {
     my_new_tool: tool({
       description: "Description of what the tool does",
       inputSchema: z.object({}),
       execute: async () => {
         return { /* your data */ };
       },
     }),
   };
   ```

2. **Create a component to render the tool output** (e.g., `components/my-tool-result.tsx`):
   ```typescript
   export function MyToolResult({ data }: { data: YourDataType }) {
     return <div>{/* Your UI */}</div>;
   }
   ```

3. **Add handling in the chat component** (`components/chat.tsx`):
   ```typescript
   if (part.type === "tool-my_new_tool") {
     switch (part.state) {
       case "input-available":
       case "input-streaming":
         return <Loader />;
       case "output-available":
         return <MyToolResult {...(part.output as YourDataType)} />;
       case "output-error":
         return <div>Error: {part.errorText}</div>;
       default:
         return null;
     }
   }
   ```

## Message Parts Array

A single message can contain multiple parts. For example:

- A text part explaining what the tool will do
- A tool part showing the tool result
- Another text part with follow-up information

The chat renders all parts in sequence, allowing for rich, multi-part responses.

## Debugging

The chat component includes console logging to help debug message structure:

```typescript
console.log("part = ", part);
```

This logs each part's structure, including:
- `type`: The part type (e.g., "text", "tool-show_projects")
- `state`: For tool parts, the current state
- `output`: For tool parts with `output-available` state, the tool result
- `errorText`: For tool parts with `output-error` state, the error message

## Best Practices

1. **Always handle all tool states**: Don't forget loading and error states
2. **Type safety**: Use TypeScript type assertions for tool outputs
3. **Component separation**: Create dedicated components for tool outputs
4. **Error handling**: Provide user-friendly error messages
5. **Loading states**: Show appropriate loading indicators during tool execution

## Example: Complete Tool Flow

1. User asks: "Show me your projects"
2. AI decides to call `show_projects` tool
3. Message part created with `type: "tool-show_projects"`, `state: "input-available"`
4. Chat renders `<Loader />` while tool executes
5. Tool completes, part updates to `state: "output-available"` with `output` data
6. Chat renders `<Projects />` component with the project data
7. AI may add a text part with follow-up explanation
