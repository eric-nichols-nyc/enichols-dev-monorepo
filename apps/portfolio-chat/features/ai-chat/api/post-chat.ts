/**
 * POST /api/chat handler — stream model + portfolio tools.
 * Mounted from app/api/chat/route.ts.
 */
import type { UIMessage } from "@repo/ai";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import { about } from "@/data/about";
import projects from "@/data/projects";
import {
  createAboutStreamModeState,
  getAboutStreamModeDecision,
} from "@/features/ai-chat/lib/about-stream-mode";
import { streamCopy } from "@/features/ai-chat/lib/stream-copy";
import { toSimpleModelMessages } from "@/features/ai-chat/lib/to-simple-model-messages";
import { getPortfolioAssistantSystemPrompt } from "@/lib/ai/prompts/portfolio-assistant";
import { aboutCopy, aboutRelated } from "@/lib/ai/tools/about";
import { portfolioChatTools } from "@/lib/ai/tools/portfolio-tools";

const isMockStreamEnabled = process.env.CHAT_MOCK_STREAM === "true";

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

    const sampleTitles = projects
      .slice(0, 3)
      .map((p) => p.title)
      .join(", ");
    const projectsFollowUp = `From ${sampleTitles}—here are projects spanning AI and full-stack apps. Each has a live demo you can explore. Pick one and I'll dive in. Ask about tech stack, challenges, or anything else.`;

    const techStackFollowUp =
      "Here's the tech stack. Want to hear about a specific technology? Or how I've used it in a project?";

    const stream = createUIMessageStream({
      originalMessages: messages,
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: stream routing over tool chunks
      execute: async ({ writer }) => {
        const result = streamText({
          // biome-ignore lint/suspicious/noExplicitAny: ToolSet/Zod mismatch between app deps and @repo/ai
          tools: portfolioChatTools as any,
          // biome-ignore lint/suspicious/noExplicitAny: Provider model versions differ across SDK packages in this monorepo
          model: models.chat as any,
          stopWhen: stepCountIs(1),
          system: getPortfolioAssistantSystemPrompt(),
          messages: modelMessages,
        });

        const uiStream = result.toUIMessageStream();
        const textIdAbout = "about-follow-up";
        const textIdProjects = "projects-follow-up";
        const textIdTechStack = "tech-stack-follow-up";
        const aboutStreamModeState = createAboutStreamModeState();

        const writeChunk = writer as {
          write: (p: {
            type: string;
            id?: string;
            delta?: string;
            data?: unknown;
          }) => void;
        };

        for await (const chunk of uiStream) {
          const c = chunk as {
            type?: string;
            toolName?: string;
            toolCallId?: string;
            output?: unknown;
          };

          const aboutDecision = getAboutStreamModeDecision({
            aboutRenderMode: "text",
            chunk: c,
            state: aboutStreamModeState,
          });

          if (aboutDecision.shouldStreamAboutText) {
            await streamCopy(writeChunk, textIdAbout, aboutCopy);
            writeChunk.write({
              type: "data-related",
              id: "about-related",
              data: { suggestions: [...aboutRelated] },
            });
          }

          if (aboutDecision.suppressChunk) {
            continue;
          }

          writer.write(chunk);

          if (
            c.type === "tool-output-available" &&
            c.output &&
            typeof c.output === "object"
          ) {
            if ("projects" in c.output) {
              await streamCopy(writeChunk, textIdProjects, projectsFollowUp);
            } else if ("technologies" in c.output) {
              await streamCopy(writeChunk, textIdTechStack, techStackFollowUp);
            }
          }
        }
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
