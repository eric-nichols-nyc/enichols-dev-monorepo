import type { ParsedGithubRepo } from "@/features/project-publisher/utils/parse-github-repo-url";

const GITHUB_API_BASE = "https://api.github.com";
const USER_AGENT = "portfolio-chat-project-publisher";

export class ReadGithubReadmeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReadGithubReadmeError";
  }
}

function buildGithubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": USER_AGENT,
  };

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function githubRepoExists(
  owner: string,
  repo: string,
  headers: HeadersInit
): Promise<boolean> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers,
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function readGithubReadme(
  repo: ParsedGithubRepo
): Promise<string> {
  const { owner, repo: repoName } = repo;
  const headers = buildGithubHeaders();
  const readmeUrl = `${GITHUB_API_BASE}/repos/${owner}/${repoName}/readme`;

  let response: Response;

  try {
    response = await fetch(readmeUrl, { headers });
  } catch {
    throw new ReadGithubReadmeError("Unable to access repository.");
  }

  if (response.ok) {
    const readme = await response.text();

    if (!readme.trim()) {
      throw new ReadGithubReadmeError("README.md not found.");
    }

    return readme;
  }

  if (response.status === 429) {
    throw new ReadGithubReadmeError(
      "GitHub rate limit exceeded. Try again or set GITHUB_TOKEN."
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new ReadGithubReadmeError("Unable to access repository.");
  }

  if (response.status === 404) {
    const exists = await githubRepoExists(owner, repoName, headers);

    if (!exists) {
      throw new ReadGithubReadmeError("Unable to access repository.");
    }

    throw new ReadGithubReadmeError("README.md not found.");
  }

  throw new ReadGithubReadmeError("Unable to access repository.");
}
