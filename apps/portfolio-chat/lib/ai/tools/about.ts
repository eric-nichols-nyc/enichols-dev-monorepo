import { tool } from "@repo/ai";
import { z } from "zod";
import { about } from "@/data/about";
import { selectAboutIntro } from "@/features/ai-chat/utils/select-about-intro";

const ABOUT_SOCIAL_LINKS = [
  { href: "https://github.com/eric-nichols-nyc", label: "GitHub" },
  { href: "https://instagram.com/ebn646/", label: "Instagram" },
  {
    href: "https://www.linkedin.com/in/eric-nichols-ab509118/",
    label: "LinkedIn",
  },
] as const;

export const aboutRelated = [
  "Show me your projects",
  "What's your experience?",
  "What's your tech stack?",
] as const;

/** Default stream body when no user message is available (e.g. imports). */
export const aboutCopy = selectAboutIntro("Tell me about yourself").copy;

export function getAboutContentForMessage(message: string) {
  const { paragraphs, copy } = selectAboutIntro(message);
  return {
    title: about.title,
    paragraphs,
    copy,
    socialLinks: [...ABOUT_SOCIAL_LINKS],
    related: [...aboutRelated],
  };
}

/** Returns about section content for the UI */
export const showAboutTool = tool({
  description: "Display the about section",
  // biome-ignore lint/suspicious/noExplicitAny: Zod version mismatch with @repo/ai
  inputSchema: z.object({}) as any,
  execute: () => {
    const content = getAboutContentForMessage("Tell me about yourself");
    return {
      title: content.title,
      paragraphs: content.paragraphs,
      socialLinks: content.socialLinks,
      related: content.related,
    };
  },
});
