import type { Project, ProjectMetric } from "@/data/projects";

function serializeString(value: string): string {
  return JSON.stringify(value);
}

function serializeStringArray(items: string[], fieldIndent: string): string {
  if (items.length === 0) {
    return "[]";
  }

  const lines = items.map(
    (item) => `${fieldIndent}  ${serializeString(item)},`
  );
  return `[\n${lines.join("\n")}\n${fieldIndent}]`;
}

function serializeMetrics(
  metrics: ProjectMetric[],
  fieldIndent: string
): string {
  const lines = metrics.map(
    (metric) =>
      `${fieldIndent}  { label: ${serializeString(metric.label)}, value: ${serializeString(metric.value)} },`
  );
  return `[\n${lines.join("\n")}\n${fieldIndent}]`;
}

export function serializeProjectObject(project: Project): string {
  const fieldIndent = "    ";
  const lines = [
    "  {",
    `${fieldIndent}id: ${serializeString(project.id)},`,
    `${fieldIndent}position: ${project.position},`,
    `${fieldIndent}title: ${serializeString(project.title)},`,
    `${fieldIndent}tags: ${serializeStringArray(project.tags, fieldIndent)},`,
    `${fieldIndent}categories: ${serializeStringArray(project.categories, fieldIndent)},`,
    `${fieldIndent}description: ${serializeString(project.description)},`,
    `${fieldIndent}shortDescription: ${serializeString(project.shortDescription)},`,
    `${fieldIndent}date: ${serializeString(project.date)},`,
    `${fieldIndent}url: ${serializeString(project.url)},`,
    `${fieldIndent}published: ${project.published},`,
    `${fieldIndent}image: ${serializeString(project.image)},`,
    `${fieldIndent}gallery: ${serializeStringArray(project.gallery, fieldIndent)},`,
  ];

  if (project.subtitle) {
    lines.push(`${fieldIndent}subtitle: ${serializeString(project.subtitle)},`);
  }

  if (project.problem) {
    lines.push(`${fieldIndent}problem: ${serializeString(project.problem)},`);
  }

  if (project.solution) {
    lines.push(`${fieldIndent}solution: ${serializeString(project.solution)},`);
  }

  if (project.tech && project.tech.length > 0) {
    lines.push(
      `${fieldIndent}tech: ${serializeStringArray(project.tech, fieldIndent)},`
    );
  }

  if (project.features && project.features.length > 0) {
    lines.push(
      `${fieldIndent}features: ${serializeStringArray(project.features, fieldIndent)},`
    );
  }

  if (project.metrics && project.metrics.length > 0) {
    lines.push(
      `${fieldIndent}metrics: ${serializeMetrics(project.metrics, fieldIndent)},`
    );
  }

  if (project.githubUrl) {
    lines.push(
      `${fieldIndent}githubUrl: ${serializeString(project.githubUrl)},`
    );
  }

  if (project.badges && project.badges.length > 0) {
    lines.push(
      `${fieldIndent}badges: ${serializeStringArray(project.badges, fieldIndent)},`
    );
  }

  if (project.highlights && project.highlights.length > 0) {
    lines.push(
      `${fieldIndent}highlights: ${serializeStringArray(project.highlights, fieldIndent)},`
    );
  }

  lines.push("  }");
  return lines.join("\n");
}
