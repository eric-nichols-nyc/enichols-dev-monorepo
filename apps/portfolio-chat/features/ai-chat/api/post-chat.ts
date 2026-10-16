/**
 * POST /api/chat handler — stream model + portfolio tools.
 * Mounted from app/api/chat/route.ts.
 */
import type { UIMessage } from "@repo/ai";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "@repo/ai";
import { runChatStream } from "@/features/ai-chat/api/run-chat-stream";
import { selectAboutIntro } from "@/features/ai-chat/utils/select-about-intro";
import { streamCopy } from "@/features/ai-chat/lib/stream-copy";
import { toSimpleModelMessages } from "@/features/ai-chat/lib/to-simple-model-messages";
import { extractLatestUserText } from "@/features/ai-chat/utils/extract-latest-user-text";
import { routeIntent } from "@/features/ai-chat/utils/intent-router";
import { loadKnowledgeContext } from "@/features/ai-chat/utils/load-knowledge-context";
import { shouldUseAboutStreamLegacy } from "@/features/ai-chat/utils/should-use-about-stream-legacy";
import { getPublishedProject, parseProjectMessages, projectRouting, withProjectFacts } from "@/features/project-details/lib/project-context";

const isMockStreamEnabled = process.env.CHAT_MOCK_STREAM === "true";

function isKnowledgeAssistantEnabled(): boolean {
  return process.env.KNOWLEDGE_ASSISTANT_ENABLED !== "false";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: UIMessage[]; projectId?: unknown };
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Invalid chat request" }, { status: 400 });
    }
    const projectMode = Object.hasOwn(body, "projectId");
    const project = projectMode ? getPublishedProject(body.projectId) : undefined;
    if (projectMode && !project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    const messages = project ? parseProjectMessages(body.messages) : body.messages;

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
          const mockCopy = project?.description ?? selectAboutIntro("Tell me about yourself").copy;

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
    const routing = project ? projectRouting(project, userText) : routeIntent(userText);
    const loadedContext = await loadKnowledgeContext(routing);
    const knowledgeContext = project ? withProjectFacts(loadedContext, project) : loadedContext;
    const useLegacyAboutStream =
      !project && isKnowledgeAssistantEnabled() && shouldUseAboutStreamLegacy(routing);

    console.log("[chat:api] route", {
      intent: routing.intent,
      projectSlug: routing.entities.projectSlug,
      responseType: routing.responseType,
    });

    const stream = createUIMessageStream({
      originalMessages: messages,
      onError: (error) => {
        console.error("[chat:api] stream error:", error);
        return "The chat assistant is temporarily unavailable. Please try again later.";
      },
      execute: async ({ writer }) => {
        if (!project && !isKnowledgeAssistantEnabled()) {
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
            userText,
            useLegacyAboutStream: true,
            dynamicSuggestionsEnabled: false,
            abortSignal: request.signal,
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
          userText,
          useLegacyAboutStream,
          dynamicSuggestionsEnabled: true,
          aiFollowUpsEnabled: isKnowledgeAssistantEnabled() && process.env.AI_FOLLOW_UP_QUESTIONS_ENABLED === "true",
          messages,
          project,
          abortSignal: request.signal,
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
