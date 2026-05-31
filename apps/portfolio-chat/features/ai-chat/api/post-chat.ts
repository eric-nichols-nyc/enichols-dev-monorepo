/**
 * POST /api/chat handler — stream model + portfolio tools.
 * Mounted from app/api/chat/route.ts.
 */
import type { UIMessage } from "@repo/ai";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "@repo/ai";
import { about } from "@/data/about";
import { runChatStream } from "@/features/ai-chat/api/run-chat-stream";
import { streamCopy } from "@/features/ai-chat/lib/stream-copy";
import { toSimpleModelMessages } from "@/features/ai-chat/lib/to-simple-model-messages";
import { extractLatestUserText } from "@/features/ai-chat/utils/extract-latest-user-text";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import { loadKnowledgeContext } from "@/features/ai-chat/utils/load-knowledge-context";
import { shouldUseAboutStreamLegacy } from "@/features/ai-chat/utils/should-use-about-stream-legacy";

const isMockStreamEnabled = process.env.CHAT_MOCK_STREAM === "true";

function isKnowledgeAssistantEnabled(): boolean {
  return process.env.KNOWLEDGE_ASSISTANT_ENABLED !== "false";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: UIMessage[] };
    const { messages } = body;

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const modelMessages = toSimpleModelMessages(messages);

    if (isMockStreamEnabled) {
      const stream = createUIMessageStream({
        originalMessages: messages,
        execute: async ({ writer }) => {
          const mockTextId = "mock-stream-response";
          const mockCopy = about.paragraphs.join("\n\n");

          await new Promise((resolve) => setTimeout(resolve, 3000));
          await streamCopy(
            writer as {
              write: (part: {
                type: string;
                id: string;
                delta?: string;
              }) => void;
            },
            mockTextId,
            mockCopy
          );
        },
      });

      return createUIMessageStreamResponse({ stream });
    }

    const userText = extractLatestUserText(messages) ?? "";
    const routing = routeIntent(userText);
    const knowledgeContext = await loadKnowledgeContext(routing);
    const useLegacyAboutStream =
      isKnowledgeAssistantEnabled() &&
      shouldUseAboutStreamLegacy(routing, userText);

    console.log("[chat:api] route", {
      intent: routing.intent,
      projectSlug: routing.entities.projectSlug,
      responseType: routing.responseType,
    });

    const stream = createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        if (!isKnowledgeAssistantEnabled()) {
          await runChatStream({
            writer: writer as {
              write: (part: {
                type: string;
                id?: string;
                delta?: string;
                data?: unknown;
              }) => void;
            },
            modelMessages,
            routing,
            knowledgeContext,
            useLegacyAboutStream: true,
            dynamicSuggestionsEnabled: false,
          });
          return;
        }

        await runChatStream({
          writer: writer as {
            write: (part: {
              type: string;
              id?: string;
              delta?: string;
              data?: unknown;
            }) => void;
          },
          modelMessages,
          routing,
          knowledgeContext,
          useLegacyAboutStream,
          dynamicSuggestionsEnabled: true,
        });
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("[chat:api] error:", error);
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
