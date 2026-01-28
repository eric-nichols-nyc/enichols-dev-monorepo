import type { UIMessage } from "@repo/ai";
import { convertToModelMessages, streamText } from "@repo/ai";
import { models } from "@repo/ai/lib/models";

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages?: UIMessage[] };

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = streamText({
      model: models.chat,
      system: "You are a helpful AI assistant. Be concise and clear.",
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({ originalMessages: messages });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
