const NON_SLUG_CHARS = /[^a-z0-9]+/g;
const TRIM_HYPHENS = /^-+|-+$/g;

export function repoNameToProjectId(repoName: string): string {
  const normalized = repoName
    .toLowerCase()
    .replace(NON_SLUG_CHARS, "-")
    .replace(TRIM_HYPHENS, "");

  return normalized || "project";
}
