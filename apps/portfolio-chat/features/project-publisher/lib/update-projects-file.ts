import { access, readFile, writeFile } from "node:fs/promises";
import type { Project } from "@/data/projects";
import projects from "@/data/projects";
import {
  getKnowledgeProjectPath,
  getProjectsFilePath,
} from "@/features/project-publisher/lib/project-publish-paths";
import {
  DuplicateProjectIdError,
  UpdateProjectsFileError,
} from "@/features/project-publisher/lib/publish-errors";
import { serializeProjectObject } from "@/features/project-publisher/lib/serialize-project-object";

const PROJECTS_ARRAY_FOOTER =
  "\n];\n\nconst projects = [...projectsUnsorted].sort((a, b) => a.position - b.position);\n\nexport default projects;\n";

export async function assertProjectIdAvailable(
  projectId: string
): Promise<void> {
  if (projects.some((project) => project.id === projectId)) {
    throw new DuplicateProjectIdError(projectId);
  }

  try {
    await access(getKnowledgeProjectPath(projectId));
    throw new DuplicateProjectIdError(projectId);
  } catch (error) {
    if (error instanceof DuplicateProjectIdError) {
      throw error;
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }

    throw error;
  }
}

export function insertProjectIntoProjectsFile(
  content: string,
  project: Project
): string {
  const footerIndex = content.indexOf(PROJECTS_ARRAY_FOOTER);

  if (footerIndex === -1) {
    throw new UpdateProjectsFileError("projects.ts format is not supported");
  }

  const arrayBody = content.slice(0, footerIndex).trimEnd();
  const serializedProject = serializeProjectObject(project);

  return `${arrayBody},\n${serializedProject}${PROJECTS_ARRAY_FOOTER}`;
}

export async function updateProjectsFile(project: Project): Promise<void> {
  const filePath = getProjectsFilePath();

  try {
    const content = await readFile(filePath, "utf8");
    const updated = insertProjectIntoProjectsFile(content, project);
    await writeFile(filePath, updated, "utf8");
  } catch (error) {
    if (error instanceof UpdateProjectsFileError) {
      throw error;
    }

    console.error("[updateProjectsFile]:", error);
    throw new UpdateProjectsFileError();
  }
}
