export type GenerateKnowledgeMarkdownInput = {
  readme: string;
  repoUrl: string;
  liveUrl?: string;
};

export async function generateKnowledgeMarkdown(
  _input: GenerateKnowledgeMarkdownInput
): Promise<string> {
  throw new Error("Not implemented");
}
