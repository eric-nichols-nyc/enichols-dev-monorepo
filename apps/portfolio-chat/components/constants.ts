import {
  Briefcase,
  Code2,
  FolderOpen,
  Github,
  Instagram,
  Linkedin,
  User,
} from "lucide-react";

export const SIDEBAR_WIDTH_EXPANDED = "16rem";
export const SIDEBAR_WIDTH_COLLAPSED = "4rem";

export const SIDEBAR_BRAND_SUBTITLE = "Ask about my work";

export const NAV_ITEMS = [
  {
    id: "projects",
    label: "Projects",
    icon: FolderOpen,
    message: "Show projects",
  },
  { id: "about", label: "About", icon: User, message: "About Me" },
  {
    id: "experience",
    label: "Experience",
    icon: Briefcase,
    message: "Show my work experience",
  },
  { id: "tech", label: "Tech", icon: Code2, message: "Tech stack" },
] as const;

export type NavItemId = (typeof NAV_ITEMS)[number]["id"];

export const socialLinks = [
  {
    href: "https://github.com/eric-nichols-nyc",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://instagram.com/ebn646/",
    icon: Instagram,
    label: "Instagram",
  },
  {
    href: "https://www.linkedin.com/in/eric-nichols-ab509118/",
    icon: Linkedin,
    label: "LinkedIn",
  },
];
