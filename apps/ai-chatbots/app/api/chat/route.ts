import { convertToModelMessages, streamText } from "@repo/ai";
import { models } from "@repo/ai/lib/models";

const model = models.chat;

/**
 * POST /api/chat
 *
 * This is a Next.js Route Handler that receives chat messages
 * and streams AI responses back to the client.
 *
 * Flow:
 * 1. Client sends POST request with { messages: [...] }
 * 2. We call streamText() with the model and messages
 * 3. streamText() starts generating a response
 * 4. We convert the stream to a DataStream format
 * 5. Client receives tokens one-by-one in real-time
 */

export async function POST(request: Request) {
  try {
    // Parse the request body to get the conversation history
    // messages format: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi!' }, ...]
    const { messages } = await request.json();

    /**
     * streamText() is the main function from Vercel AI SDK
     *
     * It:
     * - Takes a model (OpenAI in our case)
     * - Takes conversation messages
     * - Starts generating a response
     * - Returns a stream object
     *
     * The stream sends tokens (pieces of words) as they're generated,
     * rather than waiting for the entire response to complete.
     */
    const result = streamText({
      model,
      messages: convertToModelMessages(messages),

      // System message: instructions for how the AI should behave
      system: "You are a helpful assistant.",
    });

    /**
     * toUIMessageStreamResponse() converts the AI stream into a format
     * that the client's useChat() hook can understand.
     *
     * It returns a Response object with:
     * - Content-Type: text/plain; charset=utf-8
     * - A readable stream of data
     *
     * The stream format includes special markers like:
     * 0:"Hello"
     * 0:" world"
     * 0:"!"
     *
     * Each line is a "chunk" of the response.
     */
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
