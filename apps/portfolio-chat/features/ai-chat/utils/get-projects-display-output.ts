import projects from "@/data/projects";

/** Shared payload for project display in both direct and model tool responses. */
export function getProjectsDisplayOutput() {
  return {
    projectCount: projects.length,
    projects,
    related: [
      "Tell me about a specific project",
      "What technologies do you use?",
      "Show me your experience",
    ],
  };
}
