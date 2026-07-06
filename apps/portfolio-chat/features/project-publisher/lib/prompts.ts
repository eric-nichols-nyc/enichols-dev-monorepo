const KNOWLEDGE_MARKDOWN_SECTIONS = [
  "Overview",
  "Problem",
  "Solution",
  "Tech Stack",
  "Architecture",
  "Key Features",
  "Challenges",
  "Lessons Learned",
  "Links",
  "Metrics",
] as const;

export function getKnowledgeMarkdownSystemPrompt(): string {
  return `You are a technical writer preparing portfolio knowledge documents for Eric Nichols' developer portfolio.

Write a single markdown file that matches the existing corpus in knowledge/projects/*.md.

## Required structure

1. YAML frontmatter between --- delimiters with:
   - id: lowercase slug (letters, numbers, hyphens only)
   - title: human-readable project name
   - tags: YAML array of lowercase kebab-case tags inferred from the README
   - categories: YAML array using portfolio categories when possible (e.g. ai, fullstack, web, health)

2. A level-1 heading (# Title) matching the frontmatter title.

3. These level-2 sections in order:
${KNOWLEDGE_MARKDOWN_SECTIONS.map((section) => `   - ## ${section}`).join("\n")}

## Section guidance

- Overview: 2–4 sentences summarizing what the project is and who it is for.
- Problem: the user or business pain the project addresses.
- Solution: what was built and the core approach (write in third person about Eric's work when appropriate).
- Tech Stack: bullet list of major technologies.
- Architecture: bullet list describing apps, data flow, deployment, or major components.
- Key Features: bullet list of notable capabilities.
- Challenges: bullet list of meaningful engineering challenges.
- Lessons Learned: bullet list of takeaways.
- Links: markdown links for GitHub and live demo when URLs are provided.
- Metrics: markdown table with columns "Metric" and "Value". Use realistic placeholders only when the README implies scale; otherwise omit rows you cannot infer.

## Rules

- Output markdown only. No code fences wrapping the full document.
- Do not invent live URLs that were not provided.
- Ground claims in the README; you may reasonable infer stack and architecture from dependencies and structure.
- Keep prose professional, concise, and suitable for recruiters and hiring managers.
- Use the suggested project id when it fits the repo name.`;
}

export type BuildKnowledgeMarkdownUserPromptInput = {
  readme: string;
  repoUrl: string;
  liveUrl?: string;
  projectId: string;
  repoName: string;
};

const MAX_README_CHARS = 12_000;

export function buildKnowledgeMarkdownUserPrompt(
  input: BuildKnowledgeMarkdownUserPromptInput
): string {
  const trimmedReadme = input.readme.trim();
  const readmeForPrompt =
    trimmedReadme.length > MAX_README_CHARS
      ? `${trimmedReadme.slice(0, MAX_README_CHARS)}\n\n[README truncated for length]`
      : trimmedReadme;

  return [
    "Generate the knowledge markdown file for this repository.",
    "",
    `Suggested project id: ${input.projectId}`,
    `Repository name: ${input.repoName}`,
    `GitHub URL: ${input.repoUrl}`,
    input.liveUrl ? `Live URL: ${input.liveUrl}` : "Live URL: (not provided)",
    "",
    "README:",
    readmeForPrompt,
  ].join("\n");
}

export function getProjectObjectSystemPrompt(): string {
  return `You are preparing structured portfolio project metadata for Eric Nichols' developer portfolio.

Generate JSON matching the schema for a Project entry used in data/projects.ts and featured project artifacts.

## Field guidance

- id: lowercase slug with hyphens only (letters and numbers). Prefer the suggested project id when it fits the repo.
- title: human-readable product name.
- tags: 3–6 lowercase technology or domain tags (e.g. nextjs, typescript, ai).
- categories: 1–3 portfolio categories such as ai, fullstack, web, health.
- description: 2–4 sentences for project cards and detail views.
- shortDescription: one concise sentence under 120 characters.
- date: ISO date YYYY-MM-DD — use README release hints or a reasonable estimate.
- subtitle, problem, solution: concise artifact copy grounded in the knowledge document.
- tech: major frameworks, languages, and services.
- features: user-facing capabilities as short phrases.
- metrics: optional label/value pairs when scale is implied; omit if unknown.
- githubUrl: repository URL when known.
- badges: 2–4 short skill/theme labels (e.g. Full Stack, API Integration).
- highlights: 2–4 accomplishment bullets for recruiters.

## Rules

- Ground content in the README and generated knowledge markdown.
- Do not invent live demo URLs.
- Write in professional third person about Eric's work when describing solutions.
- Do not output image paths, gallery paths, position, published flag, or live site url — the admin supplies those separately.`;
}

export type BuildProjectObjectUserPromptInput = {
  readme: string;
  markdown: string;
  repoUrl: string;
  liveUrl?: string;
  projectId: string;
  repoName: string;
};

export function buildProjectObjectUserPrompt(
  input: BuildProjectObjectUserPromptInput
): string {
  const trimmedReadme = input.readme.trim();
  const readmeForPrompt =
    trimmedReadme.length > MAX_README_CHARS
      ? `${trimmedReadme.slice(0, MAX_README_CHARS)}\n\n[README truncated for length]`
      : trimmedReadme;
  const trimmedMarkdown = input.markdown.trim();
  const markdownForPrompt =
    trimmedMarkdown.length > MAX_README_CHARS
      ? `${trimmedMarkdown.slice(0, MAX_README_CHARS)}\n\n[Markdown truncated for length]`
      : trimmedMarkdown;

  return [
    "Generate the portfolio Project object for this repository.",
    "",
    `Suggested project id: ${input.projectId}`,
    `Repository name: ${input.repoName}`,
    `GitHub URL: ${input.repoUrl}`,
    input.liveUrl
      ? `Live URL (admin-provided — do not emit url field): ${input.liveUrl}`
      : "Live URL: (not provided — url will default to GitHub)",
    "",
    "Generated knowledge markdown:",
    markdownForPrompt,
    "",
    "README:",
    readmeForPrompt,
  ].join("\n");
}

const MARKDOWN_FENCE_PATTERN = /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/;

export function stripMarkdownCodeFence(text: string): string {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(MARKDOWN_FENCE_PATTERN);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  return trimmed;
}
