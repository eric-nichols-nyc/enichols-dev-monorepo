// data/projects.ts
export type Project = {
  id: string;
  title: string;
  tags: string[];
  categories: string[];
  description: string;
  shortDescription: string;
  date: string;
  url: string;
  published: boolean;
  image: string;
  gallery: string[];
};

const projects: Project[] = [
  {
    id: "x2j9v7lm",
    title: "MoodFlix",
    tags: ["ai", "nextjs", "typescript"],
    categories: ["web"],
    description:
      "MoodFlix is your personal movie recommendation engine that suggests films based on your current mood. Whether you're feeling energetic, relaxed, or somewhere in between, we've got the perfect movie for you.",
    shortDescription: "Personal movie recommendation engine.",
    date: "2023-05-15",
    url: "https://moodflix-phi.vercel.app/",
    published: true,
    image: "/images/moodflix.png",
    gallery: [],
  },
  {
    id: "q4w8e1rt",
    title: "Audiograph",
    tags: ["nextjs", "analytics", "PostgreSQL", "typescript"],
    categories: ["health"],
    description:
      "Audiograph is a platform that allows you to upload your audio files and get a summary of the content. It uses AI to transcribe the audio and then summarizes the content.",
    shortDescription: "Summarize your audio files with AI.",
    date: "2023-06-10",
    url: "https://audiograph.vercel.app/",
    published: true,
    image: "/images/audiograph.png",
    gallery: [],
  },
  {
    id: "ai-taskmaster",
    title: "Ai Taskmaster",
    tags: ["ai", "microfrontend", "postgres", "typescript"],
    categories: ["ai"],
    description:
      "Ai Taskmaster is a platform that allows you to create and manage your tasks with AI. It uses AI to generate tasks and then allows you to manage them.",
    shortDescription: "Manage your tasks with AI.",
    date: "2023-07-22",
    url: "https://ai-taskmaster-host.vercel.app/",
    published: true,
    image: "/images/taskwizard.png",
    gallery: [],
  },
  {
    id: "trellnode",
    title: "Trellnode",
    tags: ["api", "fullstack", "NoSQL", "typescript"],
    categories: ["ai"],
    description:
      "Trellnode is a platform that allows you to create and manage your tasks. It uses AI to generate tasks and then allows you to manage them.",
    shortDescription:
      "Trellnode is a platform that allows you to create and manage your tasks.",
    date: "2023-04-01",
    url: "https://trellnode.vercel.app/",
    published: true,
    image: "/images/trellnode.png",
    gallery: [],
  },
  {
    id: "ai-recipe-generator",
    title: "AI Recipe Generator",
    tags: ["react", "ai", "mcp", "typescript"],
    categories: ["travel"],
    description:
      "AI Recipe Generator is a platform that allows you to generate recipes based on your preferences.",
    shortDescription: "Generate recipes based on your preferences.",
    date: "2023-08-05",
    url: "https://ai-recipe-generator-nine.vercel.app/",
    published: true,
    image: "/images/ai-recipe-generator.png",
    gallery: [],
  },
  {
    id: "ai-mockmaster",
    title: "AI Mockmaster",
    tags: ["ai", "nextjs", "fullstack"],
    categories: ["marketplace"],
    description:
      "Ai Mockmaster is a platform that allows you to practice mock interviews with AI-driven feedback.",
    shortDescription: "Practice mock interviews with AI-driven feedback.",
    date: "2023-09-12",
    url: "https://ai-mockmaster.vercel.app/",
    published: true,
    image: "/images/mockmaster.png",
    gallery: [],
  },
];

export default projects;
