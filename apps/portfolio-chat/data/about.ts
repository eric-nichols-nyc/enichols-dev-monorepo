import { resume } from "./resume";

const voteMate = resume.experience[0];

export type AboutIntroVariant = "default" | "hello" | "identity" | "background";

const currentRole = voteMate
  ? `Right now I'm leading front-end at ${voteMate.company}, where we're building an AI-powered civic engagement product that helps voters find candidates who match their values.`
  : "I'm focused on React, TypeScript, and AI product work.";

const strengths =
  "I care about React, TypeScript, design systems, and shipping AI experiences that feel natural in the UI.";

const exploreCta =
  "Ask me about my projects, tech stack, or experience—happy to go deeper.";

/** Rule-based intro variants — facts from `resume.ts`, voice here. */
export const aboutIntroVariants: Record<AboutIntroVariant, string[]> = {
  default: [
    `👋 I'm ${resume.name}, a ${resume.title} in ${resume.location}. ${currentRole} ${strengths} ${exploreCta}`,
  ],
  hello: [
    `👋 Hey—I'm ${resume.name.split(" ")[0]}, a senior front-end developer based in ${resume.location}. ${currentRole} ${exploreCta}`,
  ],
  identity: [
    `I'm ${resume.name}—a ${resume.title} in ${resume.location} focused on React, TypeScript, and AI product work. Today I'm at ${voteMate?.company ?? "a product team"} on an AI civic engagement platform. I can walk you through my projects, how I work, or my experience if you'd like.`,
  ],
  background: [
    `I'm ${resume.name}, a senior front-end developer with experience across agency, enterprise, and startup teams. I'm strongest in React ecosystems, design systems, and AI-first UX—${voteMate ? `now at ${voteMate.company}` : "currently in product engineering"}. For the full timeline, ask about my experience or projects.`,
  ],
};

/**
 * Default paragraphs for `show_about` when no visitor message is available.
 * Authoritative chat intro copy; career depth lives in experience tool + knowledge files.
 */
export const about = {
  title: "About",
  paragraphs: aboutIntroVariants.default,
};
