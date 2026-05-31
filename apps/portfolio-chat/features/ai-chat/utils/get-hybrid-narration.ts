import type { LoadedKnowledgeContext } from "@/features/ai-chat/types/loaded-knowledge-context";

export function getHybridNarration(
  context: LoadedKnowledgeContext
): string | null {
  const file = context.files[0];
  if (!file) {
    return null;
  }

  const overview = file.sections.find(
    (section) => section.name.toLowerCase() === "overview"
  );
  const source = overview?.content ?? file.sections[0]?.content;
  if (!source) {
    return null;
  }

  const paragraph = source.split("\n\n")[0]?.trim();
  return paragraph || null;
}
