import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getKnowledgeProjectPath } from "@/features/project-publisher/lib/project-publish-paths";
import { WriteKnowledgeFileError } from "@/features/project-publisher/lib/publish-errors";

export type WriteKnowledgeFileInput = {
  id: string;
  markdown: string;
};

export async function writeKnowledgeFile({
  id,
  markdown,
}: WriteKnowledgeFileInput): Promise<void> {
  const filePath = getKnowledgeProjectPath(id);

  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, markdown, "utf8");
  } catch (error) {
    console.error("[writeKnowledgeFile]:", error);
    throw new WriteKnowledgeFileError();
  }
}

export async function deleteKnowledgeFile(projectId: string): Promise<void> {
  const filePath = getKnowledgeProjectPath(projectId);

  try {
    await unlink(filePath);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }

    console.error("[deleteKnowledgeFile]:", error);
    throw new WriteKnowledgeFileError("Failed to roll back knowledge file");
  }
}
