/**
 * POST /api/chat
 *
 * Next.js Route Handler for the portfolio chat. Uses the Vercel AI SDK to:
 * - Stream model responses and tool results to the client
 * - Run tools (show_about, show_projects, experience, show_resume) when the model calls them
 * - Inject a custom follow-up copy after show_projects, streamed word-by-word
 *
 * Flow: client POSTs { messages } → we run streamText with tools → we pipe the
 * stream, injecting the projects copy after the tool result → client receives
 * a UI message stream (useChat-compatible).
 */
import type { UIMessage } from "@repo/ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
} from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import { z } from "zod";
import { about } from "@/data/about";
import experience from "@/data/experience";
import projects from "@/data/projects";
import { resume } from "@/data/resume";
import tech from "@/data/tech.json";

/** Split text into words and spaces so we can stream with preserved formatting */
const SPLIT_WORDS_AND_SPACES = /(\s+)/;

async function streamCopy(
  // UIMessageStreamWriter has a specific write signature; we pass valid chunks
  writer: {
    write: (part: { type: string; id: string; delta?: string }) => void;
  },
  textId: string,
  copy: string
) {
  writer.write({ type: "text-start", id: textId });
  const words = copy.split(SPLIT_WORDS_AND_SPACES);
  for (const word of words) {
    writer.write({ type: "text-delta", id: textId, delta: word });
    await new Promise((r) => setTimeout(r, 20));
  }
  writer.write({ type: "text-end", id: textId });
}

const tools = {
  /** Returns about section content for the UI */
  show_about: tool({
    description: "Display the about section",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: () => {
      console.log("[chat:tool] show_about called");
      return {
        ...about,
        related: [
          "Show me your projects",
          "What's your experience?",
          "View your resume",
        ],
      };
    },
  }),
  /** Returns project count and project data for the UI to render cards */
  show_projects: tool({
    description: "Display portfolio projects",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: async () => {
      console.log(
        "[chat:tool] show_projects called, delaying 1.5s so skeleton is visible"
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Copy/follow-up is injected in the stream after this tool—see execute below
      return {
        projectCount: projects.length,
        projects,
        related: [
          "Tell me about a specific project",
          "What technologies do you use?",
          "Show me your experience",
        ],
      };
    },
  }),
  /** Returns work experience entries for the UI */
  show_experience: tool({
    description: "Display Eric Nichols work experience and career history",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: () => {
      console.log("[chat:tool] experience called");
      return {
        experience,
        // Context-specific suggestions for experience
        related: [
          "Show me some projects",
          "Tell me about Eric",
          "What's Eric's tech stack?",
        ],
      };
    },
  }),
  /** Returns tech stack from tech.json—streamed as text */
  show_tech_stack: tool({
    description:
      "List Eric's technologies and tech stack (React, Next.js, TypeScript, etc.)",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: () => {
      console.log("[chat:tool] show_tech_stack called");
      const techData = tech as Record<
        string,
        Array<{ name: string; icon?: string; level?: string; years?: string }>
      >;
      const technologies = Object.values(techData)
        .flat()
        .map((t) => t.name)
        .sort();
      return {
        technologies,
        tech: techData,
        related: [
          "Show me some projects",
          "What's his experience?",
          "Tell me about Eric",
        ],
      };
    },
  }),
  /** Returns resume/experience data for the UI */
  show_resume: tool({
    description: "Display Eric Nichols resume and experience",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: () => {
      console.log("[chat:tool] show_resume called");
      return {
        ...resume,
        related: [
          "Show me some projects",
          "Tell me about Eric",
          "What's your experience?",
        ],
      };
    },
  }),
};

export async function POST(request: Request) {
  try {
    console.log("[chat:api] POST /api/chat received");
    const body = (await request.json()) as { messages?: UIMessage[] };
    /** UIMessage[] from useChat: [{ role, parts: [{ type, text } | { type, ... }] }] */
    const { messages } = body;

    if (!messages?.length) {
      console.log("[chat:api] rejected: no messages");
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastUser = messages.filter((m) => m.role === "user").at(-1);
    const lastText =
      lastUser?.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join(" ") ?? "(none)";
    console.log(
      "[chat:api] messages count:",
      messages.length,
      "| last user:",
      lastText
    );

    const modelMessages = convertToModelMessages(messages);
    console.log(
      "[chat:api] converted to model messages, count:",
      modelMessages.length
    );

    const sampleTitles = projects
      .slice(0, 3)
      .map((p) => p.title)
      .join(", ");
    const projectsFollowUp = `From ${sampleTitles}—here are some projects spanning AI, full-stack apps, and more. Pick one and I'll dive in! Each one has a live demo you can explore. Ask me about tech stack, challenges, or anything else you're curious about.`;

    const techStackFollowUp =
      "Here's the tech stack. Want to hear about a specific technology or project?";

    /**
     * createUIMessageStream gives us control over the stream so we can:
     * 1. Run streamText (model + tools)
     * 2. Forward each chunk to the client
     * 3. When we see show_projects tool output, inject our copy as streamed text
     */
    const stream = createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        const result = streamText({
          // biome-ignore lint/suspicious/noExplicitAny: ToolSet/Zod mismatch between app deps and @repo/ai
          tools: tools as any,
          model: models.chat,
          stopWhen: stepCountIs(1), // stop after 1 step (tool call + result); we inject copy ourselves
          system: `You are Eric Nichols' portfolio assistant. Only answer questions about Eric, his portfolio, projects, work experience, tech stack, and resume.

If the user asks about unrelated topics (other people, politics, general knowledge, advice, coding help, etc.), politely decline and say something like: "I'm here to help you learn about Eric and his work. Try asking about his projects, experience, or background."

When the user asks about Eric or asks to see his about section, use the show_about tool.
When the user asks to see projects, use the show_projects tool.
When the user asks about work experience, jobs, or career history, use the show_experience tool.
When the user asks about tech stack, technologies, or skills, use the show_tech_stack tool. Do NOT use show_resume or show_about for tech stack questions.
When the user asks about resume details, use the show_resume tool.
Answer portfolio-related questions conversationally.`,
          messages: modelMessages,
        });

        const uiStream = result.toUIMessageStream();
        const textIdProjects = "projects-follow-up";
        const textIdTechStack = "tech-stack-follow-up";

        for await (const chunk of uiStream) {
          writer.write(chunk);

          // When show_projects completes, inject our copy as streamed text.
          // We detect it by tool-output-available + output.projects.
          const c = chunk as {
            type?: string;
            toolName?: string;
            output?: unknown;
          };
          if (
            c.type === "tool-output-available" &&
            c.output &&
            typeof c.output === "object"
          ) {
            if ("projects" in c.output) {
              await streamCopy(
                writer as {
                  write: (p: {
                    type: string;
                    id: string;
                    delta?: string;
                  }) => void;
                },
                textIdProjects,
                projectsFollowUp
              );
            } else if ("technologies" in c.output) {
              await streamCopy(
                writer as {
                  write: (p: {
                    type: string;
                    id: string;
                    delta?: string;
                  }) => void;
                },
                textIdTechStack,
                techStackFollowUp
              );
            }
          }
        }
      },
    });

    console.log("[chat:api] returning UI stream response");
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
