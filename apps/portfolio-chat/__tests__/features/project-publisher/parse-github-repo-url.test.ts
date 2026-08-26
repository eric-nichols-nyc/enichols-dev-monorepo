import {
  InvalidGithubRepoUrlError,
  parseGithubRepoUrl,
} from "@/features/project-publisher/utils/parse-github-repo-url";
import { describe, expect, it } from "vitest";

describe("parseGithubRepoUrl", () => {
  it("parses a standard GitHub repository URL", () => {
    expect(parseGithubRepoUrl("https://github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("parses URLs with a trailing slash", () => {
    expect(parseGithubRepoUrl("https://github.com/owner/repo/")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  it("parses tree paths using owner and repo only", () => {
    expect(
      parseGithubRepoUrl("https://github.com/owner/repo/tree/main/packages/app")
    ).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  it("strips a .git suffix from the repo segment", () => {
    expect(parseGithubRepoUrl("https://github.com/owner/repo.git")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  it("trims surrounding whitespace", () => {
    expect(parseGithubRepoUrl("  https://github.com/owner/repo  ")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  it("rejects non-GitHub hosts", () => {
    expect(() =>
      parseGithubRepoUrl("https://gitlab.com/owner/repo")
    ).toThrow(InvalidGithubRepoUrlError);
  });

  it("rejects malformed URLs", () => {
    expect(() => parseGithubRepoUrl("not-a-url")).toThrow(
      InvalidGithubRepoUrlError
    );
  });

  it("rejects GitHub URLs without owner and repo", () => {
    expect(() => parseGithubRepoUrl("https://github.com/owner")).toThrow(
      InvalidGithubRepoUrlError
    );
  });
});
