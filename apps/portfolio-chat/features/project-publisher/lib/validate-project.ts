import {
  projectSchema,
  type ValidatedProject,
} from "@/features/project-publisher/lib/schema";
import type { z } from "zod";

const FIELD_LABELS: Record<string, string> = {
  id: "Project ID",
  position: "Position",
  title: "Title",
  tags: "Tags",
  categories: "Categories",
  description: "Description",
  shortDescription: "Short description",
  date: "Date",
  url: "Live URL",
  published: "Published",
  image: "Image path",
  gallery: "Gallery",
  subtitle: "Subtitle",
  problem: "Problem",
  solution: "Solution",
  tech: "Tech stack",
  features: "Features",
  metrics: "Metrics",
  githubUrl: "GitHub URL",
  badges: "Badges",
  highlights: "Highlights",
};

function labelForPath(path: PropertyKey[]): string {
  const segments = path.map(String);

  if (segments.length === 0) {
    return "Project";
  }

  const root = segments[0];
  const rootLabel = FIELD_LABELS[root] ?? root;

  if (segments.length === 1) {
    return rootLabel;
  }

  const nestedPath = segments.slice(1).join(".");
  return `${rootLabel}.${nestedPath}`;
}

function formatInvalidTypeIssue(label: string, issue: z.ZodIssue): string {
  if (issue.code !== "invalid_type") {
    return `${label}: ${issue.message}`;
  }

  if (
    issue.message.includes("undefined") ||
    issue.message.includes("null")
  ) {
    return `${label} is required`;
  }

  return `${label} must be a ${issue.expected}`;
}

function formatTooSmallIssue(label: string, issue: z.ZodIssue): string | null {
  if (issue.code !== "too_small") {
    return null;
  }

  const origin = "origin" in issue ? issue.origin : undefined;

  if (origin === "string" && issue.minimum === 1) {
    return `${label} cannot be empty`;
  }

  if (origin === "array" && issue.minimum === 1) {
    return `${label} must include at least one item`;
  }

  return null;
}

function formatInvalidFormatIssue(
  label: string,
  path: PropertyKey[],
  issue: z.ZodIssue
): string | null {
  if (issue.code !== "invalid_format" || !("format" in issue)) {
    return null;
  }

  if (issue.format === "url") {
    return `${label} must be a valid URL (include https://)`;
  }

  if (issue.format === "regex") {
    if (path[0] === "id") {
      return `${label} must be lowercase letters, numbers, and hyphens only (e.g. my-project)`;
    }

    if (path[0] === "date") {
      return `${label} must use YYYY-MM-DD format`;
    }
  }

  return null;
}

function formatIssue(path: PropertyKey[], issue: z.ZodIssue): string {
  const label = labelForPath(path);

  if (issue.code === "unrecognized_keys") {
    const keys = "keys" in issue ? issue.keys.join(", ") : "unknown";
    return `Remove unexpected field(s): ${keys}`;
  }

  if (issue.code === "invalid_type") {
    return formatInvalidTypeIssue(label, issue);
  }

  if (issue.code === "too_small") {
    const message = formatTooSmallIssue(label, issue);
    if (message) {
      return message;
    }
  }

  if (issue.code === "invalid_format") {
    const message = formatInvalidFormatIssue(label, path, issue);
    if (message) {
      return message;
    }
  }

  if (issue.message && path.length === 0) {
    return issue.message;
  }

  return `${label}: ${issue.message}`;
}

export function formatValidationErrors(
  issues: z.ZodIssue[]
): string[] {
  return issues.map((issue) => formatIssue(issue.path, issue));
}

export type ValidateProjectResult =
  | { success: true; data: ValidatedProject }
  | { success: false; errors: string[] };

export function validateProject(project: unknown): ValidateProjectResult {
  const result = projectSchema.safeParse(project);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatValidationErrors(result.error.issues),
  };
}

export function isValidDraft(result: {
  errors: string[];
  markdown?: string;
  project?: ValidatedProject;
}): result is {
  errors: [];
  markdown: string;
  project: ValidatedProject;
} {
  return (
    result.errors.length === 0 &&
    result.markdown !== undefined &&
    result.project !== undefined
  );
}
