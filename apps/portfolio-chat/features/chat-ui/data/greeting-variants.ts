export type GreetingVariant = {
  accent?: string;
  body: string;
  heading: string;
};

export const GREETING_VARIANTS: GreetingVariant[] = [
  {
    heading: "Nice to meet you.",
    accent: "What are you curious about?",
    body: "I’m Eric, a frontend engineer in New York. I build thoughtful interfaces and AI experiences. Pick a thread below and we’ll see where it goes.",
  },
  {
    heading: "Hey, I’m Eric.",
    accent: "Let’s talk shop.",
    body: "Interfaces, reusable systems, AI, and the decisions that hold it all together. Ask me what I’ve built or what I learned along the way.",
  },
  {
    heading: "Pull up a chair.",
    accent: "There’s a story behind the work.",
    body: "I’m a frontend engineer in New York with a soft spot for thoughtful UI. Start with a project, peek at my toolkit, or ask how I got here.",
  },
  {
    heading: "Good to see you.",
    accent: "Where should we start?",
    body: "The projects? The process? The person? I’m Eric, and this is a little window into how I build for the web. Bring a question. I’ll bring the context.",
  },
];

export function pickRandomGreetingVariant(
  variants: GreetingVariant[] = GREETING_VARIANTS
): GreetingVariant {
  return variants[Math.floor(Math.random() * variants.length)] ?? variants[0]!;
}
