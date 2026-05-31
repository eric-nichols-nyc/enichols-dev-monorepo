import { tool } from "@repo/ai";
import { z } from "zod";
import projects from "@/data/projects";

export const showProjectsTool = tool({
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
});
