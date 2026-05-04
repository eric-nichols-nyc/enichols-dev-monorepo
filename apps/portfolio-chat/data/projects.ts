// data/projects.ts – unified project data for cards and artifact

export type ProjectMetric = {
  label: string;
  value: string;
};

export type Project = {
  id: string;
  position: number;
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
  // Rich content for Artifact (optional – shown when available)
  subtitle?: string;
  problem?: string;
  solution?: string;
  tech?: string[];
  features?: string[];
  metrics?: ProjectMetric[];
  githubUrl?: string;
  badges?: string[];
  highlights?: string[];
};

const projectsUnsorted: Project[] = [
  {
    id: "audiograph",
    position: 3,
    title: "AudioGraph",
    tags: ["nextjs", "analytics", "PostgreSQL", "typescript"],
    categories: ["health"],
    description:
      "Dual-app system tracking music artists across Spotify and YouTube with automated data collection. Built admin and client dashboards for comparative analytics. Cron jobs collect daily metrics and store them in Supabase. Real-time artist comparison and historical trend visualization.",
    shortDescription:
      "Artist analytics platform with automated data collection.",
    date: "2023-06-10",
    url: "https://audiograph.vercel.app/",
    published: true,
    image: "/images/audiograph.png",
    gallery: [],
    subtitle: "Artist Analytics Platform",
    problem:
      "Music industry professionals needed real-time analytics to track artist performance across multiple platforms without manual data collection.",
    solution:
      "Built automated system collecting daily metrics from Spotify and YouTube APIs, storing in Supabase, with admin/client dashboard architecture.",
    tech: [
      "React 18",
      "Next.js 14",
      "Node.js",
      "Supabase",
      "Spotify API",
      "YouTube API",
      "Cron Jobs",
      "TypeScript",
    ],
    features: [
      "Automated daily data collection via cron jobs",
      "Real-time artist comparison dashboard",
      "Admin panel for artist management",
      "Client portal for viewing analytics",
      "Historical trend analysis",
      "Performance metrics visualization",
    ],
    metrics: [
      { label: "Artists Tracked", value: "50+" },
      { label: "Data Points Monthly", value: "10K+" },
      { label: "API Calls Daily", value: "200+" },
      { label: "Response Time", value: "<2s" },
    ],
    githubUrl: "https://github.com/eric-nichols-nyc/audiograph",
    badges: ["Full Stack", "API Integration", "Real-time Data"],
    highlights: [
      "Architected scalable data collection system",
      "Implemented secure multi-tenant architecture",
      "Built responsive admin and client interfaces",
    ],
  },
  {
    id: "ai-taskwizard",
    position: 4,
    title: "AI-TaskWizard",
    tags: ["ai", "microfrontend", "postgres", "typescript"],
    categories: ["ai"],
    description:
      "Enterprise microfrontend architecture with six integrated applications sharing UI, auth, and design system packages. Includes dashboard, calendar, and Kanban board. Webpack Module Federation enables independent deployment. Shared component library and unified authentication across apps.",
    shortDescription:
      "Microfrontend productivity suite with shared design system.",
    date: "2023-07-22",
    url: "https://ai-taskwizard-host.vercel.app/",
    published: true,
    image: "/images/taskwizard.png",
    gallery: [],
    subtitle: "Microfrontend Productivity Suite",
    problem:
      "Need for scalable, maintainable productivity suite with shared components and independent deployment capabilities.",
    solution:
      "Implemented microfrontend architecture with shared design system, unified authentication, and modular application structure.",
    tech: [
      "React 18",
      "TypeScript",
      "Monorepo",
      "Lerna",
      "Webpack Module Federation",
      "Shared UI Library",
      "Auth System",
    ],
    features: [
      "Dashboard with unified workspace",
      "Calendar application with scheduling",
      "Kanban board for task management",
      "Shared authentication across apps",
      "Centralized design system",
      "Independent app deployment",
    ],
    metrics: [
      { label: "Applications", value: "6" },
      { label: "Shared Components", value: "40+" },
      { label: "Code Reuse", value: "85%" },
      { label: "Bundle Size", value: "Optimized" },
    ],
    githubUrl: "https://github.com/eric-nichols-nyc/ai-taskmaster",
    badges: ["Microfrontend", "Monorepo", "Enterprise Architecture"],
    highlights: [
      "Designed scalable microfrontend architecture",
      "Created comprehensive shared design system",
      "Implemented unified authentication strategy",
    ],
  },
  {
    id: "trellnode",
    position: 1,
    title: "Trellix",
    tags: ["api", "fullstack", "NoSQL", "typescript"],
    categories: ["ai"],
    description:
      "Full-stack Kanban board for task and project management. Drag-and-drop boards with real-time updates. Node.js API with MongoDB for flexible NoSQL storage. RESTful API architecture with responsive React frontend.",
    shortDescription: "Kanban board with drag-and-drop UX.",
    date: "2023-04-01",
    url: "https://trellix-one.vercel.app/",
    published: true,
    image: "/images/trellix.png",
    gallery: [],
    subtitle: "Kanban Board Application",
    problem:
      "Teams needed a lightweight, self-hosted alternative to traditional project management tools with fast performance and flexible data modeling.",
    solution:
      "Built a Node.js API with MongoDB for flexible document storage, React frontend with drag-and-drop boards, and RESTful API architecture.",
    tech: [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "TypeScript",
      "REST API",
      "Drag-and-Drop",
    ],
    features: [
      "Drag-and-drop Kanban boards",
      "Create and organize boards, lists, and cards",
      "RESTful API for extensibility",
      "Real-time task management",
      "Flexible NoSQL data modeling",
      "Responsive design",
    ],
    metrics: [
      { label: "Boards", value: "Unlimited" },
      { label: "API Endpoints", value: "RESTful" },
      { label: "Data Store", value: "MongoDB" },
      { label: "Stack", value: "Full Stack" },
    ],
    githubUrl: "https://github.com/eric-nichols-nyc/trellix",
    badges: ["Full Stack", "NoSQL", "API"],
    highlights: [
      "Architected RESTful API with MongoDB",
      "Implemented drag-and-drop board UX",
      "Built responsive task management interface",
    ],
  },
  {
    id: "github-codebase-copilot",
    position: 0,
    title: "GitHub Codebase Copilot",
    tags: ["nextjs", "ai", "github", "typescript"],
    categories: ["ai", "fullstack"],
    description:
      "Web app for exploring GitHub repositories with a dashboard-style experience: synced repos, overview metadata, file browsing, and architecture-oriented navigation. Built for fast portfolio and codebase discovery with a polished Vercel deployment.",
    shortDescription:
      "GitHub-aware dashboard for exploring repos and codebase context.",
    date: "2026-05-03",
    url: "https://github-codebase-copilot-app.vercel.app/",
    published: true,
    image: "/images/github-codebase-copilot.png",
    gallery: [],
    subtitle: "GitHub Repository & Codebase Explorer",
    problem:
      "Developers and visitors needed a focused way to browse linked GitHub work—stars, languages, activity, and structure—without jumping through multiple GitHub screens.",
    solution:
      "Shipped a Next.js app with repository listings, rich overview panels, and navigation tuned for portfolio and technical storytelling.",
    tech: ["Next.js", "TypeScript", "React", "GitHub integration", "Vercel"],
    features: [
      "Repository dashboard with sync metadata",
      "Overview, README, files, and architecture-oriented views",
      "Theme toggle and responsive layout",
      "Deep links to GitHub for source of truth",
    ],
    metrics: [
      { label: "Deployment", value: "Vercel" },
      { label: "Focus", value: "Repos + docs" },
      { label: "Stack", value: "Next.js" },
    ],
    githubUrl: "https://github.com/eric-nichols-nyc/github-codebase-copilot",
    badges: ["AI", "GitHub", "Portfolio"],
    highlights: [
      "Designed repo-centric navigation and metadata surfaces",
      "Integrated GitHub context for portfolio storytelling",
      "Deployed production app on Vercel",
    ],
  },
];

const projects = [...projectsUnsorted].sort((a, b) => a.position - b.position);

export default projects;
