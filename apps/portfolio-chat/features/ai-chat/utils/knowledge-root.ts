import path from "node:path";

/** Server-only path to `apps/portfolio-chat/knowledge/`. */
export function getKnowledgeRoot(override?: string): string {
  return override ?? path.join(process.cwd(), "knowledge");
}
