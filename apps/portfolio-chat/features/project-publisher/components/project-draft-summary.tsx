import { Badge } from "@repo/design-system/components/ui/badge";
import type { ReactNode } from "react";
import type { Project } from "@/data/projects";

type ProjectDraftSummaryProps = {
  project: Project;
};

type SummaryFieldProps = {
  label: string;
  value: ReactNode;
};

function SummaryField({ label, value }: SummaryFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function SummaryLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="break-all text-primary underline-offset-4 hover:underline"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function StringList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-muted-foreground">None</span>;
  }

  return (
    <ul className="list-inside list-disc space-y-0.5">
      {items.map((item) => (
        <li className="break-words" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ProjectDraftSummary({ project }: ProjectDraftSummaryProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <SummaryField label="Project ID" value={project.id} />
      <SummaryField label="Title" value={project.title} />
      {project.subtitle ? (
        <SummaryField label="Subtitle" value={project.subtitle} />
      ) : null}
      <SummaryField
        label="Published"
        value={project.published ? "Yes" : "No"}
      />
      <SummaryField label="Position" value={project.position} />
      <SummaryField label="Date" value={project.date} />
      <SummaryField
        label="Short description"
        value={project.shortDescription}
      />
      <SummaryField label="Description" value={project.description} />
      <SummaryField
        label="Tags"
        value={
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        }
      />
      <SummaryField
        label="Categories"
        value={
          <div className="flex flex-wrap gap-1.5">
            {project.categories.map((category) => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
          </div>
        }
      />
      <SummaryField
        label="Live URL"
        value={<SummaryLink href={project.url} label={project.url} />}
      />
      {project.githubUrl ? (
        <SummaryField
          label="GitHub URL"
          value={
            <SummaryLink href={project.githubUrl} label={project.githubUrl} />
          }
        />
      ) : null}
      <SummaryField label="Image" value={project.image} />
      <SummaryField
        label="Gallery"
        value={<StringList items={project.gallery} />}
      />
      {(project.tech?.length ?? 0) > 0 ? (
        <SummaryField
          label="Tech"
          value={<StringList items={project.tech ?? []} />}
        />
      ) : null}
      {(project.features?.length ?? 0) > 0 ? (
        <SummaryField
          label="Features"
          value={<StringList items={project.features ?? []} />}
        />
      ) : null}
      {(project.highlights?.length ?? 0) > 0 ? (
        <SummaryField
          label="Highlights"
          value={<StringList items={project.highlights ?? []} />}
        />
      ) : null}
      {(project.metrics?.length ?? 0) > 0 ? (
        <SummaryField
          label="Metrics"
          value={
            <ul className="space-y-1">
              {(project.metrics ?? []).map((metric) => (
                <li className="text-sm" key={`${metric.label}-${metric.value}`}>
                  <span className="font-medium">{metric.label}:</span>{" "}
                  {metric.value}
                </li>
              ))}
            </ul>
          }
        />
      ) : null}
    </dl>
  );
}
