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

const MARKDOWN_FENCE_PATTERN = /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/;

export function stripMarkdownCodeFence(text: string): string {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(MARKDOWN_FENCE_PATTERN);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  return trimmed;
}
