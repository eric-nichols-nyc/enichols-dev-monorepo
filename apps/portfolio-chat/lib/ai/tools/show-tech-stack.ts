import { tool } from "@repo/ai";
import { z } from "zod";
import tech from "@/data/tech.json";

export const showTechStackTool = tool({
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
});
