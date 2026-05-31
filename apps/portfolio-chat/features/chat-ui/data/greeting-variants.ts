export type GreetingVariant = {
  body: string;
  heading: string;
};

export const GREETING_VARIANTS: GreetingVariant[] = [
  {
    heading: "You're in the right place",
    body: "I built this chat so you can skip the résumé skim—ask about my projects, how I work, or what I've shipped lately.",
  },
  {
    heading: "Hello there!",
    body: "I'm Eric, a frontend engineer in NYC. Lately I'm deep in React, accessibility, and AI product work—including this portfolio. Pick a topic or ask your own question.",
  },
  {
    heading: "Hi—I'm Eric",
    body: "Senior frontend engineer in New York. I lead UI for an AI civic platform by day and obsess over design systems and LLM integrations by trade. Projects, stack, experience—your call.",
  },
  {
    heading: "Ask me anything",
    body: "Eric Nichols — frontend engineer, NYC. React, a11y, AI interfaces. The sidebar and pills are shortcuts; plain English works too.",
  },
  {
    heading: "Welcome",
    body: "I'm Eric. I build thoughtful React apps and AI-driven interfaces from New York City. Curious about a project, a role, or my stack? Just ask.",
  },
  {
    heading: "This isn't a PDF résumé",
    body: "I'm Eric—a senior frontend engineer who'd rather show you the work in conversation. Try projects, experience, or tech—or throw me something specific.",
  },
  {
    heading: "Hello there!",
    body: "Eric here. I ship accessible React UIs and bake AI into products people actually use. You're chatting with the interactive version of my portfolio—where should we start?",
  },
];

export function pickRandomGreetingVariant(
  variants: GreetingVariant[] = GREETING_VARIANTS
): GreetingVariant {
  return variants[Math.floor(Math.random() * variants.length)] ?? variants[0]!;
}
