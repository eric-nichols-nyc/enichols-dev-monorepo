import { AIMessageChunk, ToolMessage } from "@langchain/core/messages";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { langchainWeatherAgent } from "@/lib/ai/agents/langchain-agent";

export const maxDuration = 30;

type TrackedToolCall = {
  toolName: string;
  argsText: string;
  inputSent: boolean;
};

function textFromUiMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        part.type === "text" && typeof part.text === "string"
    )
    .map((part) => part.text)
    .join("")
    .trim();
}

function toLangChainMessages(messages: UIMessage[]) {
  return messages
    .map((message) => {
      const content = textFromUiMessage(message);
      if (!content) {
        return null;
      }
      if (message.role === "assistant") {
        return { role: "assistant" as const, content };
      }
      if (message.role === "user") {
        return { role: "user" as const, content };
      }
      return null;
    })
    .filter(
      (
        message
      ): message is { role: "user" | "assistant"; content: string } =>
        message != null
    );
}

function parseToolOutput(content: ToolMessage["content"]): unknown {
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }
  return content;
}

function parseToolInput(argsText: string): unknown {
  if (!argsText.trim()) {
    return {};
  }
  try {
    return JSON.parse(argsText);
  } catch {
    return { raw: argsText };
  }
}

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();
    const lcMessages = toLangChainMessages(messages);

    if (lcMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stream = createUIMessageStream({
      onError: (error) => {
        console.error("[api/chat/langchain] stream error:", error);
        return error instanceof Error ? error.message : "An error occurred.";
      },
      execute: async ({ writer }) => {
        const textId = crypto.randomUUID();
        let textStarted = false;
        const toolCalls = new Map<string, TrackedToolCall>();
        const indexToToolCallId = new Map<number, string>();

        const ensureTextStart = () => {
          if (!textStarted) {
            writer.write({ type: "text-start", id: textId });
            textStarted = true;
          }
        };

        const agentStream = await langchainWeatherAgent.stream(
          { messages: lcMessages },
          { streamMode: "messages" }
        );

        for await (const item of agentStream) {
          const message = Array.isArray(item) ? item[0] : item;

          if (AIMessageChunk.isInstance(message) && message.tool_call_chunks?.length) {
            for (const chunk of message.tool_call_chunks) {
              const index = chunk.index ?? 0;

              if (chunk.id) {
                indexToToolCallId.set(index, chunk.id);
              }

              const toolCallId =
                chunk.id ?? indexToToolCallId.get(index) ?? `tool-${index}`;

              if (chunk.name && !toolCalls.has(toolCallId)) {
                toolCalls.set(toolCallId, {
                  toolName: chunk.name,
                  argsText: chunk.args ?? "",
                  inputSent: false,
                });
                writer.write({
                  type: "tool-input-start",
                  toolCallId,
                  toolName: chunk.name,
                });
              } else if (!toolCalls.has(toolCallId) && chunk.args) {
                toolCalls.set(toolCallId, {
                  toolName: "unknown",
                  argsText: "",
                  inputSent: false,
                });
              }

              const tracked = toolCalls.get(toolCallId);
              if (tracked && chunk.args) {
                tracked.argsText += chunk.args;
                writer.write({
                  type: "tool-input-delta",
                  toolCallId,
                  inputTextDelta: chunk.args,
                });
              }
            }
            continue;
          }

          if (ToolMessage.isInstance(message)) {
            const toolCallId = message.tool_call_id;
            const tracked = toolCalls.get(toolCallId);

            if (tracked && !tracked.inputSent) {
              writer.write({
                type: "tool-input-available",
                toolCallId,
                toolName: message.name ?? tracked.toolName,
                input: parseToolInput(tracked.argsText),
              });
              tracked.inputSent = true;
            }

            writer.write({
              type: "tool-output-available",
              toolCallId,
              output: parseToolOutput(message.content),
            });
            continue;
          }

          if (AIMessageChunk.isInstance(message) && message.text?.trim()) {
            ensureTextStart();
            writer.write({
              type: "text-delta",
              id: textId,
              delta: message.text,
            });
          }
        }

        if (textStarted) {
          writer.write({ type: "text-end", id: textId });
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("[api/chat/langchain]:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process LangChain chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
