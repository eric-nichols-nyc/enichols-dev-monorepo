import { generateText } from "@repo/ai";
import { models } from "@repo/ai/lib/models";
import {
  buildKnowledgeMarkdownUserPrompt,
  getKnowledgeMarkdownSystemPrompt,
  stripMarkdownCodeFence,
} from "@/features/project-publisher/lib/prompts";

export type GenerateKnowledgeMarkdownInput = {
  readme: string;
  repoUrl: string;
  liveUrl?: string;
  projectId: string;
  repoName: string;
};

export class GenerateKnowledgeMarkdownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerateKnowledgeMarkdownError";
  }
}

function assertOpenAiConfigured(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new GenerateKnowledgeMarkdownError(
      "OPENAI_API_KEY is not configured."
    );
  }
}

export async function generateKnowledgeMarkdown(
  input: GenerateKnowledgeMarkdownInput
): Promise<string> {
  assertOpenAiConfigured();

  try {
    const result = await generateText({
      // biome-ignore lint/suspicious/noExplicitAny: Provider model versions differ across SDK packages in this monorepo
      model: models.chat as any,
      system: getKnowledgeMarkdownSystemPrompt(),
      prompt: buildKnowledgeMarkdownUserPrompt(input),
    });

    const markdown = stripMarkdownCodeFence(result.text);

    if (!markdown.startsWith("---")) {
      throw new GenerateKnowledgeMarkdownError(
        "Generated markdown is missing YAML frontmatter."
      );
    }

    return markdown;
  } catch (error) {
    if (error instanceof GenerateKnowledgeMarkdownError) {
      throw error;
    }

    console.error("[generateKnowledgeMarkdown]:", error);
    throw new GenerateKnowledgeMarkdownError(
      "Failed to generate knowledge markdown."
    );
  }
}
