import type { Project } from "@/data/projects";
import { FeaturedProject } from "@/components/featured-project";
import { ProjectQuestions } from "@/features/project-details/components/project-questions";

export function ProjectDetail({ project }: { project: Project }) {
  return <FeaturedProject afterOverview={<ProjectQuestions key={project.id} project={project} />} project={project} />;
}
