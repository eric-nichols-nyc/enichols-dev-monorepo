export type ExperienceEntry = {
  duration: string;
  company: string;
  titles: string[];
  description: string;
  technologies: string[];
  links?: Array<{ name: string; url: string }>;
};

export const experience: ExperienceEntry[] = [
  {
    duration: "Jun 2025",
    company: "VoteMate",
    titles: ["Senior Front-end Developer"],
    description:
      "Led front-end development for an AI-powered civic engagement platform that matches users with local election candidates. Architected and built the core chatbot experience. Implemented Playwright end-to-end tests and GitHub Actions CI to validate critical user journeys.",
    technologies: ["React", "TypeScript", "Tailwind", "Playwright"],
  },
  {
    duration: "Sep 2022",
    company: "The Imagination",
    titles: ["Senior Full Stack Developer"],
    description:
      "Led front-end development for the Ford Auto Show registration website, achieving a 12% increase in client registrations. Built a Storybook component library with 20+ reusable components used by US and international teams. Implemented AWS infrastructure with S3, Lambda, and CloudFormation. Developed high-performance React and Angular SPAs.",
    technologies: [
      "React",
      "Angular",
      "Tailwind",
      "CSS",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "AWS Cloud",
      "Figma",
    ],
  },
  {
    duration: "Jun 2019",
    company: "IBM",
    titles: ["Senior Front-end / UI Developer"],
    description:
      "Lead architect on a back-office platform serving 5,000+ IBM content marketers. Built SPAs with React, TypeScript, and IBM Design System. Architected IBM Cloud solutions and guided a team of 4 developers. Collaborated with product and design to translate complex workflows into intuitive UIs.",
    technologies: [
      "React",
      "Next.js",
      "CSS3",
      "JavaScript",
      "TypeScript",
      "HTML5",
      "Node.js",
      "IBM Cloud",
    ],
  },
  {
    duration: "Jan 2014",
    company: "Havas Worldwide",
    titles: ["Senior Front-end Developer"],
    description:
      "Led front-end architecture for high-impact, high-visibility projects. Transformed Figma designs into reusable Storybook component libraries. Built ADA-compliant React SPAs with clean state patterns. Mentored junior developers through code reviews and pair programming.",
    technologies: [
      "React",
      "Angular",
      "Vue",
      ".NET",
      "jQuery",
      "CSS3",
      "JavaScript",
      "HTML5",
      "Node.js",
      "IBM Cloud",
    ],
  },
];

export default experience;
