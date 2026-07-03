import { generateKnowledgeMarkdown } from "@/features/project-publisher/lib/generate-knowledge-markdown";
import { generateProjectObject } from "@/features/project-publisher/lib/generate-project-object";
import {
  ReadGithubReadmeError,
  readGithubReadme,
} from "@/features/project-publisher/lib/read-github-readme";
import type {
  GeneratePipelineInput,
  GeneratePipelineResult,
} from "@/features/project-publisher/lib/schema";
import { projectSchema } from "@/features/project-publisher/lib/schema";
import {
  InvalidGithubRepoUrlError,
  parseGithubRepoUrl,
} from "@/features/project-publisher/utils/parse-github-repo-url";

function formatValidationErrors(
  issues: { path: PropertyKey[]; message: string }[]
): string[] {
  return issues.map((issue) => {
    const path = issue.path.map(String).join(".");

    if (!path) {
      return issue.message;
    }

    return `${path}: ${issue.message}`;
  });
}

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
    });
    const project = await generateProjectObject({
      readme,
      markdown,
      input,
    });
    const validated = projectSchema.safeParse(project);

    if (!validated.success) {
      return {
        readme,
        markdown,
        errors: formatValidationErrors(validated.error.issues),
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

    console.error("[runGeneratePipeline]:", error);
    return { errors: ["Generate pipeline failed"] };
  }
}
