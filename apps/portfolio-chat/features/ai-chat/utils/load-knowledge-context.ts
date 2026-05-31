import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";
import type { RoutingResult } from "@/features/ai-chat/types/routing-result";
import { getKnowledgeRoot } from "@/features/ai-chat/utils/knowledge-root";
import {
  filterSections,
  parseMarkdown,
} from "@/features/ai-chat/utils/parse-markdown-sections";

const MAX_KNOWLEDGE_FILES = 3;

export type LoadKnowledgeContextOptions = {
  knowledgeRoot?: string;
};

async function readKnowledgeFile(
  knowledgeRoot: string,
  relativePath: string
): Promise<string | null> {
  try {
    return await readFile(path.join(knowledgeRoot, relativePath), "utf8");
  } catch {
    return null;
  }
}

export async function loadKnowledgeContext(
  routingResult: RoutingResult,
  options: LoadKnowledgeContextOptions = {}
): Promise<LoadedKnowledgeContext> {
  const { knowledgePaths, sectionSlices } = routingResult;

  if (!knowledgePaths.length) {
    return { files: [], truncated: false, missingPaths: [] };
  }

  const knowledgeRoot = getKnowledgeRoot(options.knowledgeRoot);
  const truncated = knowledgePaths.length > MAX_KNOWLEDGE_FILES;
  const pathsToLoad = knowledgePaths.slice(0, MAX_KNOWLEDGE_FILES);
  const missingPaths: string[] = [];
  const files: LoadedKnowledgeContext["files"] = [];

  for (const relativePath of pathsToLoad) {
    const raw = await readKnowledgeFile(knowledgeRoot, relativePath);

    if (raw === null) {
      missingPaths.push(relativePath);
      continue;
    }

    const parsed = parseMarkdown(raw);
    const slices = sectionSlices[relativePath];
    let sections = filterSections(parsed.sections, slices);

    if (sections.length === 0 && parsed.sections.length > 0) {
      sections = parsed.sections;
    }

    if (sections.length === 0 && parsed.body) {
      sections = [{ name: "Body", content: parsed.body }];
    }

    files.push({
      path: relativePath,
      title: parsed.title,
      sections,
      rawContent: parsed.body,
    });
  }

  return { files, truncated, missingPaths };
}

export function formatKnowledgeForPrompt(
  context: LoadedKnowledgeContext
): string {
  if (!context.files.length) {
    return "";
  }

  return context.files
    .map((file) => {
      const sectionText = file.sections
        .map((section) => `### ${section.name}\n${section.content}`)
        .join("\n\n");

      return `## ${file.title} (${file.path})\n\n${sectionText}`;
    })
    .join("\n\n---\n\n");
}
