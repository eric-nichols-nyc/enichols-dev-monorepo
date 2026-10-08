import { tool } from "@repo/ai";
import { z } from "zod";
import { getProjectsDisplayOutput } from "@/features/ai-chat/utils/get-projects-display-output";

export const showProjectsTool = tool({
  description: "Display portfolio projects",
  // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
  inputSchema: z.object({}) as any,
  execute: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return getProjectsDisplayOutput();
  },
});
