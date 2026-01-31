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
    duration: "Jun 2025 - Present",
    company: "VoteMate",
    titles: ["Senior Front-end Developer"],
    description:
      "Led front-end development for an AI-powered civic engagement platform that matches users with local election candidates based on their values and policy preferences. Architected and built the core chatbot experience, enabling conversational value-based candidate matches. Implemented Playwright end-to-end tests to validate critical user journeys, including address input, candidate retrieval, and chatbot interactions. Integrated GitHub Actions to run automated tests on every pull request, ensuring stability of AI-driven flows and preventing regressions.",
    technologies: ["React", "TypeScript", "Tailwind", "Playwright"],
  },
  {
    duration: "Sep 2022 - Nov 2024",
    company: "The Imagination",
    titles: ["Senior Full Stack Developer"],
    description:
      "Led the front-end development for the successful restructuring of the Ford Auto Show registration website, resulting in a 12% increase in client registrations in 2023–2024. Built a comprehensive UI/UX component library in Storybook with over 20 reusable components adapted by the US and international teams. Implemented AWS cloud infrastructure using S3, Lambda, and CloudFormation for scalable deployment. Set up CI/CD pipelines to both streamline and significantly reduce deployment time. Developed high-performance single-page applications using React and Angular.",
    technologies: [
      "React",
      "Angular",
      "Tailwind",
      "CSS",
      "JavaScript",
      "TypeScript",
      "HTML5",
      "Node.js",
      "AWS Cloud",
      "Figma",
    ],
  },
  {
    duration: "Jun 2019 - Sep 2022",
    company: "IBM",
    titles: ["Senior Front-end / UI Developer"],
    description:
      "Lead architect on a back-office platform serving 5,000+ IBM content marketers—focused on scale and internal UX. Built SPAs using React, TypeScript, and IBM Design System, maintaining design consistency across applications. Architected IBM Cloud solutions, guiding a team of 4 developers in deploying secure infrastructure. Collaborated cross-functionally with product and design to translate complex workflows into intuitive UIs.",
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
    duration: "Jan 2014 - Jun 2019",
    company: "Havas Worldwide",
    titles: ["Senior Front-end Developer"],
    description:
      "Led front-end architecture for high-impact, high-visibility projects. Transformed Figma designs into reusable, documented component libraries using Storybook. Built ADA-compliant React SPAs with clean, maintainable state patterns and optimized rendering. Mentored junior developers through code reviews, pair programming, and knowledge sharing.",
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
