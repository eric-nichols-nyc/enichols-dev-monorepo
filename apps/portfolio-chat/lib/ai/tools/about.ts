import { tool } from "@repo/ai";
import { z } from "zod";
import { about } from "@/data/about";

const ABOUT_SOCIAL_LINKS = [
  { href: "https://github.com/eric-nichols-nyc", label: "GitHub" },
  { href: "https://instagram.com/ebn646/", label: "Instagram" },
  {
    href: "https://www.linkedin.com/in/eric-nichols-ab509118/",
    label: "LinkedIn",
  },
] as const;

const ABOUT_RELATED = [
  "Show me your projects",
  "What's your experience?",
  "What's your tech stack?",
] as const;

export const aboutCopy = about.paragraphs.join("\n\n");

/** Returns about section content for the UI */
export const showAboutTool = tool({
  description: "Display the about section",
  // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
  inputSchema: z.object({}) as any,
  execute: () => ({
    title: about.title,
    paragraphs: about.paragraphs,
    socialLinks: [...ABOUT_SOCIAL_LINKS],
    related: [...ABOUT_RELATED],
  }),
});
