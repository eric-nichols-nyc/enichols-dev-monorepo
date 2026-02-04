/**
 * POST /api/chat
 *
 * Next.js Route Handler for the portfolio chat. Uses the Vercel AI SDK to:
 * - Stream model responses and tool results to the client
 * - Run tools (show_about, show_projects, show_experience, show_tech_stack) when the model calls them
 * - Inject custom follow-up copy after show_projects, show_experience, and show_tech_stack
 *
 * Flow: client POSTs { messages } → we run streamText with tools → we pipe the
 * stream, injecting copy after tool results → client receives a UI message stream (useChat-compatible).
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
    execute: async () => {
      console.log(
        "[chat:tool] show_about called, delaying 1s so loader is visible"
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const primaryRole = resume.experience[0];
      const secondaryRole = resume.experience[1];
      const skillHighlights = resume.skills.slice(0, 3).join(" · ");
      const roleHighlights = [
        primaryRole
          ? `${primaryRole.title} at ${primaryRole.company} (${primaryRole.dates})`
          : null,
        secondaryRole
          ? `${secondaryRole.title} at ${secondaryRole.company} (${secondaryRole.dates})`
          : null,
      ].filter(Boolean);

      return {
        title: "About",
        paragraphs: [
          `I’m ${resume.name}, a ${resume.title} based in ${resume.location}.`,
          resume.summary,
          `Core strengths include ${skillHighlights}.`,
          roleHighlights.length
            ? `Recent roles include ${roleHighlights.join(" and ")}.`
            : "Recent experience spans senior front-end and full-stack roles.",
        ],
        socialLinks: [
          { href: "https://github.com/eric-nichols-nyc", label: "GitHub" },
          { href: "https://instagram.com/ebn646/", label: "Instagram" },
          {
            href: "https://www.linkedin.com/in/eric-nichols-ab509118/",
            label: "LinkedIn",
          },
        ],
        related: [
          "Show me your projects",
          "What's your experience?",
          "What's your tech stack?",
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
    description:
      "Display work experience. Use when user asks about experience, jobs, career, or roles.",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: async () => {
      console.log(
        "[chat:tool] show_experience called, delaying 1.5s so skeleton is visible"
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        copy: "Here's my work experience. Click the expand button on any card to see the full timeline. Feel free to ask about a specific role or company.",
        experience,
        related: [
          "Show me some projects",
          "Tell me about yourself",
          "What's your tech stack?",
        ],
      };
    },
  }),
  /** Returns tech stack from tech.json—streamed as text */
  show_tech_stack: tool({
    description: "List technologies and tech stack",
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
          "What's your experience?",
          "Tell me about yourself",
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
    const projectsFollowUp = `From ${sampleTitles}—here are projects spanning AI and full-stack apps. Each has a live demo you can explore. Pick one and I'll dive in. Ask about tech stack, challenges, or anything else.`;

    const techStackFollowUp =
      "Here's the tech stack. Want to hear about a specific technology? Or how I've used it in a project?";

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
          system: `You are Eric Nichols' portfolio assistant. Only answer questions about Eric, his portfolio, projects, work experience, and tech stack.

If the user asks about unrelated topics (other people, politics, general knowledge, advice, coding help, etc.), politely decline and say something like: "I'm here to help you learn about Eric and his work. Try asking about his projects, experience, or background."

When the user asks about Eric or asks to see his about section: First write 1-2 brief conversational sentences (e.g. "Sure, here's a bit about me!"), then call the show_about tool.
When the user asks to see projects: use the show_projects tool.
When the user asks about work experience, jobs, career history, roles, or phrases like "show your work experience" / "show experience" / "your experience" (including typos like "strems"): First write 1-2 brief conversational sentences (e.g. "Here's my work experience!"), then call the show_experience tool.
When the user asks about tech stack, technologies, or skills: use the show_tech_stack tool.
Answer portfolio-related questions conversationally.`,
          messages: modelMessages,
        });

        const uiStream = result.toUIMessageStream();
        const textIdProjects = "projects-follow-up";
        const textIdTechStack = "tech-stack-follow-up";

        const writeChunk = writer as {
          write: (p: { type: string; id?: string; delta?: string }) => void;
        };

        for await (const chunk of uiStream) {
          const c = chunk as {
            type?: string;
            toolName?: string;
            output?: unknown;
          };

          writer.write(chunk);

          // When a tool completes, inject follow-up copy for projects and tech.
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
