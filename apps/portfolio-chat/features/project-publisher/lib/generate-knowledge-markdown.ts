export type GenerateKnowledgeMarkdownInput = {
  readme: string;
  repoUrl: string;
  liveUrl?: string;
};

export async function generateKnowledgeMarkdown(
  input: GenerateKnowledgeMarkdownInput
): Promise<string> {
  const preview = input.readme.trim().slice(0, 400);

  return [
    "---",
    `repo: ${input.repoUrl}`,
    input.liveUrl ? `url: ${input.liveUrl}` : undefined,
    "---",
    "",
    "# Project knowledge (placeholder)",
    "",
    "_Full markdown generation is implemented in Stage 8._",
    "",
    "## README excerpt",
    "",
    preview,
    input.readme.length > preview.length ? "\n\n…" : "",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}
