import path from "node:path";

export function getPortfolioChatRoot(): string {
  return process.cwd();
}

export function getKnowledgeProjectPath(projectId: string): string {
  return path.join(
    getPortfolioChatRoot(),
    "knowledge/projects",
    `${projectId}.md`
  );
}

export function getProjectsFilePath(): string {
  return path.join(getPortfolioChatRoot(), "data/projects.ts");
}
