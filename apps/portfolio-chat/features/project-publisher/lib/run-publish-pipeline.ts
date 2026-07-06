import type { Project } from "@/data/projects";
import {
  DuplicateProjectIdError,
  UpdateProjectsFileError,
  WriteKnowledgeFileError,
} from "@/features/project-publisher/lib/publish-errors";
import type { PublishDraft } from "@/features/project-publisher/lib/schema";
import {
  assertProjectIdAvailable,
  updateProjectsFile,
} from "@/features/project-publisher/lib/update-projects-file";
import { validateProject } from "@/features/project-publisher/lib/validate-project";
import {
  deleteKnowledgeFile,
  writeKnowledgeFile,
} from "@/features/project-publisher/lib/write-knowledge-file";

export type PublishPipelineResult = {
  project?: Project;
  errors: string[];
};

export async function runPublishPipeline(
  draft: PublishDraft
): Promise<PublishPipelineResult> {
  const validated = validateProject(draft.project);

  if (!validated.success) {
    return { errors: validated.errors };
  }

  const project = validated.data;
  const markdown = draft.markdown.trim();

  if (markdown.length === 0) {
    return { errors: ["Markdown cannot be empty"] };
  }

  try {
    await assertProjectIdAvailable(project.id);
  } catch (error) {
    if (error instanceof DuplicateProjectIdError) {
      return { errors: [error.message] };
    }

    console.error("[runPublishPipeline]:", error);
    return { errors: ["Publish pipeline failed"] };
  }

  try {
    await writeKnowledgeFile({ id: project.id, markdown });
  } catch (error) {
    if (error instanceof WriteKnowledgeFileError) {
      return { errors: [error.message] };
    }

    console.error("[runPublishPipeline]:", error);
    return { errors: ["Publish pipeline failed"] };
  }

  try {
    await updateProjectsFile(project);
  } catch (error) {
    await deleteKnowledgeFile(project.id).catch((rollbackError) => {
      console.error("[runPublishPipeline rollback]:", rollbackError);
    });

    if (error instanceof UpdateProjectsFileError) {
      return { errors: [error.message] };
    }

    console.error("[runPublishPipeline]:", error);
    return { errors: ["Publish pipeline failed"] };
  }

  return {
    project,
    errors: [],
  };
}
