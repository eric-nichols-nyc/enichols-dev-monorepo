import type { Project } from "@/data/projects";
import { generateObject } from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import {
  buildProjectObjectUserPrompt,
  getProjectObjectSystemPrompt,
} from "@/features/project-publisher/lib/prompts";
import type {
  GeneratePipelineInput,
  ProjectGenerationFields,
} from "@/features/project-publisher/lib/schema";
import { projectGenerationSchema } from "@/features/project-publisher/lib/schema";
import { parseGithubRepoUrl } from "@/features/project-publisher/utils/parse-github-repo-url";
import { repoNameToProjectId } from "@/features/project-publisher/utils/repo-name-to-project-id";

export type GenerateProjectObjectInput = {
  readme: string;
  markdown: string;
  input: GeneratePipelineInput;
};

export class GenerateProjectObjectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerateProjectObjectError";
  }
}

function assertOpenAiConfigured(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new GenerateProjectObjectError("OPENAI_API_KEY is not configured.");
  }
}

export function mergeAdminProjectFields(
  generated: ProjectGenerationFields,
  input: GeneratePipelineInput
): Project {
  const githubUrl = input.repoUrl.trim();
  const liveUrl = input.liveUrl?.trim();

  return {
    ...generated,
    githubUrl: generated.githubUrl ?? githubUrl,
    url: liveUrl && liveUrl.length > 0 ? liveUrl : githubUrl,
    image: input.image,
    gallery: input.gallery,
    position: input.position ?? 99,
    published: input.published ?? false,
  };
}

export async function generateProjectObject({
  readme,
  markdown,
  input,
}: GenerateProjectObjectInput): Promise<Project> {
  assertOpenAiConfigured();

  const parsed = parseGithubRepoUrl(input.repoUrl);
  const projectId = repoNameToProjectId(parsed.repo);

  try {
    const result = await generateObject({
      // biome-ignore lint/suspicious/noExplicitAny: Provider model versions differ across SDK packages in this monorepo
      model: models.chat as any,
      schema: projectGenerationSchema,
      system: getProjectObjectSystemPrompt(),
      prompt: buildProjectObjectUserPrompt({
        readme,
        markdown,
        repoUrl: input.repoUrl,
        liveUrl: input.liveUrl,
        projectId,
        repoName: parsed.repo,
      }),
    });

    return mergeAdminProjectFields(result.object, input);
  } catch (error) {
    if (error instanceof GenerateProjectObjectError) {
      throw error;
    }

    console.error("[generateProjectObject]:", error);
    throw new GenerateProjectObjectError("Failed to generate project object.");
  }
}
