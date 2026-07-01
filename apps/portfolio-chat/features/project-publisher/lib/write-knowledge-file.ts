export type WriteKnowledgeFileInput = {
  id: string;
  markdown: string;
};

export async function writeKnowledgeFile(
  _input: WriteKnowledgeFileInput
): Promise<void> {
  throw new Error("Not implemented");
}
