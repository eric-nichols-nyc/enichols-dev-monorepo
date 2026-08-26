/**
 * POST /api/chat/reasoning
 *
 * Practical reasoning demo (works with gpt-4o-mini — no special o-series model required).
 *
 * How it works:
 *   1. System prompt tells the model to put scratch work in <reasoning>...</reasoning>
 *   2. `extractReasoningMiddleware` strips those tags into UI `reasoning` parts
 *   3. `sendReasoning: true` forwards those parts to the client
 *   4. Chat UI renders them in a collapsible Thinking panel, then the final answer
 *
 * Native reasoning models (o3 / o4-mini) work the same on the UI side — they emit
 * reasoning parts from the provider instead of from tagged text.
 */
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  streamText,
  type UIMessage,
  wrapLanguageModel,
} from "ai";

export const maxDuration = 60;

const reasoningModel = wrapLanguageModel({
  model: openai(process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini"),
  // Pull <reasoning>...</reasoning> out of the model output into part.type === "reasoning"
  middleware: extractReasoningMiddleware({ tagName: "reasoning" }),
});

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    const result = streamText({
      model: reasoningModel,
      system: `You are a careful problem-solving assistant.
When answering, ALWAYS follow this format exactly:
1. Put your step-by-step thinking inside <reasoning>...</reasoning> tags.
2. After the closing tag, write a short clear final answer (no tags).

Keep reasoning concise (a few short steps). The final answer should stand alone.`,
      messages: await convertToModelMessages(messages),
    });

    // Required — without this, reasoning parts never reach the client
    return result.toUIMessageStreamResponse({ sendReasoning: true });
  } catch (error) {
    console.error("[api/chat/reasoning]:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process reasoning chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
