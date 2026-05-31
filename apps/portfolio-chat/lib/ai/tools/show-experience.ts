import { tool } from "@repo/ai";
import { z } from "zod";
import experience from "@/data/experience";

export const showExperienceTool = tool({
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
});
