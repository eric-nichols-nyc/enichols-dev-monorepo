import {
  GenerateKnowledgeMarkdownError,
  generateKnowledgeMarkdown,
} from "@/features/project-publisher/lib/generate-knowledge-markdown";
import {
  GenerateProjectObjectError,
  generateProjectObject,
} from "@/features/project-publisher/lib/generate-project-object";
import {
  ReadGithubReadmeError,
  readGithubReadme,
} from "@/features/project-publisher/lib/read-github-readme";
import type {
  GeneratePipelineInput,
  GeneratePipelineResult,
} from "@/features/project-publisher/lib/schema";
import { validateProject } from "@/features/project-publisher/lib/validate-project";
import {
  InvalidGithubRepoUrlError,
  parseGithubRepoUrl,
} from "@/features/project-publisher/utils/parse-github-repo-url";
import { repoNameToProjectId } from "@/features/project-publisher/utils/repo-name-to-project-id";

export async function runGeneratePipeline(
  input: GeneratePipelineInput
): Promise<GeneratePipelineResult> {
  try {
    const parsedRepo = parseGithubRepoUrl(input.repoUrl);
    const readme = await readGithubReadme(parsedRepo);
    const markdown = await generateKnowledgeMarkdown({
      readme,
      repoUrl: input.repoUrl,
      liveUrl: input.liveUrl,
      projectId: repoNameToProjectId(parsedRepo.repo),
      repoName: parsedRepo.repo,
    });
    const project = await generateProjectObject({
      readme,
      markdown,
      input,
    });
    const validated = validateProject(project);

    if (!validated.success) {
      return {
        errors: validated.errors,
      };
    }

    return {
      readme,
      markdown,
      project: validated.data,
      errors: [],
    };
  } catch (error) {
    if (error instanceof InvalidGithubRepoUrlError) {
      return { errors: [error.message] };
    }

    if (error instanceof ReadGithubReadmeError) {
      return { errors: [error.message] };
    }

    if (error instanceof GenerateKnowledgeMarkdownError) {
      return { errors: [error.message] };
    }

    if (error instanceof GenerateProjectObjectError) {
      return { errors: [error.message] };
    }

    console.error("[runGeneratePipeline]:", error);
    return { errors: ["Generate pipeline failed"] };
  }
}
