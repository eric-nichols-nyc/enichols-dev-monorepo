import {
  type ReadGithubReadmeError,
  readGithubReadme,
} from "@/features/project-publisher/lib/read-github-readme";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const repo = { owner: "owner", repo: "repo" };

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

function mockFetch(
  handlers: Record<string, (request: Request) => Response | Promise<Response>>
) {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = getRequestUrl(input);
    const request = new Request(url, init);
    const handler = Object.entries(handlers).find(([pattern]) =>
      url.includes(pattern)
    )?.[1];

    if (!handler) {
      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
    }

    return Promise.resolve(handler(request));
  });
}

describe("readGithubReadme", () => {
  const originalGithubToken = process.env.GITHUB_TOKEN;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    process.env.GITHUB_TOKEN = undefined;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.GITHUB_TOKEN = originalGithubToken;
  });

  it("returns README content on success", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        "/repos/owner/repo/readme": () =>
          new Response("# Hello\n\nProject readme", { status: 200 }),
      })
    );

    await expect(readGithubReadme(repo)).resolves.toBe(
      "# Hello\n\nProject readme"
    );
  });

  it("sends GitHub API headers", async () => {
    process.env.GITHUB_TOKEN = "test-token";

    const fetchMock = mockFetch({
      "/repos/owner/repo/readme": (request) => {
        expect(request.headers.get("Accept")).toBe(
          "application/vnd.github.raw+json"
        );
        expect(request.headers.get("User-Agent")).toBe(
          "portfolio-chat-project-publisher"
        );
        expect(request.headers.get("Authorization")).toBe("Bearer test-token");

        return new Response("readme", { status: 200 });
      },
    });

    vi.stubGlobal("fetch", fetchMock);

    await readGithubReadme(repo);

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("maps rate limit responses", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        "/repos/owner/repo/readme": () => new Response(null, { status: 429 }),
      })
    );

    await expect(readGithubReadme(repo)).rejects.toMatchObject({
      message: "GitHub rate limit exceeded. Try again or set GITHUB_TOKEN.",
      name: "ReadGithubReadmeError",
    } satisfies Partial<ReadGithubReadmeError>);
  });

  it("maps unauthorized responses", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        "/repos/owner/repo/readme": () => new Response(null, { status: 403 }),
      })
    );

    await expect(readGithubReadme(repo)).rejects.toMatchObject({
      message: "Unable to access repository.",
    });
  });

  it("maps missing README responses when the repo exists", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        "/repos/owner/repo/readme": () => new Response(null, { status: 404 }),
        "/repos/owner/repo": () => new Response("{}", { status: 200 }),
      })
    );

    await expect(readGithubReadme(repo)).rejects.toMatchObject({
      message: "README.md not found.",
    });
  });

  it("maps missing repository responses", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        "/repos/owner/repo/readme": () => new Response(null, { status: 404 }),
        "/repos/owner/repo": () => new Response(null, { status: 404 }),
      })
    );

    await expect(readGithubReadme(repo)).rejects.toMatchObject({
      message: "Unable to access repository.",
    });
  });

  it("maps network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down")))
    );

    await expect(readGithubReadme(repo)).rejects.toMatchObject({
      message: "Unable to access repository.",
    });
  });
});
