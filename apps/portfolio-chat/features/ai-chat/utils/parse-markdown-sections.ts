export type ParsedMarkdown = {
  frontmatter: Record<string, string>;
  title: string;
  sections: { name: string; content: string }[];
  body: string;
};

function parseFrontmatter(raw: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  if (!raw.startsWith("---")) {
    return { frontmatter: {}, body: raw };
  }

  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatterBlock = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, "");
  const frontmatter: Record<string, string> = {};

  for (const line of frontmatterBlock.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function extractTitle(body: string, frontmatter: Record<string, string>): string {
  if (frontmatter.title) {
    return frontmatter.title.replace(/^["']|["']$/g, "");
  }

  const h1Match = body.match(/^#\s+(.+)$/m);
  return h1Match?.[1]?.trim() ?? "Untitled";
}

function stripDocumentTitle(body: string): string {
  return body.replace(/^#\s+.+\n+/, "");
}

function splitSections(body: string): { name: string; content: string }[] {
  const withoutTitle = stripDocumentTitle(body);
  const parts = withoutTitle.split(/^##\s+/m).filter(Boolean);
  if (parts.length === 0) {
    return [];
  }

  const sections: { name: string; content: string }[] = [];

  for (const part of parts) {
    const newlineIndex = part.indexOf("\n");
    if (newlineIndex === -1) {
      sections.push({ name: part.trim(), content: "" });
      continue;
    }

    const name = part.slice(0, newlineIndex).trim();
    const content = part.slice(newlineIndex + 1).trim();

    if (!name || name.startsWith("#")) {
      continue;
    }

    sections.push({ name, content });
  }

  return sections;
}

export function parseMarkdown(raw: string): ParsedMarkdown {
  const { frontmatter, body } = parseFrontmatter(raw);
  const title = extractTitle(body, frontmatter);
  const sections = splitSections(body);

  return {
    frontmatter,
    title,
    sections,
    body: body.trim(),
  };
}

export function filterSections(
  sections: { name: string; content: string }[],
  sliceNames: string[] | undefined
): { name: string; content: string }[] {
  if (!sliceNames?.length) {
    return sections;
  }

  const normalizedSlices = sliceNames.map((name) => name.toLowerCase());

  return sections.filter((section) =>
    normalizedSlices.some(
      (slice) =>
        section.name.toLowerCase() === slice ||
        section.name.toLowerCase().includes(slice)
    )
  );
}
