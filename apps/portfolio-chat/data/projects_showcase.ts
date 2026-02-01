import type {
  Brain,
  ChefHat,
  FileText,
  HelpCircle,
  List,
  LucideIcon,
  MessageSquare,
} from "lucide-react";

// Type definitions
type ProjectMetric = {
  label: string;
  value: string;
};

type FeaturedProject = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  problem: string;
  solution: string;
  tech: string[];
  features: string[];
  metrics: ProjectMetric[];
  demoUrl: string;
  githubUrl: string;
  image: string;
  badges: string[];
  highlights: string[];
};

type AIProject = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  features: string[];
  demoUrl: string;
  githubUrl: string;
  icon: React.ReactElement<LucideIcon>;
  badge: string;
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "audiograph",
    title: "AudioGraph",
    subtitle: "Artist Analytics Platform",
    description:
      "Comprehensive dual-app system tracking music artists across platforms with automated data collection and comparative analytics.",
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
    demoUrl: "https://audiograph.vercel.app/",
    githubUrl: "https://github.com/eric-nichols-nyc/audiograph",
    image: "/api/placeholder/600/400",
    badges: ["Full Stack", "API Integration", "Real-time Data"],
    highlights: [
      "Architected scalable data collection system",
      "Implemented secure multi-tenant architecture",
      "Built responsive admin and client interfaces",
    ],
  },
  {
    id: "ai-taskwizard",
    title: "AI-TaskWizard",
    subtitle: "Microfrontend Productivity Suite",
    description:
      "Enterprise-scale microfrontend architecture with 6 integrated applications sharing UI, auth, and design system packages.",
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
    demoUrl: "https://ai-taskwizard-host.vercel.app/",
    image: "/images/taskwizard.png",
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
    title: "Trellnode",
    subtitle: "Kanban Board Application",
    description:
      "Full-stack Kanban board application for task and project management with drag-and-drop boards, real-time updates, and a flexible NoSQL backend.",
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
    demoUrl: "https://trellnode.vercel.app/",
    githubUrl: "https://github.com/eric-nichols-nyc/trellnode",
    image: "/images/trellnode.png",
    badges: ["Full Stack", "NoSQL", "API"],
    highlights: [
      "Architected RESTful API with MongoDB",
      "Implemented drag-and-drop board UX",
      "Built responsive task management interface",
    ],
  },
];

export const aiProjects: AIProject[] = [
    {
      id: 'moodflix',
      title: 'MoodFlix',
      subtitle: 'AI Movie Recommendation Engine',
      description: 'Sentiment analysis pipeline that recommends movies based on user mood detection.',
      tech: ['React', 'Node.js', 'Sentiment Analysis API', 'TMDB API'],
      features: ['Real-time mood detection', 'Personalized recommendations', 'Movie database integration'],
      demoUrl: '#',
      githubUrl: '#',
      icon: <Brain className="w-6 h-6" />,
      badge: 'AI-Powered'
    },
    {
      id: 'ai-interview',
      title: 'AI Interview Assistant',
      subtitle: 'Life-like Interview Simulation',
      description: 'Conversational AI that conducts realistic job interviews with real-time feedback.',
      tech: ['React', 'OpenAI API', 'Speech Recognition', 'WebRTC'],
      features: ['Natural conversation flow', 'Real-time feedback', 'Interview analytics'],
      demoUrl: '#',
      githubUrl: '#',
      icon: <MessageSquare className="w-6 h-6" />,
      badge: 'AI-Powered'
    },
    {
      id: 'ai-resume',
      title: 'AI Resume Builder',
      subtitle: 'Smart Resume Generation',
      description: 'AI-powered resume builder with intelligent content suggestions and optimization.',
      tech: ['Next.js 14', 'Google Gemini API', 'PDF.js', 'Tailwind CSS'],
      features: ['AI content suggestions', 'PDF export', 'Multiple templates'],
      demoUrl: '#',
      githubUrl: '#',
      icon: <FileText className="w-6 h-6" />,
      badge: 'AI-Powered'
    },
    {
      id: 'ai-quiz',
      title: 'AI Quiz Generator',
      subtitle: 'PDF to Quiz Conversion',
      description: 'Upload PDFs and generate interactive quizzes using AI content analysis.',
      tech: ['React', 'PDF Processing', 'OpenAI API', 'Question Generation'],
      features: ['PDF text extraction', 'Smart question generation', 'Interactive quiz type'],
      demoUrl: '#',
      githubUrl: '#',
      icon: <HelpCircle className="w-6 h-6" />,
      badge: 'AI-Powered'
    },
    {
      id: 'ai-todo',
      title: 'AI Todo Assistant',
      subtitle: 'Smart Task Management',
      description: 'Todo list that uses AI tools to populate tasks from chatbot conversations.',
      tech: ['React', 'AI Integration', 'Task Management', 'Natural Language Processing'],
      features: ['Chatbot integration', 'Smart task extraction', 'Priority suggestions'],
      demoUrl: '#',
      githubUrl: '#',
      icon: <List className="w-6 h-6" />,
      badge: 'AI-Powered'
    },
    {
      id: 'ai-recipe',
      title: 'AI Recipe Generator',
      subtitle: 'Personalized Recipe Creation',
      description: 'Generate custom recipes based on ingredients, dietary restrictions, and preferences.',
      tech: ['React', 'Recipe API', 'AI Content Generation', 'Nutrition Analysis'],
      features: ['Ingredient-based generation', 'Dietary customization', 'Nutrition tracking'],
      demoUrl: '#',
      githubUrl: '#',
      icon: <ChefHat className="w-6 h-6" />,
      badge: 'AI-Powered'
    }
  ];
