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
    duration: "2024 - Present",
    company: "Klaviyo",
    titles: ["Software Engineer"],
    description:
      "Build and maintain critical components used to construct Klaviyo's frontend, across the whole product. Work closely with cross-functional teams, including developers, designers, and product managers, to implement and advocate for best practices in web accessibility.",
    technologies: ["JavaScript", "TypeScript", "React", "Storybook"],
  },
  {
    duration: "2018 - 2024",
    company: "Upstatement",
    titles: ["Lead Engineer", "Senior Engineer", "Engineer"],
    description:
      "Build, style, and ship high-quality websites, design systems, mobile apps, and digital experiences for a diverse array of projects for clients including Harvard Business School, Everytown for Gun Safety, Pratt Institute, Koala Health, Vanderbilt University, The 19th News, and more. Provide leadership within engineering department through close collaboration, knowledge shares, and spearheading the development of internal tools.",
    technologies: [
      "JavaScript",
      "TypeScript",
      "HTML & SCSS",
      "React",
      "Next.js",
      "React Native",
      "WordPress",
      "Contentful",
      "Node.js",
      "PHP",
    ],
  },
  {
    duration: "July - Dec 2017",
    company: "Apple",
    titles: ["UI Engineer Co-op"],
    description:
      "Developed and styled interactive web apps for Apple Music, including the user interface of Apple Music's embeddable web player widget for in-browser user authorization and full song playback.",
    technologies: ["Ember", "SCSS", "JavaScript", "MusicKit.js"],
    links: [
      {
        name: "MusicKit.js",
        url: "https://developer.apple.com/documentation/applemusicjs",
      },
      { name: "9to5Mac", url: "https://9to5mac.com" },
      { name: "The Verge", url: "https://theverge.com" },
    ],
  },
  {
    duration: "2016 - 2017",
    company: "Scout Studio",
    titles: ["Developer"],
    description:
      "Collaborated with other student designers and engineers on pro-bono projects to create new brands, design systems, and websites for organizations in the community.",
    technologies: ["Jekyll", "SCSS", "JavaScript", "WordPress"],
  },
];

export default experience;
