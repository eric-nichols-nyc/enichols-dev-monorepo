export type ParsedGithubRepo = {
  owner: string;
  repo: string;
};

export class InvalidGithubRepoUrlError extends Error {
  constructor(message = "Invalid GitHub repository URL") {
    super(message);
    this.name = "InvalidGithubRepoUrlError";
  }
}

export function parseGithubRepoUrl(url: string): ParsedGithubRepo {
  let parsed: URL;

  try {
    parsed = new URL(url.trim());
  } catch {
    throw new InvalidGithubRepoUrlError();
  }

  if (parsed.hostname.toLowerCase() !== "github.com") {
    throw new InvalidGithubRepoUrlError();
  }

  const segments = parsed.pathname.split("/").filter(Boolean);

  if (segments.length < 2) {
    throw new InvalidGithubRepoUrlError();
  }

  const owner = segments[0];
  const repo = segments[1]?.replace(/\.git$/, "");

  if (!owner || !repo) {
    throw new InvalidGithubRepoUrlError();
  }

  return { owner, repo };
}
