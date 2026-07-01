import type { ParsedGithubRepo } from "@/features/project-publisher/utils/parse-github-repo-url";

export class ReadGithubReadmeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReadGithubReadmeError";
  }
}

export async function readGithubReadme(
  _repo: ParsedGithubRepo
): Promise<string> {
  throw new ReadGithubReadmeError("Not implemented");
}
