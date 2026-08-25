import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { weatherTool } from "@/lib/ai/tools/weather-tool";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    const result = streamText({
      model: openai(process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini"),
      system:
        "You are a helpful assistant. When the user asks about weather in a city or location, use the weather tool.",
      messages: await convertToModelMessages(messages),
      tools: {
        weather: weatherTool,
      },
      // Allow the model to call a tool, then write a follow-up reply
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[api/chat/basic]:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
