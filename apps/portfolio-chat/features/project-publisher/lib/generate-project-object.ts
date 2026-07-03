import type { Project } from "@/data/projects";
import type { GeneratePipelineInput } from "@/features/project-publisher/lib/schema";
import { parseGithubRepoUrl } from "@/features/project-publisher/utils/parse-github-repo-url";

export type GenerateProjectObjectInput = {
  readme: string;
  markdown: string;
  input: GeneratePipelineInput;
};

const NON_SLUG_CHARS = /[^a-z0-9]+/g;
const TRIM_HYPHENS = /^-+|-+$/g;
const HEADING_PREFIX = /^#+\s*/;
const PARAGRAPH_BREAK = /\n\s*\n/;

function repoNameToProjectId(repoName: string): string {
  const normalized = repoName
    .toLowerCase()
    .replace(NON_SLUG_CHARS, "-")
    .replace(TRIM_HYPHENS, "");

  return normalized || "project";
}

function buildPlaceholderDescription(readme: string): string {
  const firstParagraph = readme
    .split(PARAGRAPH_BREAK)
    .map((block) => block.replace(HEADING_PREFIX, "").trim())
    .find(Boolean);

  if (!firstParagraph) {
    return "Placeholder project description.";
  }

  return firstParagraph.slice(0, 280);
}

export function generateProjectObject({
  readme,
  input,
}: GenerateProjectObjectInput): Project {
  const parsed = parseGithubRepoUrl(input.repoUrl);
  const id = repoNameToProjectId(parsed.repo);
  const title = parsed.repo;
  const description = buildPlaceholderDescription(readme);
  const githubUrl = input.repoUrl.trim();

  return {
    id,
    position: input.position ?? 99,
    title,
    tags: ["placeholder"],
    categories: ["web"],
    description,
    shortDescription: description.slice(0, 120),
    date: new Date().toISOString().slice(0, 10),
    url: input.liveUrl ?? githubUrl,
    published: input.published ?? false,
    image: input.image,
    gallery: input.gallery,
    githubUrl,
    subtitle: `${title} (placeholder)`,
  };
}
