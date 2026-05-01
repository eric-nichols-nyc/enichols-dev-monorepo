import { resume } from "./resume";

const [voteMate, imagination, ibm, havas] = resume.experience;

/**
 * About narrative derived from `resume.ts`, first-person and conversational.
 * Update resume for facts; adjust prose here when your story changes.
 */
export const about = {
  title: "About",
  paragraphs: [
    `👋 I'm ${resume.name}, a ${resume.title} based in ${resume.location}. ${resume.summary}`,
    voteMate
      ? `These days I'm at ${voteMate.company}, where I lead front-end for an AI-powered civic engagement platform 🗳️—we match voters with local candidates based on their values and policy preferences. I've architected the core chatbot experience, added Playwright tests for the critical journeys, and wired GitHub Actions so those AI-driven flows stay stable as we ship.`
      : "",
    [
      imagination
        ? `Before that I was at ${imagination.company}, where I led front-end for a Ford Auto Show registration platform—we restructured the experience and saw a measurable lift in registrations—and I built a Storybook component library with over 20 components that teams in the US and internationally adopted.`
        : "",
      ibm
        ? `At ${ibm.company} I was lead architect on a back-office platform used by thousands of content marketers, shipping React and TypeScript with the IBM Design System and IBM Cloud, and partnering closely with product and design.`
        : "",
      havas
        ? `Earlier at ${havas.company} I delivered high-visibility client work with accessible React SPAs, documented component patterns in Storybook, and spent real time mentoring junior developers.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    `Across those roles I've leaned on React ecosystems, design systems, cloud integration, and CI/CD—and more recently, AI-first product work and LLM integrations. 💬 Ask me about projects, stack, or how I like to build—I'm happy to go deeper.`,
  ].filter((p) => p.length > 0),
};
