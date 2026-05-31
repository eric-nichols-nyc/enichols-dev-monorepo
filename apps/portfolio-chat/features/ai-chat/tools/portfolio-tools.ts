import { tool } from "@repo/ai";
import { z } from "zod";
import experience from "@/data/experience";
import projects from "@/data/projects";
import tech from "@/data/tech.json";
import { showAboutTool } from "@/features/ai-chat/tools/about";

/** Portfolio chat tools registered with streamText */
export const portfolioChatTools = {
  show_about: showAboutTool,
  show_projects: tool({
    description: "Display portfolio projects",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
  show_experience: tool({
    description:
      "Display work experience. Use when user asks about experience, jobs, career, or roles.",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: async () => {
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
  show_tech_stack: tool({
    description: "List technologies and tech stack",
    // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
    inputSchema: z.object({}) as any,
    execute: () => {
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
